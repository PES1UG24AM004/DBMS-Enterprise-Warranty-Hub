import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { generateEmbedding, formatVectorForPg } from '@/lib/embeddings';
import { TICKET_STATUSES, TicketStatus } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const ticketId = params.id;
    const body = await req.json();
    const { status, resolution_notes, assignee_user_id } = body;

    // Fetch existing ticket
    const ticketRes = await query(
      `SELECT t.*, a.name AS asset_name, a.asset_tag, a.category AS asset_category
       FROM tickets t
       JOIN assets a ON t.asset_id = a.id
       WHERE t.id = $1;`,
      [ticketId]
    );

    if (ticketRes.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    const ticket = ticketRes.rows[0];

    // Authorization checks
    if (user.role === 'TECHNICIAN' || user.role === 'VENDOR') {
      if (ticket.assignee_user_id !== user.id) {
        return NextResponse.json(
          { error: 'You are only authorized to update tickets assigned directly to your account.' },
          { status: 403 }
        );
      }
      // Technicians and Vendors cannot reassign tickets
      if (assignee_user_id && assignee_user_id !== ticket.assignee_user_id) {
        return NextResponse.json(
          { error: 'Only Facility Managers can reassign tickets.' },
          { status: 403 }
        );
      }
    }

    // Status validation
    if (status && !TICKET_STATUSES.includes(status as TicketStatus)) {
      return NextResponse.json({ error: 'Invalid ticket status.' }, { status: 400 });
    }

    const newStatus = (status as TicketStatus) || ticket.status;
    const newNotes = resolution_notes !== undefined ? resolution_notes : ticket.resolution_notes;
    let newAssignee = ticket.assignee_user_id;

    if (user.role === 'FACILITY_MANAGER' && assignee_user_id !== undefined) {
      newAssignee = assignee_user_id || null;
    }

    // Update ticket in database
    await query(
      `UPDATE tickets SET
        status = $1,
        resolution_notes = $2,
        assignee_user_id = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4;`,
      [newStatus, newNotes, newAssignee, ticketId]
    );

    // If ticket is transitioned to 'Resolved', create a maintenance history record ONCE with pgvector embedding
    if (newStatus === 'Resolved') {
      const existingRecord = await query(
        'SELECT id FROM maintenance_records WHERE ticket_id = $1;',
        [ticketId]
      );

      if (existingRecord.rows.length === 0) {
        const issueTitle = ticket.title;
        const issueDesc = ticket.description;
        const resolution = newNotes?.trim() || 'Resolved and tested by technical specialist.';

        // Build rich semantic text and compute real local embedding
        const embeddingText = `${issueTitle}. Description: ${issueDesc}. Resolution: ${resolution}`;
        let vectorString: string | null = null;

        try {
          const embeddingVector = await generateEmbedding(embeddingText);
          vectorString = formatVectorForPg(embeddingVector);
        } catch (embedErr) {
          console.error('[Ticket Resolution] Embedding generation warning:', embedErr);
        }

        const dedupeKey = `TICKET:${ticket.ticket_code}`;

        await query(
          `INSERT INTO maintenance_records (
            asset_id, ticket_id, dedupe_key, issue_title, issue_description, resolution,
            performed_by_user_id, record_date, embedding
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8::vector)
          ON CONFLICT (dedupe_key) DO UPDATE SET
            issue_title = EXCLUDED.issue_title,
            issue_description = EXCLUDED.issue_description,
            resolution = EXCLUDED.resolution,
            embedding = EXCLUDED.embedding;`,
          [
            ticket.asset_id,
            ticketId,
            dedupeKey,
            issueTitle,
            issueDesc,
            resolution,
            user.id,
            vectorString,
          ]
        );
      }

      // Notify Facility Managers that ticket has been resolved
      const mgrs = await query("SELECT id FROM users WHERE role = 'FACILITY_MANAGER' AND is_active = TRUE;");
      for (const mgr of mgrs.rows) {
        await query(
          `INSERT INTO notifications (user_id, asset_id, ticket_id, type, message, dedupe_key)
           VALUES ($1, $2, $3, 'TICKET_STATUS_UPDATED', $4, $5)
           ON CONFLICT (user_id, dedupe_key) DO NOTHING;`,
          [
            mgr.id,
            ticket.asset_id,
            ticketId,
            `Ticket ${ticket.ticket_code} (${ticket.title}) marked RESOLVED by ${user.full_name}.`,
            `RESOLVED:${ticket.ticket_code}:${ticket.updated_at}`,
          ]
        );
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error('Update ticket error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
