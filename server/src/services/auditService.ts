import { pool } from '../db.js';

export interface AuditParams {
  action: string;
  entity: string;
  entityId: string | null;
  userId: string | null;
  role: string | null;
  previousState?: any;
  newState?: any;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

export class AuditService {
  /**
   * Logs an action into the audit_logs table.
   */
  static async log(params: AuditParams): Promise<void> {
    const payload = {
      previousState: params.previousState,
      newState: params.newState,
      role: params.role,
      ip: params.ip || 'unknown',
      userAgent: params.userAgent || 'unknown',
      requestId: params.requestId || 'unknown'
    };

    try {
      const query = `
        INSERT INTO audit_logs (action, entity, entity_id, performed_by, new_value)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(query, [
        params.action, 
        params.entity, 
        params.entityId, 
        params.userId, 
        JSON.stringify(payload)
      ]);
    } catch (err) {
      console.error('[AUDIT_ERROR] Failed to write audit log:', err);
    }
  }
}
