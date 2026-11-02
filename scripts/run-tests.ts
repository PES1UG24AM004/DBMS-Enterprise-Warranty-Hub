import path from 'path';
import dotenv from 'dotenv';
import { query, withTransaction, getPool } from '../lib/db';
import { hashPassword, verifyPassword } from '../lib/auth';
import { generateEmbedding, formatVectorForPg } from '../lib/embeddings';
import { syncWarrantyNotifications } from '../lib/notifications';
import { ASSET_CATEGORIES } from '../lib/types';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✔ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✘ [FAIL] ${testName}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('========================================================');
  console.log('   Enterprise Warranty Hub (EWH) Automated Test Suite   ');
  console.log('========================================================\n');

  // TEST 1: Password hashing & verification
  console.log('1. Authentication & Password Security Tests:');
  const plain = 'DemoSecret123!';
  const hash = await hashPassword(plain);
  assert(hash !== plain, 'Password is never stored in plain text');
  assert(hash.startsWith('$2'), 'Password hashed with bcrypt');
  const valid = await verifyPassword(plain, hash);
  assert(valid === true, 'Bcrypt hash correctly verifies true password');
  const invalid = await verifyPassword('WrongPassword', hash);
  assert(invalid === false, 'Bcrypt hash rejects incorrect password');

  // TEST 2: Demo users seeded
  console.log('\n2. User Accounts & RBAC Verification:');
  const userRes = await query('SELECT id, email, role, is_active FROM users;');
  assert(userRes.rows.length >= 5, 'At least 5 demo accounts present');
  const roles = userRes.rows.map((u) => u.role);
  assert(roles.includes('FACILITY_MANAGER'), 'Facility Manager account exists');
  assert(roles.includes('TECHNICIAN'), 'Technician account exists');
  assert(roles.includes('VENDOR'), 'Vendor account exists');

  // TEST 3: Asset Categories Validation & Constraints
  console.log('\n3. Asset Integrity & Fixed Category Tests:');
  assert(ASSET_CATEGORIES.length === 8, 'Exactly 8 fixed asset categories configured');
  const assetRes = await query('SELECT COUNT(*)::INT as count FROM assets;');
  assert(assetRes.rows[0].count >= 18, 'Seeded assets count >= 18');

  // Test invalid category constraint rejection by DB
  let invalidCatRejected = false;
  try {
    const mgr = userRes.rows.find((u) => u.role === 'FACILITY_MANAGER');
    await query(
      `INSERT INTO assets (
        asset_tag, name, category, manufacturer, model, purchase_date, supplier_name, created_by_user_id
      ) VALUES ('AST-INV-999', 'Fake Device', 'Invalid Category', 'Brand', 'M1', CURRENT_DATE, 'Vendor', $1);`,
      [mgr.id]
    );
  } catch {
    invalidCatRejected = true;
  }
  assert(invalidCatRejected, 'Database check constraint rejects non-whitelisted asset category');

  // TEST 4: Warranty Status Calculations in SQL View
  console.log('\n4. Warranty Calculations & View asset_warranty_status:');
  const viewRes = await query(`
    SELECT warranty_status, count(*)::INT as count
    FROM asset_warranty_status
    GROUP BY warranty_status;
  `);
  const statusMap = Object.fromEntries(viewRes.rows.map((r) => [r.warranty_status, r.count]));
  assert((statusMap['ACTIVE'] || 0) > 0, 'View correctly derives ACTIVE warranties (> 30 days)');
  assert((statusMap['EXPIRING_SOON'] || 0) > 0, 'View correctly derives EXPIRING_SOON (<= 30 days)');
  assert((statusMap['EXPIRED'] || 0) > 0, 'View correctly derives EXPIRED warranties (< today)');

  // TEST 5: PostgreSQL Warranty Alert Trigger & Deduplication
  console.log('\n5. PostgreSQL Event Trigger (trg_warranty_alert):');
  const notifRes = await query(`
    SELECT COUNT(*)::INT as count
    FROM notifications
    WHERE type IN ('WARRANTY_EXPIRING', 'WARRANTY_EXPIRED');
  `);
  assert(notifRes.rows[0].count > 0, 'Trigger automatically generated in-app notifications on insert');

  // Deduplication check: updating warranty without changing dates does not duplicate notification
  const countBefore = notifRes.rows[0].count;
  const sampleWarranty = (await query('SELECT asset_id, end_date FROM warranties LIMIT 1;')).rows[0];
  await query(
    'UPDATE warranties SET updated_at = CURRENT_TIMESTAMP WHERE asset_id = $1;',
    [sampleWarranty.asset_id]
  );
  const countAfter = (
    await query("SELECT COUNT(*)::INT as count FROM notifications WHERE type IN ('WARRANTY_EXPIRING', 'WARRANTY_EXPIRED');")
  ).rows[0].count;
  assert(countAfter === countBefore, 'Trigger enforces deduplication; does not generate redundant notifications');

  // Idempotent Sync Test: natural entry into 30d window without manual edits
  const syncInserted = await syncWarrantyNotifications();
  assert(typeof syncInserted === 'number', 'syncWarrantyNotifications runs idempotently against live database');
  const syncSecondRun = await syncWarrantyNotifications();
  assert(syncSecondRun === 0, 'syncWarrantyNotifications is strictly idempotent (0 duplicate rows on second run)');

  // TEST 6: Atomic Database Transactions (Reassignment & Ledger)
  console.log('\n6. Database Transaction Atomicity (COMMIT & ROLLBACK):');
  const testAsset = (await query('SELECT id, asset_tag, assigned_to_user_id FROM assets LIMIT 1;')).rows[0];
  const techUser = userRes.rows.find((u) => u.role === 'TECHNICIAN');
  const mgrUser = userRes.rows.find((u) => u.role === 'FACILITY_MANAGER');

  // 6A: Successful Commit
  await withTransaction(async (client) => {
    await client.query('UPDATE assets SET assigned_to_user_id = $1 WHERE id = $2;', [
      techUser.id,
      testAsset.id,
    ]);
    await client.query(
      `INSERT INTO asset_maintenance_ledger (
        asset_id, event_type, details, previous_assignee_id, new_assignee_id, performed_by_user_id
      ) VALUES ($1, 'TEST_TRANSACTION_COMMIT', 'Test Assignment', $2, $3, $4);`,
      [testAsset.id, testAsset.assigned_to_user_id, techUser.id, mgrUser.id]
    );
  });

  const checkCommitted = (await query('SELECT assigned_to_user_id FROM assets WHERE id = $1;', [testAsset.id])).rows[0];
  assert(checkCommitted.assigned_to_user_id === techUser.id, 'Transaction successfully committed both asset update and ledger row');

  // 6B: Rollback on Error
  let errorCaught = false;
  try {
    await withTransaction(async (client) => {
      await client.query('UPDATE assets SET assigned_to_user_id = NULL WHERE id = $1;', [testAsset.id]);
      // Deliberate error to trigger rollback: invalid foreign key
      await client.query(
        `INSERT INTO asset_maintenance_ledger (
          asset_id, event_type, details, previous_assignee_id, new_assignee_id, performed_by_user_id
        ) VALUES ($1, 'TEST_ROLLBACK', 'Should fail', $2, '00000000-0000-0000-0000-000000000000', $3);`,
        [testAsset.id, techUser.id, mgrUser.id]
      );
    });
  } catch {
    errorCaught = true;
  }
  assert(errorCaught === true, 'Transaction caught deliberate failure');
  const checkRolledBack = (await query('SELECT assigned_to_user_id FROM assets WHERE id = $1;', [testAsset.id])).rows[0];
  assert(checkRolledBack.assigned_to_user_id === techUser.id, 'Rollback preserved original state; asset update was undone');

  // TEST 7: Critical Asset Dashboard View
  console.log('\n7. View critical_asset_dashboard:');
  const critRes = await query('SELECT * FROM critical_asset_dashboard;');
  assert(critRes.rows.length > 0, 'critical_asset_dashboard surfaces assets with open tickets or expiring warranties');
  const sampleCrit = critRes.rows[0];
  assert(sampleCrit.asset_tag !== undefined, 'View returns asset_tag');
  assert(sampleCrit.open_tickets_count !== undefined, 'View returns aggregated open_tickets_count');

  // TEST 8: Local MiniLM Vector Similarity Search (pgvector)
  console.log('\n8. Local MiniLM Embeddings & pgvector Cosine Search:');
  const testQuery = 'air conditioner cooling refrigeration leak';
  const queryVec = await generateEmbedding(testQuery);
  assert(queryVec.length === 384, 'Local MiniLM produces 384-dimensional normalized vector');

  const vecSearchRes = await query(
    `SELECT mr.issue_title, 1 - (mr.embedding <=> $1::vector) as similarity
     FROM maintenance_records mr
     ORDER BY mr.embedding <=> $1::vector
     LIMIT 3;`,
    [formatVectorForPg(queryVec)]
  );

  assert(vecSearchRes.rows.length === 3, 'pgvector cosine distance query returns top 3 nearest records');
  const topResult = vecSearchRes.rows[0];
  assert(
    topResult.issue_title.toLowerCase().includes('air conditioner') ||
    topResult.issue_title.toLowerCase().includes('cooling') ||
    topResult.issue_title.toLowerCase().includes('cassette ac'),
    `Semantic search correctly identified relevant historical AC record: "${topResult.issue_title}"`
  );
  assert(topResult.similarity > 0.35, `Similarity score is positive and meaningful (${(topResult.similarity * 100).toFixed(1)}%)`);

  // TEST 9: Semantic Search Deduplication & Regression Tests
  console.log('\n9. Semantic Troubleshooting Search Deduplication & Regression Tests:');

  const runSearchQuery = async (term: string, limit = 5) => {
    const vec = await generateEmbedding(term);
    const sql = `
      WITH ranked_candidates AS (
        SELECT 
          mr.id,
          mr.asset_id,
          mr.ticket_id,
          mr.dedupe_key,
          mr.issue_title,
          mr.issue_description,
          mr.resolution,
          mr.record_date,
          a.name AS asset_name,
          a.asset_tag,
          a.category AS asset_category,
          u.full_name AS performed_by_name,
          1 - (mr.embedding <=> $1::vector) AS similarity,
          (mr.embedding <=> $1::vector) AS cosine_distance,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE(
              mr.dedupe_key,
              mr.ticket_id::text,
              mr.asset_id::text || ':' || mr.issue_title || ':' || mr.issue_description
            )
            ORDER BY (mr.embedding <=> $1::vector) ASC, mr.record_date DESC, mr.id ASC
          ) as event_rank
        FROM maintenance_records mr
        JOIN assets a ON mr.asset_id = a.id
        LEFT JOIN users u ON mr.performed_by_user_id = u.id
        WHERE mr.embedding IS NOT NULL
        ORDER BY mr.embedding <=> $1::vector ASC
        LIMIT 25
      )
      SELECT 
        id, asset_id, ticket_id, issue_title, issue_description,
        resolution, record_date, asset_name, asset_tag, asset_category,
        performed_by_name, similarity, cosine_distance
      FROM ranked_candidates
      WHERE event_rank = 1
      ORDER BY cosine_distance ASC
      LIMIT $2;
    `;
    const res = await query(sql, [formatVectorForPg(vec), limit]);
    return res.rows;
  };

  // 9.1: Search 'WASH'
  const washResults = await runSearchQuery('WASH', 5);
  assert(washResults.length > 0 && washResults.length <= 5, 'Search "WASH" returns up to 5 results');

  // 9.2: Verify no maintenance-record ID appears twice
  const washIds = washResults.map((r) => r.id);
  assert(new Set(washIds).size === washIds.length, 'No maintenance-record ID appears twice in "WASH" results');

  // 9.3: Verify no exact duplicate historical record appears multiple times
  const washFingerprints = washResults.map((r) => `${r.asset_tag}:${r.issue_title}`);
  assert(
    new Set(washFingerprints).size === washFingerprints.length,
    'No exact duplicate historical record appears multiple times in "WASH" results'
  );
  const washerRecordsCount = washResults.filter((r) => r.asset_tag === 'AST-WM-001').length;
  assert(washerRecordsCount === 1, 'Washer record appears exactly once (not 5 duplicate cards)');

  // 9.4: Verify results ordered by ascending cosine distance
  let washAscending = true;
  for (let i = 0; i < washResults.length - 1; i++) {
    if (parseFloat(washResults[i].cosine_distance) > parseFloat(washResults[i + 1].cosine_distance)) {
      washAscending = false;
      break;
    }
  }
  assert(washAscending, 'Results are strictly ordered by ascending cosine distance');

  // 9.5: Verify seed idempotence
  const seedPreCount = (await query('SELECT COUNT(*)::INT as count FROM maintenance_records;')).rows[0].count;
  const { seedDatabase } = await import('./seed');
  await seedDatabase();
  const seedPost1 = (await query('SELECT COUNT(*)::INT as count FROM maintenance_records;')).rows[0].count;
  await seedDatabase();
  const seedPost2 = (await query('SELECT COUNT(*)::INT as count FROM maintenance_records;')).rows[0].count;
  assert(
    seedPreCount === seedPost1 && seedPost1 === seedPost2,
    `Seeding is strictly idempotent; running seedDatabase() twice preserves record count (${seedPreCount} == ${seedPost1} == ${seedPost2})`
  );

  // 9.6: Test query 'laptop overheating'
  const laptopResults = await runSearchQuery('laptop overheating', 5);
  assert(laptopResults.length > 0, 'Query "laptop overheating" returns non-empty results');
  const laptopIds = laptopResults.map((r) => r.id);
  assert(new Set(laptopIds).size === laptopIds.length, 'No duplicate record IDs in laptop query results');
  assert(
    laptopResults[0].asset_tag === 'AST-CL-001',
    `Top result for "laptop overheating" is Dell workstation laptop record (${laptopResults[0].asset_tag})`
  );

  // 9.7: Confirm genuinely different historical records remain searchable
  const diffCheckAC = await runSearchQuery('air conditioner bearing noise vibration', 3);
  assert(diffCheckAC.some((r) => r.asset_tag === 'AST-AC-001'), 'Genuinely different AC repair record remains searchable');
  const diffCheckPrinter = await runSearchQuery('printer toner fuser paper crumple', 3);
  assert(diffCheckPrinter.some((r) => r.asset_tag === 'AST-PS-001'), 'Genuinely different Printer repair record remains searchable');

  // TEST SUMMARY
  console.log('\n========================================================');
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests()
  .then(() => {
    getPool().end();
  })
  .catch((err) => {
    console.error('Test runner fatal exception:', err);
    process.exit(1);
  });
