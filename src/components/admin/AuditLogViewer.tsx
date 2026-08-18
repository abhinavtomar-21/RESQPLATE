import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*, profiles(email)')
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (data) {
          setLogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>Enterprise Audit Logs</h3>
        <span style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>Immutable Ledger</span>
      </div>
      
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading logs...</div>
      ) : logs.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No audit logs found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.map(log => (
            <div key={log.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: log.action.includes('FLAGGED') || log.action.includes('SUSPICIOUS') ? '#dc2626' : '#2563eb' }}>{log.action}</strong>
                <span style={{ color: '#6b7280' }}>{new Date(log.created_at).toLocaleString()}</span>
              </div>
              <div style={{ color: '#4b5563', marginBottom: '8px' }}>
                Actor: <strong>{log.profiles?.email || log.performed_by || 'System'}</strong> 
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#fff', padding: '8px', borderRadius: '4px', border: '1px dashed #cbd5e1' }}>
                <span style={{ color: '#94a3b8' }}>{JSON.stringify(log.old_value)}</span>
                <span>➔</span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{JSON.stringify(log.new_value)}</span>
              </div>
              <div style={{ marginTop: '8px', color: '#9ca3af', fontSize: '11px', fontFamily: 'monospace' }}>
                Entity: {log.entity} | ID: {log.entity_id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
