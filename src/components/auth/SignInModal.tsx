import React, { useState } from 'react';
import { C } from '../../constants/theme';
import { ZYVORALogo, Btn } from '../shared/SharedComponents';
import { Mail, Lock, ArrowRight, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToAdminPortal: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ open, onClose, onNavigateToSignUp, onNavigateToAdminPortal }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'signin' | 'forgot_password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await authService.signIn(email.trim(), password);

      if (data.session && data.user) {
        // AuthContext automatically syncs onAuthStateChange and fetches the real profile from Supabase
        onClose();
      }
    } catch (err: any) {
      console.error("Sign In Error:", err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.resetPassword(email.trim(), `${window.location.origin}/auth/reset-password`);
      setSuccess('Password reset link sent! Please check your email.');
    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      setError(err.message || 'Unable to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(46,52,48,0.6)', backdropFilter: 'blur(8px)', padding: 20 }}>
      
      <div className="anim-fadeUp" style={{ background: C.white, borderRadius: 28, maxWidth: 440, width: '100%', padding: '36px 32px', boxShadow: '0 24px 64px rgba(46,52,48,0.2)', border: '1px solid rgba(122,143,120,0.18)', position: 'relative' }}>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: C.beige, border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.charcoal, cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        {/* Header Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <ZYVORALogo size={40} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {mode === 'signin' ? 'Sign In to ZYVORA' : 'Reset Password'}
          </h2>
          <p style={{ fontSize: 14, color: '#6B7C6E', marginTop: 4 }}>
            {mode === 'signin' ? 'Enter your credentials to access your account portal' : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: C.sageLight, border: `1px solid rgba(122,143,120,0.3)`, color: C.forest, padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={iconStyle} />
                <input 
                  type="email" 
                  required 
                  placeholder="name@organization.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={labelStyle}>Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot_password'); setError(null); setSuccess(null); }} style={{ fontSize: 12, color: C.forest, fontWeight: 600, textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: 6 }}>
              <Btn variant="primary" size="lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
              </Btn>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Registered Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={iconStyle} />
                <input 
                  type="email" 
                  required 
                  placeholder="name@organization.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Btn variant="primary" size="lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={16} />
              </Btn>
              <button 
                type="button"
                onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                style={{ background: 'none', border: 'none', color: C.olive, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(122,143,120,0.12)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <span style={{ fontSize: 14, color: '#6B7C6E' }}>New to ZYVORA? </span>
            <button 
              onClick={() => { onClose(); onNavigateToSignUp(); }}
              style={{ background: 'none', border: 'none', color: C.forest, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              Create an Account
            </button>
          </div>

          <button 
            onClick={() => { onClose(); onNavigateToAdminPortal(); }}
            style={{ background: 'none', border: 'none', color: C.olive, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}
          >
            🔒 System Administrator Sign In →
          </button>
        </div>

      </div>

    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: C.charcoal,
  marginBottom: 6,
  letterSpacing: '0.04em',
  textTransform: 'uppercase'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px 13px 44px',
  borderRadius: 14,
  border: '1px solid rgba(122,143,120,0.25)',
  background: C.ivory,
  fontSize: 14,
  fontWeight: 500,
  color: C.charcoal,
  outline: 'none',
  fontFamily: "'Inter', sans-serif"
};

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: 14,
  top: 15,
  color: C.olive
};
