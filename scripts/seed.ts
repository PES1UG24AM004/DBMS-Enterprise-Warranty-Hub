import path from 'path';
import dotenv from 'dotenv';
import { getPool, query, withTransaction } from '../lib/db';
import { hashPassword } from '../lib/auth';
import { generateEmbedding, formatVectorForPg } from '../lib/embeddings';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

export async function seedDatabase() {
  console.log('--- Starting Enterprise Warranty Hub Seed Process ---');

  const DEMO_PASSWORD = 'Demo123!';
  const hashedPassword = await hashPassword(DEMO_PASSWORD);

  // 1. Seed Users
  console.log('Seeding users...');
  const users = [
    {
      email: 'manager@ewh.demo',
      full_name: 'Aarav Sharma (Facility Director)',
      role: 'FACILITY_MANAGER',
    },
    {
      email: 'technician@ewh.demo',
      full_name: 'Vikram Patel (Lead Hardware Tech)',
      role: 'TECHNICIAN',
    },
    {
      email: 'technician2@ewh.demo',
      full_name: 'Priya Sundaram (Systems Tech)',
      role: 'TECHNICIAN',
    },
    {
      email: 'vendor@ewh.demo',
      full_name: 'Apex Cooling & Appliances Services',
      role: 'VENDOR',
    },
    {
      email: 'vendor2@ewh.demo',
      full_name: 'Dell Precision Care Partner',
      role: 'VENDOR',
    },
  ];

  const userMap: Record<string, string> = {};

  for (const u of users) {
    const res = await query(
      `INSERT INTO users (full_name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO UPDATE 
       SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, is_active = TRUE
       RETURNING id, email;`,
      [u.full_name, u.email, hashedPassword, u.role]
    );
    userMap[u.email] = res.rows[0].id;
  }
  console.log(`✔ ${users.length} demo accounts ready.`);

  const mgrId = userMap['manager@ewh.demo'];
  const tech1Id = userMap['technician@ewh.demo'];
  const tech2Id = userMap['technician2@ewh.demo'];
  const vendor1Id = userMap['vendor@ewh.demo'];
  const vendor2Id = userMap['vendor2@ewh.demo'];

  // Helper date calculations relative to CURRENT_DATE
  const today = new Date();
  const addDays = (d: Date, days: number): string => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toISOString().split('T')[0];
  };

  // 2. Seed 18 Assets distributed across the 8 categories
  console.log('Seeding 18 enterprise assets...');
  const assetSpecs = [
    // Category 1: Computers and Laptops (3 assets)
    {
      asset_tag: 'AST-CL-001',
      name: 'Dell Precision 7780 Workstation',
      category: 'Computers and Laptops',
      manufacturer: 'Dell',
      model: 'Precision 7780 (i9/64GB/RTX 4000)',
      serial_number: 'DELL-SN-77801-A',
      purchase_date: addDays(today, -300),
      purchase_price: 3200.0,
      supplier_name: 'Dell Precision Solutions',
      location: 'Engineering Lab 301',
      department: 'R&D',
      assigned_to: tech1Id,
      warranty: { provider: 'Dell ProSupport Plus', start: addDays(today, -300), end: addDays(today, 430) }, // ACTIVE
    },
    {
      asset_tag: 'AST-CL-002',
      name: 'MacBook Pro 16 M3 Max',
      category: 'Computers and Laptops',
      manufacturer: 'Apple',
      model: 'A2991 16-inch Space Black',
      serial_number: 'APP-SN-MBP16-99',
      purchase_date: addDays(today, -350),
      purchase_price: 3499.0,
      supplier_name: 'Apple Corporate Direct',
      location: 'Executive Suite 504',
      department: 'Executive',
      assigned_to: mgrId,
      warranty: { provider: 'AppleCare+ Enterprise', start: addDays(today, -350), end: addDays(today, 15) }, // EXPIRING SOON (15 days)
    },
    {
      asset_tag: 'AST-CL-003',
      name: 'Lenovo ThinkPad X1 Carbon Gen 11',
      category: 'Computers and Laptops',
      manufacturer: 'Lenovo',
      model: '21HM004BUS Core i7',
      serial_number: 'LNV-SN-X1C-44',
      purchase_date: addDays(today, -750),
      purchase_price: 1850.0,
      supplier_name: 'Lenovo Commercial Store',
      location: 'Finance Dept Room 202',
      department: 'Finance',
      assigned_to: null,
      warranty: { provider: 'Lenovo Premier Support', start: addDays(today, -750), end: addDays(today, -20) }, // EXPIRED (-20 days)
    },

    // Category 2: Printers and Scanners (2 assets)
    {
      asset_tag: 'AST-PS-001',
      name: 'HP LaserJet Enterprise Flow MFP M635',
      category: 'Printers and Scanners',
      manufacturer: 'HP',
      model: 'M635h Multi-function',
      serial_number: 'HP-SN-MFP635-01',
      purchase_date: addDays(today, -400),
      purchase_price: 2450.0,
      supplier_name: 'OfficeWorks Depot',
      location: 'Central Copy Center Floor 2',
      department: 'Operations',
      assigned_to: tech2Id,
      warranty: { provider: 'HP Care Pack Onsite', start: addDays(today, -400), end: addDays(today, 25) }, // EXPIRING SOON (25 days)
    },
    {
      asset_tag: 'AST-PS-002',
      name: 'Canon imageFORMULA DR-G2140 Scanner',
      category: 'Printers and Scanners',
      manufacturer: 'Canon',
      model: 'DR-G2140 Production Scanner',
      serial_number: 'CNN-SN-DRG2-77',
      purchase_date: addDays(today, -600),
      purchase_price: 5200.0,
      supplier_name: 'Document Imaging Systems',
      location: 'Records Archive Room 105',
      department: 'Legal',
      assigned_to: null,
      warranty: { provider: 'Canon eCarePAK Gold', start: addDays(today, -600), end: addDays(today, 120) }, // ACTIVE
    },

    // Category 3: Mobile Devices (2 assets)
    {
      asset_tag: 'AST-MD-001',
      name: 'Samsung Galaxy Tab Active4 Pro Rugged',
      category: 'Mobile Devices',
      manufacturer: 'Samsung',
      model: 'SM-T638U 5G Enterprise',
      serial_number: 'SMG-SN-TAB4-12',
      purchase_date: addDays(today, -200),
      purchase_price: 890.0,
      supplier_name: 'Cellular Enterprise Depot',
      location: 'Facility Inspection Cart A',
      department: 'Facilities',
      assigned_to: tech1Id,
      warranty: { provider: 'Samsung Care+ for Business', start: addDays(today, -200), end: addDays(today, 165) }, // ACTIVE
    },
    {
      asset_tag: 'AST-MD-002',
      name: 'Zebra TC52x Handheld Inventory Scanner',
      category: 'Mobile Devices',
      manufacturer: 'Zebra',
      model: 'TC520K Rugged Scanner',
      serial_number: 'ZBR-SN-TC52-88',
      purchase_date: addDays(today, -800),
      purchase_price: 1350.0,
      supplier_name: 'Barcoding Warehouse Hub',
      location: 'Shipping Loading Dock 1',
      department: 'Logistics',
      assigned_to: null,
      warranty: { provider: 'Zebra OneCare Essential', start: addDays(today, -800), end: addDays(today, -45) }, // EXPIRED (-45 days)
    },

    // Category 4: Monitors and Televisions (2 assets)
    {
      asset_tag: 'AST-MT-001',
      name: 'Samsung 85-inch The Terrace Commercial Display',
      category: 'Monitors and Televisions',
      manufacturer: 'Samsung',
      model: 'QM85C UHD 4K Signage',
      serial_number: 'SMG-SN-QM85-33',
      purchase_date: addDays(today, -150),
      purchase_price: 4100.0,
      supplier_name: 'ProAV Solutions India',
      location: 'Auditorium Main Stage',
      department: 'Facilities',
      assigned_to: mgrId,
      warranty: { provider: 'Samsung Commercial Warranty', start: addDays(today, -150), end: addDays(today, 580) }, // ACTIVE
    },
    {
      asset_tag: 'AST-MT-002',
      name: 'LG UltraFine 32-inch 4K OLED Pro Monitor',
      category: 'Monitors and Televisions',
      manufacturer: 'LG',
      model: '32EP950-B OLED',
      serial_number: 'LG-SN-32EP-11',
      purchase_date: addDays(today, -345),
      purchase_price: 1999.0,
      supplier_name: 'Visual Graphics Store',
      location: 'Design Studio 402',
      department: 'Marketing',
      assigned_to: tech2Id,
      warranty: { provider: 'LG Premium Commercial Care', start: addDays(today, -345), end: addDays(today, 20) }, // EXPIRING SOON (20 days)
    },

    // Category 5: Kitchen Appliances (2 assets)
    {
      asset_tag: 'AST-KA-001',
      name: 'Breville Oracle Touch Espresso Machine',
      category: 'Kitchen Appliances',
      manufacturer: 'Breville',
      model: 'BES990BSS Commercial Edition',
      serial_number: 'BRV-SN-ORC99-55',
      purchase_date: addDays(today, -280),
      purchase_price: 2799.0,
      supplier_name: 'Gourmet Office Suppliers',
      location: 'Level 4 Employee Lounge Cafeteria',
      department: 'Operations',
      assigned_to: mgrId,
      warranty: { provider: 'Breville Master Warranty', start: addDays(today, -280), end: addDays(today, 85) }, // ACTIVE
    },
    {
      asset_tag: 'AST-KA-002',
      name: 'Panasonic Commercial Microwave Oven 1800W',
      category: 'Kitchen Appliances',
      manufacturer: 'Panasonic',
      model: 'NE-1853 Heavy Duty',
      serial_number: 'PNS-SN-NE18-44',
      purchase_date: addDays(today, -720),
      purchase_price: 1450.0,
      supplier_name: 'Commercial Kitchen Supplies',
      location: 'Level 2 Pantry Station',
      department: 'Operations',
      assigned_to: null,
      warranty: { provider: 'Panasonic Foodservice Warranty', start: addDays(today, -720), end: addDays(today, -10) }, // EXPIRED (-10 days)
    },

    // Category 6: Washing Machines (2 assets)
    {
      asset_tag: 'AST-WM-001',
      name: 'Speed Queen Commercial Front Load Washer',
      category: 'Washing Machines',
      manufacturer: 'Speed Queen',
      model: 'SFNNCASP115TW01 Quantum Gold',
      serial_number: 'SQN-SN-QNTM-01',
      purchase_date: addDays(today, -320),
      purchase_price: 3600.0,
      supplier_name: 'Industrial Laundry Systems',
      location: 'Basement Facility Laundry Room',
      department: 'Facilities',
      assigned_to: null,
      warranty: { provider: 'Speed Queen Factory Protection', start: addDays(today, -320), end: addDays(today, 45) }, // ACTIVE
    },
    {
      asset_tag: 'AST-WM-002',
      name: 'Electrolux Professional Line 6000 Washer',
      category: 'Washing Machines',
      manufacturer: 'Electrolux',
      model: 'WH6-6 Clarus Vibe',
      serial_number: 'ELX-SN-WH6-82',
      purchase_date: addDays(today, -360),
      purchase_price: 4900.0,
      supplier_name: 'Commercial Laundry Specialists',
      location: 'Gymnasium & Wellness Center',
      department: 'Facilities',
      assigned_to: null,
      warranty: { provider: 'Electrolux Professional Care', start: addDays(today, -360), end: addDays(today, 5) }, // EXPIRING SOON (5 days)
    },

    // Category 7: Air Conditioners (3 assets)
    {
      asset_tag: 'AST-AC-001',
      name: 'Daikin VRV-X Central Server Room AC Unit',
      category: 'Air Conditioners',
      manufacturer: 'Daikin',
      model: 'RXQ16AMYM Inverter Multi-Split',
      serial_number: 'DKN-SN-VRVX-01',
      purchase_date: addDays(today, -450),
      purchase_price: 7800.0,
      supplier_name: 'Apex Cooling & Appliances Services',
      location: 'Main Server Room B-10',
      department: 'IT Infrastructure',
      assigned_to: tech1Id,
      warranty: { provider: 'Apex Master Maintenance Care', start: addDays(today, -450), end: addDays(today, 280) }, // ACTIVE
    },
    {
      asset_tag: 'AST-AC-002',
      name: 'Mitsubishi Heavy Industries Cassette AC 4.0 Ton',
      category: 'Air Conditioners',
      manufacturer: 'Mitsubishi',
      model: 'FDT125KXZE1 4-Way Inverter',
      serial_number: 'MTB-SN-FDT12-99',
      purchase_date: addDays(today, -380),
      purchase_price: 3400.0,
      supplier_name: 'Apex Cooling & Appliances Services',
      location: 'Conference Room Alpha',
      department: 'Facilities',
      assigned_to: null,
      warranty: { provider: 'Apex HVAC Direct Guarantee', start: addDays(today, -380), end: addDays(today, 12) }, // EXPIRING SOON (12 days)
    },
    {
      asset_tag: 'AST-AC-003',
      name: 'Blue Star Precision Air Conditioner PAC 5.5',
      category: 'Air Conditioners',
      manufacturer: 'Blue Star',
      model: 'DB180 Precision Climate',
      serial_number: 'BLS-SN-PAC55-22',
      purchase_date: addDays(today, -740),
      purchase_price: 6200.0,
      supplier_name: 'Apex Cooling & Appliances Services',
      location: 'Telecom Battery & UPS Room',
      department: 'Facilities',
      assigned_to: null,
      warranty: { provider: 'Blue Star Extended Assurance', start: addDays(today, -740), end: addDays(today, -5) }, // EXPIRED (-5 days)
    },

    // Category 8: Other Electronics (2 assets)
    {
      asset_tag: 'AST-OE-001',
      name: 'APC Symmetra LX 16kVA Modular UPS',
      category: 'Other Electronics',
      manufacturer: 'APC by Schneider',
      model: 'SYA16K16P Rackmount UPS',
      serial_number: 'APC-SN-SYM16-09',
      purchase_date: addDays(today, -500),
      purchase_price: 11500.0,
      supplier_name: 'Power Infrastructure Hub',
      location: 'Electrical Plant Room Ground Floor',
      department: 'Infrastructure',
      assigned_to: tech2Id,
      warranty: { provider: 'Schneider Critical Power Support', start: addDays(today, -500), end: addDays(today, 230) }, // ACTIVE
    },
    {
      asset_tag: 'AST-OE-002',
      name: 'Cisco Catalyst 9300 48-Port PoE+ Switch',
      category: 'Other Electronics',
      manufacturer: 'Cisco',
      model: 'C9300-48P-A Modular',
      serial_number: 'CSC-SN-C9300-88',
      purchase_date: addDays(today, -370),
      purchase_price: 4800.0,
      supplier_name: 'Enterprise Networking Solutions',
      location: 'IDF Closet 3 East',
      department: 'IT Infrastructure',
      assigned_to: tech1Id,
      warranty: { provider: 'Cisco SMARTnet Premier', start: addDays(today, -370), end: addDays(today, 28) }, // EXPIRING SOON (28 days)
    },
  ];

  const assetMap: Record<string, string> = {};

  for (const a of assetSpecs) {
    const res = await query(
      `INSERT INTO assets (
        asset_tag, name, category, manufacturer, model, serial_number,
        purchase_date, purchase_price, supplier_name, location, department,
        assigned_to_user_id, created_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (asset_tag) DO UPDATE SET
        name = EXCLUDED.name, category = EXCLUDED.category, manufacturer = EXCLUDED.manufacturer,
        model = EXCLUDED.model, serial_number = EXCLUDED.serial_number, purchase_date = EXCLUDED.purchase_date,
        purchase_price = EXCLUDED.purchase_price, supplier_name = EXCLUDED.supplier_name,
        location = EXCLUDED.location, department = EXCLUDED.department,
        assigned_to_user_id = EXCLUDED.assigned_to_user_id
      RETURNING id, asset_tag;`,
      [
        a.asset_tag,
        a.name,
        a.category,
        a.manufacturer,
        a.model,
        a.serial_number,
        a.purchase_date,
        a.purchase_price,
        a.supplier_name,
        a.location,
        a.department,
        a.assigned_to,
        mgrId,
      ]
    );

    const assetId = res.rows[0].id;
    assetMap[a.asset_tag] = assetId;

    // Insert or update warranty (trigger will fire and populate notifications)
    await query(
      `INSERT INTO warranties (asset_id, warranty_provider, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (asset_id) DO UPDATE SET
         warranty_provider = EXCLUDED.warranty_provider,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date;`,
      [assetId, a.warranty.provider, a.warranty.start, a.warranty.end]
    );
  }
  console.log('✔ 18 assets and warranties seeded successfully.');

  // 3. Seed 15 Maintenance Tickets across all 6 statuses
  console.log('Seeding 15 maintenance tickets across 6 workflow statuses...');
  const ticketSpecs = [
    // 1. Reported (New unassigned tickets)
    {
      code: 'TCK-2026-001',
      asset_tag: 'AST-CL-003',
      title: 'ThinkPad battery swelling and trackpad unresponsive',
      description: 'The bottom chassis of the ThinkPad X1 is bulging slightly and physical click on trackpad is stuck.',
      status: 'Reported',
      assignee: null,
      notes: null,
    },
    {
      code: 'TCK-2026-002',
      asset_tag: 'AST-KA-002',
      title: 'Panasonic microwave turntable stopped spinning',
      description: 'Food heats unevenly; rotating roller ring appears jammed or drive motor has failed.',
      status: 'Reported',
      assignee: null,
      notes: null,
    },

    // 2. Assigned
    {
      code: 'TCK-2026-003',
      asset_tag: 'AST-CL-002',
      title: 'MacBook Pro screen flickering under GPU load',
      description: 'Intermittent horizontal purple lines appear across the liquid retina display when rendering video exports.',
      status: 'Assigned',
      assignee: vendor2Id, // Dell / Mac specialist vendor
      notes: null,
    },
    {
      code: 'TCK-2026-004',
      asset_tag: 'AST-MD-002',
      title: 'Zebra barcode scanner laser sensor misfiring',
      description: 'Red scan beam activates erratically and fails to register Code 128 barcodes at shipping bay.',
      status: 'Assigned',
      assignee: tech1Id,
      notes: null,
    },

    // 3. Acknowledged
    {
      code: 'TCK-2026-005',
      asset_tag: 'AST-AC-002',
      title: 'Cassette AC condensation line dripping into Conference Alpha',
      description: 'Water droplets forming on acoustic ceiling tiles directly adjacent to the Mitsubishi indoor unit.',
      status: 'Acknowledged',
      assignee: vendor1Id, // Apex Cooling vendor
      notes: 'Acknowledged by Apex technician. Site visit scheduled for inspection of condensate drain pump.',
    },
    {
      code: 'TCK-2026-006',
      asset_tag: 'AST-PS-001',
      title: 'LaserJet paper feed tray 2 roller pickup jamming',
      description: 'Printer repeatedly shows Error 13.00.00 Paper Jam in Tray 2 even with fresh reams loaded.',
      status: 'Acknowledged',
      assignee: tech2Id,
      notes: 'Picked up ticket. Have ordered replacement pickup separation roller kit.',
    },

    // 4. In Progress
    {
      code: 'TCK-2026-007',
      asset_tag: 'AST-AC-003',
      title: 'Blue Star PAC low refrigerant pressure error alarm E4',
      description: 'UPS battery room climate unit tripped on low pressure safety switch. Room temp rising past 24C.',
      status: 'In Progress',
      assignee: vendor1Id, // Apex Cooling vendor
      notes: 'Apex technicians on site conducting nitrogen leak detection test across R410A circuit.',
    },
    {
      code: 'TCK-2026-008',
      asset_tag: 'AST-OE-002',
      title: 'Catalyst switch PoE port bank 1-12 intermittent power delivery',
      description: 'Access points connected to ports 1 through 8 randomly rebooting due to PoE budget drops.',
      status: 'In Progress',
      assignee: tech1Id,
      notes: 'Running Cisco IOS diagnostics and testing power supply module redundancy.',
    },
    {
      code: 'TCK-2026-009',
      asset_tag: 'AST-WM-002',
      title: 'Electrolux washer high-spin vibration and drum noise',
      description: 'Excessive mechanical banging during 1200 RPM extraction cycle. Suspension dampers suspected worn.',
      status: 'In Progress',
      assignee: tech2Id,
      notes: 'Dampers inspected; replacing two rear friction dampers with genuine OEM parts.',
    },

    // 5. Resolved
    {
      code: 'TCK-2026-010',
      asset_tag: 'AST-CL-001',
      title: 'Dell 7780 thermal throttling during heavy simulation runs',
      description: 'CPU frequency throttled down to 1.1GHz due to thermal trip. Fans were sounding strained.',
      status: 'Resolved',
      assignee: tech1Id,
      notes: 'Disassembled heatsink, cleaned oxidized factory thermal paste, applied Honeywell PTM7950 phase change pad, cleared copper radiator dust. Temperatures dropped from 99C to 74C under full load.',
    },
    {
      code: 'TCK-2026-011',
      asset_tag: 'AST-AC-001',
      title: 'Server room AC secondary blower fan bearing squeal',
      description: 'High-pitch mechanical noise audible outside server room door during continuous operation.',
      status: 'Resolved',
      assignee: vendor1Id,
      notes: 'Replaced failed sealed ball bearings on secondary blower fan motor. Tested dynamic balance and vibration spectrum; noise fully eliminated.',
    },
    {
      code: 'TCK-2026-012',
      asset_tag: 'AST-MT-002',
      title: 'LG OLED monitor USB-C Power Delivery dropped to 15W',
      description: 'Laptop does not charge when connected via Thunderbolt/USB-C single cable setup.',
      status: 'Resolved',
      assignee: tech2Id,
      notes: 'Flashed firmware version v3.11 addressing PD handshake bug. Re-tested with 96W MacBook power profile; delivering steady 90W charging.',
    },

    // 6. Closed
    {
      code: 'TCK-2026-013',
      asset_tag: 'AST-OE-001',
      title: 'APC UPS battery module 3 communications lost alarm',
      description: 'Management card signaled battery cassette 3 communication fault and scheduled self-test failure.',
      status: 'Closed',
      assignee: tech1Id,
      notes: 'Hot-swapped battery cassette with calibrated spare module. Recalibrated runtime counter. System online with 100% capacity.',
    },
    {
      code: 'TCK-2026-014',
      asset_tag: 'AST-KA-001',
      title: 'Breville espresso machine grouphead steam pressure low',
      description: 'Steam wand purging water rather than dry steam; dual boiler pressure gauge reading 0.5 bar below normal.',
      status: 'Closed',
      assignee: vendor1Id,
      notes: 'Performed full commercial descaling cycle, replaced silicone grouphead gasket and vacuum relief valve. Tested boiler pressure reaching steady 1.4 bar.',
    },
    {
      code: 'TCK-2026-015',
      asset_tag: 'AST-PS-002',
      title: 'Canon document scanner double-feed sensor false positive',
      description: 'Ultrasonic double-feed sensor stopping batch scans on clean single sheets of legal bond paper.',
      status: 'Closed',
      assignee: tech2Id,
      notes: 'Cleaned optical dust glass, recalibrated ultrasonic emitter and receiver sensitivity threshold in Canon CaptureOnTouch service utility.',
    },
  ];

  const ticketMap: Record<string, string> = {};

  for (const t of ticketSpecs) {
    const assetId = assetMap[t.asset_tag];
    const res = await query(
      `INSERT INTO tickets (
        ticket_code, asset_id, title, description, status,
        assignee_user_id, created_by_user_id, resolution_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (ticket_code) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description,
        status = EXCLUDED.status, assignee_user_id = EXCLUDED.assignee_user_id,
        resolution_notes = EXCLUDED.resolution_notes
      RETURNING id, ticket_code;`,
      [t.code, assetId, t.title, t.description, t.status, t.assignee, mgrId, t.notes]
    );
    ticketMap[t.code] = res.rows[0].id;
  }
  console.log('✔ 15 tickets seeded across all workflow states.');

  // 4. Seed Historical Maintenance Records with Local Embeddings
  console.log('Seeding historical maintenance records with real local MiniLM embeddings (384-dim)...');
  const historySpecs = [
    {
      asset_tag: 'AST-AC-001',
      ticket_code: 'TCK-2026-011',
      dedupe_key: 'TICKET:TCK-2026-011',
      title: 'Air conditioner blower fan bearing squeal and high frequency vibration',
      description: 'Severe high pitch whistling and vibration from indoor VRV air conditioner blower assembly in server room.',
      resolution: 'Replaced sealed ceramic ball bearings on secondary blower fan motor. Balanced impeller cage dynamically. Sound pressure level restored to baseline 48 dBA.',
      user_id: vendor1Id,
      record_date: addDays(today, -14),
    },
    {
      asset_tag: 'AST-CL-001',
      ticket_code: 'TCK-2026-010',
      dedupe_key: 'TICKET:TCK-2026-010',
      title: 'Laptop CPU severe thermal throttling and fan roaring at 100%',
      description: 'Workstation laptop processor temperature spikes above 98C causing clock throttling to 1.1GHz during compiling and simulation tasks.',
      resolution: 'Disassembled heatsink and vapor chamber, scraped dried thermal compound, applied Honeywell PTM7950 phase change pad, compressed air cleaned radiator fins. Max temp under full prime load lowered to 74C.',
      user_id: tech1Id,
      record_date: addDays(today, -10),
    },
    {
      asset_tag: 'AST-MT-002',
      ticket_code: 'TCK-2026-012',
      dedupe_key: 'TICKET:TCK-2026-012',
      title: 'Monitor USB-C power delivery failure and display blanking',
      description: 'OLED monitor stopped supplying 90W USB-C charging to connected MacBook and display periodically loses sync.',
      resolution: 'Updated monitor scaler and USB-PD controller firmware to version 3.11. Verified USB-C voltage handshake renegotiation at 20V/4.5A.',
      user_id: tech2Id,
      record_date: addDays(today, -8),
    },
    {
      asset_tag: 'AST-OE-001',
      ticket_code: 'TCK-2026-013',
      dedupe_key: 'TICKET:TCK-2026-013',
      title: 'APC UPS battery module communication fault and runtime degradation',
      description: 'Network management card reported battery communication fault on rack tray 3 and aborted automated monthly self-test.',
      resolution: 'Hot-swapped battery tray module with factory fresh pre-conditioned unit. Initiated manual calibration discharge cycle. Total runtime confirmed at 42 minutes under 8.5kW load.',
      user_id: tech1Id,
      record_date: addDays(today, -30),
    },
    {
      asset_tag: 'AST-KA-001',
      ticket_code: 'TCK-2026-014',
      dedupe_key: 'TICKET:TCK-2026-014',
      title: 'Commercial espresso machine steam boiler pressure loss and water spitting',
      description: 'Steam wand spurts hot liquid water instead of dry steam. Dual boiler gauge shows inadequate steam generation pressure.',
      resolution: 'Descaled dual boiler with commercial sulfamic acid solution. Replaced defective vacuum breaker valve and worn silicone grouphead o-ring seal. Operating pressure normalized to 1.4 bar.',
      user_id: vendor1Id,
      record_date: addDays(today, -45),
    },
    {
      asset_tag: 'AST-PS-002',
      ticket_code: 'TCK-2026-015',
      dedupe_key: 'TICKET:TCK-2026-015',
      title: 'High speed document scanner false ultrasonic double feed detection',
      description: 'Scanner stops feeding on clean document stacks, throwing false multifeed sensor errors on single 80gsm pages.',
      resolution: 'Cleaned dust particles from ultrasonic transducer sensors using optical swabs. Adjusted ultrasonic sensitivity curve in maintenance diagnostic mode to medium-low.',
      user_id: tech2Id,
      record_date: addDays(today, -60),
    },
    // Historical repair records without current tickets
    {
      asset_tag: 'AST-AC-002',
      ticket_code: null,
      dedupe_key: 'HIST:AST-AC-002:cassette-water-leak',
      title: 'Ceiling cassette AC water leakage and clogged condensate drain trap',
      description: 'Condensation water overflowing drain pan and spilling through ceiling grid into conference room below.',
      resolution: 'Flushed gelatinous algae buildup from 25mm PVC condensate drain pipe using compressed nitrogen. Treated pan with antimicrobial biocidal tablets and verified float switch pump operation.',
      user_id: vendor1Id,
      record_date: addDays(today, -90),
    },
    {
      asset_tag: 'AST-PS-001',
      ticket_code: null,
      dedupe_key: 'HIST:AST-PS-001:fuser-jam',
      title: 'Network printer paper jam in fuser unit and toner smudging',
      description: 'Sheets crumple inside heating fuser assembly and black toner smears when touched on output tray.',
      resolution: 'Replaced worn Teflon fuser sleeve film and pressure roller assembly. Cleaned thermistor sensor head to prevent fuser overheating.',
      user_id: tech2Id,
      record_date: addDays(today, -110),
    },
    {
      asset_tag: 'AST-WM-001',
      ticket_code: null,
      dedupe_key: 'HIST:AST-WM-001:drain-pump-oe',
      title: 'Commercial washer drainage pump error code OE and standing water',
      description: 'Washing machine stops prior to spin cycle with error code OE and drum half full of sudsy water.',
      resolution: 'Unscrewed coin trap filter and extracted plastic debris and wire fragments. Disconnected drain pump housing, cleared lint impaction in impeller, and verified complete gravity drain.',
      user_id: tech1Id,
      record_date: addDays(today, -125),
    },
    {
      asset_tag: 'AST-CL-003',
      ticket_code: null,
      dedupe_key: 'HIST:AST-CL-003:power-esd',
      title: 'Laptop power button unresponsive and motherboard ESD lockup',
      description: 'ThinkPad fails to turn on; no charging LED light illuminated even when connected to original 65W USB-C charger.',
      resolution: 'Performed emergency hardware reset using rear pinhole emergency reset button. Disconnected internal battery connector for 5 minutes to clear static CMOS latchup. Reconnected and booted into UEFI.',
      user_id: tech1Id,
      record_date: addDays(today, -140),
    },
    {
      asset_tag: 'AST-MD-001',
      ticket_code: null,
      dedupe_key: 'HIST:AST-MD-001:phantom-touch',
      title: 'Rugged tablet touchscreen phantom touches and wet finger tracking',
      description: 'Capacitive digitizer registers sporadic ghost clicks across upper right corner of screen during outdoor inspections.',
      resolution: 'Cleaned protective Gorilla glass screen margin of oily residue. Toggled Samsung touch sensitivity setting to high glove mode and recalibrated digitizer grid.',
      user_id: tech2Id,
      record_date: addDays(today, -160),
    },
    {
      asset_tag: 'AST-OE-002',
      ticket_code: null,
      dedupe_key: 'HIST:AST-OE-002:switch-port-crc',
      title: 'Ethernet switch port packet drops and CRC alignment errors',
      description: 'Uplink 10GbE SFP+ port logging thousands of CRC errors, causing packet drops and degraded file transfer bandwidth.',
      resolution: 'Inspected optical fiber patch cable under scope, discovered dirty LC ferrule face. Cleaned ferrule with 2.5mm click cleaner and re-seated SFP-10G-SR transceiver into switch slot.',
      user_id: tech1Id,
      record_date: addDays(today, -180),
    },
  ];

  for (let i = 0; i < historySpecs.length; i++) {
    const h = historySpecs[i];
    const assetId = assetMap[h.asset_tag];
    const ticketId = h.ticket_code ? ticketMap[h.ticket_code] : null;

    // Build rich text for semantic embedding
    const embeddingText = `${h.title}. Description: ${h.description}. Resolution: ${h.resolution}`;
    const embeddingVector = await generateEmbedding(embeddingText);
    const vectorString = formatVectorForPg(embeddingVector);

    await query(
      `INSERT INTO maintenance_records (
        asset_id, ticket_id, dedupe_key, issue_title, issue_description, resolution,
        performed_by_user_id, record_date, embedding
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::vector)
      ON CONFLICT (dedupe_key) DO UPDATE SET
        asset_id = EXCLUDED.asset_id,
        ticket_id = EXCLUDED.ticket_id,
        issue_title = EXCLUDED.issue_title,
        issue_description = EXCLUDED.issue_description,
        resolution = EXCLUDED.resolution,
        performed_by_user_id = EXCLUDED.performed_by_user_id,
        record_date = EXCLUDED.record_date,
        embedding = EXCLUDED.embedding;`,
      [
        assetId,
        ticketId,
        h.dedupe_key,
        h.title,
        h.description,
        h.resolution,
        h.user_id,
        h.record_date,
        vectorString,
      ]
    );
    process.stdout.write(`  [${i + 1}/${historySpecs.length}] Embedded: "${h.title.slice(0, 45)}..."\n`);
  }
  console.log('✔ All 12 historical records seeded with real local pgvector embeddings.');

  // 5. Seed In-App Notifications
  console.log('Seeding in-app notifications for technicians and vendors...');
  const notifSpecs = [
    {
      user_id: tech1Id,
      asset_id: assetMap['AST-MD-002'],
      ticket_id: ticketMap['TCK-2026-004'],
      type: 'TICKET_ASSIGNED',
      message: 'You have been assigned Ticket TCK-2026-004: Zebra barcode scanner laser sensor misfiring',
      dedupe_key: 'ASSIGN:TCK-2026-004:' + tech1Id,
      read_at: null,
    },
    {
      user_id: tech2Id,
      asset_id: assetMap['AST-PS-001'],
      ticket_id: ticketMap['TCK-2026-006'],
      type: 'TICKET_ASSIGNED',
      message: 'You have been assigned Ticket TCK-2026-006: LaserJet paper feed tray 2 roller pickup jamming',
      dedupe_key: 'ASSIGN:TCK-2026-006:' + tech2Id,
      read_at: null,
    },
    {
      user_id: vendor1Id,
      asset_id: assetMap['AST-AC-002'],
      ticket_id: ticketMap['TCK-2026-005'],
      type: 'TICKET_ASSIGNED',
      message: 'New Vendor Ticket Assigned: TCK-2026-005 - Cassette AC condensation line dripping into Conference Alpha',
      dedupe_key: 'ASSIGN:TCK-2026-005:' + vendor1Id,
      read_at: null,
    },
    {
      user_id: vendor2Id,
      asset_id: assetMap['AST-CL-002'],
      ticket_id: ticketMap['TCK-2026-003'],
      type: 'TICKET_ASSIGNED',
      message: 'New Vendor Ticket Assigned: TCK-2026-003 - MacBook Pro screen flickering under GPU load',
      dedupe_key: 'ASSIGN:TCK-2026-003:' + vendor2Id,
      read_at: null,
    },
  ];

  for (const n of notifSpecs) {
    await query(
      `INSERT INTO notifications (user_id, asset_id, ticket_id, type, message, dedupe_key, read_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, dedupe_key) DO NOTHING;`,
      [n.user_id, n.asset_id, n.ticket_id, n.type, n.message, n.dedupe_key, n.read_at]
    );
  }
  console.log('✔ Technician and vendor notifications seeded.');

  // 6. Seed Asset Maintenance Ledger (for transaction demonstration)
  console.log('Seeding initial asset ledger entries...');
  const ledgerSpecs = [
    {
      asset_tag: 'AST-CL-001',
      event: 'ASSET_INITIAL_ASSIGNMENT',
      details: 'Workstation assigned to Lead Hardware Tech Vikram Patel for engineering lab duties.',
      prev_id: null,
      new_id: tech1Id,
    },
    {
      asset_tag: 'AST-PS-001',
      event: 'ASSET_REASSIGNED',
      details: 'Transferred administrative oversight of Central Copy Center printer to Systems Tech Priya Sundaram.',
      prev_id: tech1Id,
      new_id: tech2Id,
    },
  ];

  for (const l of ledgerSpecs) {
    const assetId = assetMap[l.asset_tag];
    await query(
      `INSERT INTO asset_maintenance_ledger (
        asset_id, event_type, details, previous_assignee_id, new_assignee_id, performed_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6);`,
      [assetId, l.event, l.details, l.prev_id, l.new_id, mgrId]
    );
  }
  console.log('✔ Asset maintenance ledger seeded.');

  console.log('--- Database Seed Process Completed Successfully! ---');
}

import { fileURLToPath } from 'url';

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase();

if (isDirectRun) {
  seedDatabase()
    .then(() => {
      getPool().end();
    })
    .catch((err) => {
      console.error('✘ Seed failed:', err);
      process.exit(1);
    });
}
