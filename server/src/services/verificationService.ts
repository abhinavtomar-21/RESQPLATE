import { supabase, pool, VerificationRequest } from '../db.js';

export class VerificationService {
  async getRequests(): Promise<any[]> {
    const { data, error } = await supabase
      .from('verification_requests')
      .select(`
        *,
        profiles (email, role, phone)
      `)
      .is('deleted_at', null)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error("Error fetching requests", error);
      return [];
    }
    return data;
  }

  async createRequest(reqData: Partial<VerificationRequest>): Promise<VerificationRequest> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertReqQuery = `
        INSERT INTO verification_requests (restaurant_id, restaurant_name, status, documents)
        VALUES ($1, $2, 'PENDING', $3)
        RETURNING *
      `;
      const values = [
        reqData.restaurant_id || reqData.user_id,
        reqData.restaurant_name || reqData.organization_name || 'Organization',
        JSON.stringify({ url: reqData.doc_url || reqData.doc_name || 'Document.pdf' })
      ];
      
      const reqResult = await client.query(insertReqQuery, values);
      
      const updateProfileQuery = `
        UPDATE profiles
        SET documents_uploaded = true, approval_status = 'DOCUMENT_REVIEW', status = 'DOCUMENT_REVIEW'
        WHERE id = $1
      `;
      await client.query(updateProfileQuery, [reqData.user_id]);
      
      await client.query('COMMIT');
      return reqResult.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async processRequest(id: string, action: 'APPROVE' | 'REJECT' | 'REQUEST_MORE', reviewerId: string = 'Admin_Master', notesOrReason?: string): Promise<boolean> {
    const newStatus = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'MORE_DOCS_REQUESTED';
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const reqRes = await client.query('SELECT restaurant_id FROM verification_requests WHERE id = $1 AND deleted_at IS NULL', [id]);
      if (reqRes.rowCount === 0) throw new Error("Verification request not found");
      const userId = reqRes.rows[0].restaurant_id;

      const updateReqQuery = `
        UPDATE verification_requests
        SET status = $1, reviewed_by = $2, reviewed_at = NOW(), notes = $3
        WHERE id = $4
      `;
      await client.query(updateReqQuery, [
        newStatus, 
        reviewerId, 
        notesOrReason || null,
        id
      ]);

      const profileUpdates = [];
      const profileValues = [newStatus, userId];
      let paramCount = 3;
      
      let updateProfileStr = `UPDATE profiles SET approval_status = $1`;
      
      if (action === 'APPROVE') {
        updateProfileStr += `, onboarding_completed = true`;
      }
      if (action === 'REJECT') {
        updateProfileStr += `, rejection_reason = $${paramCount}`;
        profileValues.push(notesOrReason as any);
        paramCount++;
      }
      if (action === 'REQUEST_MORE') {
        updateProfileStr += `, more_docs_notes = $${paramCount}`;
        profileValues.push(notesOrReason as any);
        paramCount++;
      }
      
      updateProfileStr += ` WHERE id = $2`;
      await client.query(updateProfileStr, profileValues);
      
      // Audit log insertion
      const auditQuery = `
        INSERT INTO audit_logs (action, entity, entity_id, performed_by, new_value)
        VALUES ($1, 'verification_request', $2, $3, $4)
      `;
      await client.query(auditQuery, [
        `VERIFICATION_${action}`,
        id,
        reviewerId,
        JSON.stringify({ status: newStatus, notes: notesOrReason || null })
      ]);

      // Notification creation
      const notifQuery = `
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, 'SYSTEM')
      `;
      const notifTitle = action === 'APPROVE' ? 'Account Approved' : action === 'REJECT' ? 'Account Rejected' : 'More Documents Required';
      const notifMsg = action === 'APPROVE' ? 'Your business verification request has been approved.' : action === 'REJECT' ? `Your request was rejected: ${notesOrReason || 'No reason provided'}` : `Please submit additional documents: ${notesOrReason || 'Action required'}`;
      await client.query(notifQuery, [userId, notifTitle, notifMsg]);

      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(e);
      return false;
    } finally {
      client.release();
    }
  }

  async suspendAccount(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: 'SUSPENDED', status: 'SUSPENDED' })
      .eq('id', id);
    return !error;
  }

  async softDeleteRequest(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('verification_requests')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  }
}

export const verificationService = new VerificationService();

