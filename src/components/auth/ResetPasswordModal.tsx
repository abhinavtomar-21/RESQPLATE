import React, { useState } from 'react';
import { C } from '../../constants/theme';
import { ZYVORALogo, Btn } from '../shared/SharedComponents';
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

export const ResetPasswordModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Policy Validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && (password === confirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await authService.updatePassword(password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Your reset link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const getRuleStyle = (met: boolean) => ({
    color: met ? C.forest : C.olive,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: met ? 600 : 500,
    marginBottom: 4
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(46,52,48,0.7)', backdropFilter: 'blur(10px)', padding: 20 }}>
      <div className="anim-fadeUp" style={{ background: C.white, borderRadius: 28, maxWidth: 460, width: '100%', padding: '36px 32px', boxShadow: '0 24px 64px rgba(46,52,48,0.2)', border: '1px solid rgba(122,143,120,0.18)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <ZYVORALogo size={40} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Create New Password
          </h2>
          <p style={{ fontSize: 14, color: '#6B7C6E', marginTop: 6 }}>
            Please enter your new strong password below.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.charcoal, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: 15, color: C.olive }} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '13px 16px 13px 44px', borderRadius: 14, border: '1px solid rgba(122,143,120,0.25)', background: C.ivory, fontSize: 14, fontWeight: 500, color: C.charcoal, outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ background: C.beige, padding: 16, borderRadius: 16, border: '1px solid rgba(122,143,120,0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.charcoal, marginBottom: 8, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Password Policy</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <div style={getRuleStyle(hasMinLength)}>{hasMinLength ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 8+ characters</div>
              <div style={getRuleStyle(hasUpper)}>{hasUpper ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 1 Uppercase</div>
              <div style={getRuleStyle(hasLower)}>{hasLower ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 1 Lowercase</div>
              <div style={getRuleStyle(hasNumber)}>{hasNumber ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 1 Number</div>
              <div style={getRuleStyle(hasSpecial)}>{hasSpecial ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 1 Special Char</div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.charcoal, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: 15, color: C.olive }} />
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '13px 16px 13px 44px', borderRadius: 14, border: '1px solid rgba(122,143,120,0.25)', background: C.ivory, fontSize: 14, fontWeight: 500, color: C.charcoal, outline: 'none' }}
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div style={{ fontSize: 12, color: C.danger, marginTop: 6, fontWeight: 600 }}>Passwords do not match</div>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <Btn variant="primary" size="lg" disabled={loading || !isValid} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Updating Password...' : 'Save New Password'} <ArrowRight size={16} />
            </Btn>
          </div>
          
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.olive, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
