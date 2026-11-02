import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { generateEmbedding, formatVectorForPg } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  try {
    // Shared feature: all roles can access troubleshooting
    await requireAuth();

    const body = await req.json();
    const userQuery = body.query?.trim();

    if (!userQuery) {
      return NextResponse.json({ error: 'Search query is required.' }, { status: 400 });
    }

    const startTime = Date.now();

    // 1. Generate local 384-dimensional query embedding via local MiniLM pipeline
    let queryVector: number[];
    try {
      queryVector = await generateEmbedding(userQuery);
    } catch (modelErr: any) {
      console.error('[Troubleshoot Vector Search] Local inference error:', modelErr);
      return NextResponse.json(
        {
          error:
            'Local embedding generation failed. Ensure Transformers.js model files are initialized via `npm run model:download`.',
          details: modelErr.message,
        },
        { status: 503 }
      );
    }

    const vectorString = formatVectorForPg(queryVector);

    // 2. Perform genuine pgvector similarity search using cosine distance (<=>)
    // Ensures distinct historical maintenance records by partitioning candidate events
    // and ordering strictly by cosine distance without duplicating identical repair events.
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
        id,
        asset_id,
        ticket_id,
        issue_title,
        issue_description,
        resolution,
        record_date,
        asset_name,
        asset_tag,
        asset_category,
        performed_by_name,
        similarity,
        cosine_distance
      FROM ranked_candidates
      WHERE event_rank = 1
      ORDER BY cosine_distance ASC
      LIMIT 5;
    `;

    const searchRes = await query(sql, [vectorString]);
    const executionTimeMs = Date.now() - startTime;

    // Defense-in-depth: ensure absolute distinctness of records in memory
    const seenIds = new Set<string>();
    const seenFingerprints = new Set<string>();
    const distinctRows = searchRes.rows.filter((row) => {
      const fingerprint = `${row.asset_id}:${row.issue_title}`;
      if (seenIds.has(row.id) || seenFingerprints.has(fingerprint)) {
        return false;
      }
      seenIds.add(row.id);
      seenFingerprints.add(fingerprint);
      return true;
    }).slice(0, 5);

    const results = distinctRows.map((row) => ({
      id: row.id,
      asset_id: row.asset_id,
      ticket_id: row.ticket_id,
      issue_title: row.issue_title,
      issue_description: row.issue_description,
      resolution: row.resolution,
      record_date: row.record_date,
      asset_name: row.asset_name,
      asset_tag: row.asset_tag,
      asset_category: row.asset_category,
      performed_by_name: row.performed_by_name,
      similarity_score: Math.max(0, Math.min(1, parseFloat(row.similarity))),
      similarity_percentage: (Math.max(0, Math.min(1, parseFloat(row.similarity))) * 100).toFixed(1),
      cosine_distance: parseFloat(row.cosine_distance).toFixed(4),
    }));

    return NextResponse.json({
      success: true,
      query: userQuery,
      model: 'onnx-community/all-MiniLM-L6-v2-ONNX',
      dimensions: queryVector.length,
      execution_time_ms: executionTimeMs,
      total_results: results.length,
      results,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please log in to use troubleshooting search.' }, { status: 401 });
    }
    console.error('Troubleshoot search error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
