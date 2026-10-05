import React, { useState } from 'react';
import { C } from '../../constants/theme';
import { ZestioLogo, Btn } from '../shared/SharedComponents';
import { Lock, Mail, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminPortalProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await authService.signIn(email, password);
      if (!data?.user) throw new Error('No user returned');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('Could not fetch user profile');
      }

      if (profileData.role === 'Administrator') {
        onLoginSuccess(); // The actual user data is fetched by AuthContext's onAuthStateChange
      } else {
        setError('Invalid administrator credentials or unauthorized role.');
        await authService.signOut(); // Sign out if they aren't an admin
      }
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      setError(err.message || 'Connection to auth server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      
      <div className="anim-fadeUp" style={{ maxWidth: 480, width: '100%' }}>
        
        {/* Header Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <ZestioLogo size={44} />
        </div>

        <div style={{ background: C.white, borderRadius: 28, padding: '40px 36px', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid rgba(122,143,120,0.18)' }}>
          
          <button 
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: C.olive, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}
          >
            <ArrowLeft size={15} /> Back to main site
          </button>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.sageLight, color: C.forest, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
              <ShieldCheck size={14} />
              <span>Restricted Platform Portal</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Administrator Sign In
            </h2>
            <p style={{ fontSize: 14, color: '#6B7C6E', marginTop: 4 }}>
              Sign in with authorized administrator credentials to manage compliance and verifications.
            </p>
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={iconStyle} />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  style={inputStyle} 
                  placeholder="admin@Zestio.com"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Master Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  style={inputStyle} 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <Btn variant="primary" size="lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Authenticating Admin...' : 'Sign In as Administrator'} <ArrowRight size={16} />
              </Btn>
            </div>
          </form>

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
