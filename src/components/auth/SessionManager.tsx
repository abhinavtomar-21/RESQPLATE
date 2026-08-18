import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Session {
  ip: string;
  userAgent: string;
  timestamp: string;
}

export const SessionManager: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const res = await fetch('http://localhost:5000/api/auth/sessions', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          const data = await res.json();
          if (data.success && data.sessions && data.sessions.length > 0) {
            setSessions(data.sessions);
          } else {
            // Fallback to current device
            setSessions([{ ip: 'Current Device', userAgent: navigator.userAgent, timestamp: new Date().toISOString() }]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sessions", err);
        setSessions([{ ip: 'Current Device', userAgent: navigator.userAgent, timestamp: new Date().toISOString() }]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const revokeSession = async (index: number) => {
    if (window.confirm("Are you sure you want to log out of this device?")) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetch(`http://localhost:5000/api/auth/sessions/${index}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
        }
        setSessions(sessions.filter((_, i) => i !== index));
      } catch (err) {
        console.error("Failed to revoke session", err);
      }
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your devices...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
      <h3 style={{ marginBottom: '5px', color: '#111827' }}>Active Sessions & Devices</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
        You are currently logged in to {sessions.length} device{sessions.length !== 1 ? 's' : ''}. If you see a device you don't recognize, revoke it immediately and change your password.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {sessions.map((session, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: i === 0 ? '#f0fdf4' : '#fff' }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
                {session.userAgent.includes('iPhone') ? '📱 Apple iPhone' : '💻 Desktop Browser'} {i === 0 && <span style={{ color: '#16a34a', fontSize: '12px', marginLeft: '8px', padding: '2px 8px', backgroundColor: '#dcfce7', borderRadius: '10px' }}>Active Now</span>}
              </div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                IP: {session.ip} • Last seen: {new Date(session.timestamp).toLocaleString()}
              </div>
            </div>
            
            {i !== 0 && (
              <button 
                onClick={() => revokeSession(i)}
                style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Revoke Session
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
