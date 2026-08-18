import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleSuspension = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    if (window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
      setUsers(users.map(u => u.id === id ? { ...u, approval_status: newStatus } : u));
      try {
        await supabase
          .from('profiles')
          .update({ approval_status: newStatus })
          .eq('id', id);
      } catch (err) {
        console.error("Failed to update status", err);
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '24px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>User Management</h3>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Permission Group</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Trust Score</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center' }}>Loading users...</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center' }}>No users found.</td></tr>
          ) : users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: user.approval_status === 'SUSPENDED' ? '#fef2f2' : '#fff' }}>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>{user.role || 'User'}</td>
              <td style={tdStyle}>
                <span style={{ padding: '4px 8px', backgroundColor: user.approval_status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: user.approval_status === 'APPROVED' ? '#166534' : '#991b1b', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  {user.approval_status || 'PENDING'}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: (user.trust_score || 50) > 80 ? '#16a34a' : (user.trust_score || 50) < 30 ? '#dc2626' : '#ca8a04', fontWeight: 'bold' }}>{user.trust_score || 50}/100</span>
              </td>
              <td style={tdStyle}>
                <button 
                  onClick={() => toggleSuspension(user.id, user.approval_status)} 
                  style={{ ...btnStyle, backgroundColor: user.approval_status === 'SUSPENDED' ? '#3b82f6' : '#ef4444' }}
                >
                  {user.approval_status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = { padding: '12px 16px', color: '#4b5563', fontSize: '14px' };
const tdStyle = { padding: '16px', color: '#1f2937', fontSize: '14px' };
const btnStyle = { padding: '6px 12px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
