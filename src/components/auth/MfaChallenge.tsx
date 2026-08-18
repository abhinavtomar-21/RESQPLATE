import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const MfaChallenge: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { verifyMFA, user } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const isValid = await verifyMFA(otp);
    if (isValid) {
      onSuccess();
    } else {
      setError('Invalid Authenticator Code. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ background: '#e0e7ff', padding: '16px', borderRadius: '50%' }}>
           <span style={{ fontSize: '32px' }}>🔒</span>
        </div>
      </div>
      <h2 style={{ marginBottom: '10px', color: '#1f2937' }}>Two-Factor Authentication</h2>
      <p style={{ color: '#4b5563', marginBottom: '25px', fontSize: '14px' }}>
        {user?.permissionGroup === 'Super Admin' 
          ? "As a Super Admin, you are required to verify your identity to proceed."
          : "Please enter the 6-digit code from your Authenticator app."}
      </p>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
          style={{ width: '100%', padding: '15px', fontSize: '24px', letterSpacing: '4px', textAlign: 'center', border: '2px solid #e5e7eb', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          style={{ width: '100%', padding: '14px', backgroundColor: (loading || otp.length !== 6) ? '#9ca3af' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Verifying...' : 'Verify Identity'}
        </button>
      </form>
    </div>
  );
};
