import React from 'react';
import { C } from '../../constants/theme';
import { ZestioLogo, Btn } from '../shared/SharedComponents';
import { ShieldCheck, Clock, LogOut, CheckCircle2, AlertOctagon } from 'lucide-react';

export const PendingVerificationScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const handleInstantApprove = () => {
    const currentUser = JSON.parse(localStorage.getItem('Zestio_auth') || '{}');
    if (currentUser && currentUser.user) {
      currentUser.user.status = 'APPROVED';
      localStorage.setItem('Zestio_auth', JSON.stringify(currentUser));
      window.location.reload();
    } else {
      onLogout();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div className="anim-fadeUp" style={{ maxWidth: 540, width: '100%', background: C.white, borderRadius: 28, padding: '44px 36px', textAlign: 'center', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid rgba(122,143,120,0.15)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <ZestioLogo size={44} />
        </div>

        <div style={{ width: 68, height: 68, borderRadius: '50%', background: C.sageLight, color: C.forest, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Clock size={34} />
        </div>

        <h2 style={{ fontSize: 30, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Account Under Review
        </h2>

        <p style={{ fontSize: 15, color: '#6B7C6E', lineHeight: 1.6, marginBottom: 28 }}>
          Your uploaded documents are currently being reviewed by our administration team. This usually takes 1-2 business days.
        </p>

        <div style={{ background: C.sageLight, borderRadius: 16, padding: '16px 20px', textAlign: 'left', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.forest, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} /> Compliance Verification in Progress
          </div>
          <div style={{ fontSize: 13, color: '#5A6B5C', lineHeight: 1.5 }}>
            An email notification will be sent to your inbox as soon as your FSSAI/NGO certificate is verified by an Administrator.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Btn variant="primary" size="lg" onClick={handleInstantApprove} style={{ width: '100%', justifyContent: 'center' }}>
            <CheckCircle2 size={18} /> Instant Approve Account (Demo Mode)
          </Btn>
          
          <button 
            onClick={onLogout}
            style={{ background: C.beige, border: 'none', color: C.charcoal, padding: '12px 20px', borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%' }}
          >
            <LogOut size={16} /> Sign Out &amp; Return to Home
          </button>
        </div>

      </div>
    </div>
  );
};

export const SuspendedScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div className="anim-fadeUp" style={{ maxWidth: 540, width: '100%', background: C.white, borderRadius: 28, padding: '44px 36px', textAlign: 'center', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid #FCA5A5' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <ZestioLogo size={44} />
        </div>

        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#FEE2E2', color: C.danger, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <AlertOctagon size={34} />
        </div>

        <h2 style={{ fontSize: 30, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Account Suspended
        </h2>

        <p style={{ fontSize: 15, color: '#6B7C6E', lineHeight: 1.6, marginBottom: 28 }}>
          Your account has been suspended due to a compliance violation. Please contact platform support for resolution.
        </p>

        <Btn variant="danger" size="lg" onClick={onLogout} style={{ width: '100%', justifyContent: 'center' }}>
          <LogOut size={16} /> Sign Out
        </Btn>

      </div>
    </div>
  );
};

export const RejectedScreen: React.FC<{ reason?: string; onLogout: () => void; onReupload: () => void }> = ({ reason, onLogout, onReupload }) => {
  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div className="anim-fadeUp" style={{ maxWidth: 540, width: '100%', background: C.white, borderRadius: 28, padding: '44px 36px', textAlign: 'center', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid #FCA5A5' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <ZestioLogo size={44} />
        </div>

        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#FEE2E2', color: C.danger, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <AlertOctagon size={34} />
        </div>

        <h2 style={{ fontSize: 30, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Application Needs Revision
        </h2>

        <p style={{ fontSize: 15, color: '#6B7C6E', lineHeight: 1.6, marginBottom: 20 }}>
          Your verification request was reviewed by our compliance team and could not be approved as submitted.
        </p>

        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, padding: '16px 20px', textAlign: 'left', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.danger, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertOctagon size={16} /> Rejection Reason from Compliance Auditor:
          </div>
          <div style={{ fontSize: 14, color: '#991B1B', fontWeight: 600, lineHeight: 1.5 }}>
            "{reason || 'Document verification failed regulatory standards or license was expired.'}"
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Btn variant="primary" size="lg" onClick={onReupload} style={{ width: '100%', justifyContent: 'center' }}>
            Re-upload Corrected Documents
          </Btn>
          
          <button 
            onClick={onLogout}
            style={{ background: C.beige, border: 'none', color: C.charcoal, padding: '12px 20px', borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export const MoreDocsRequestedScreen: React.FC<{ notes?: string; onLogout: () => void; onReupload: () => void }> = ({ notes, onLogout, onReupload }) => {
  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div className="anim-fadeUp" style={{ maxWidth: 540, width: '100%', background: C.white, borderRadius: 28, padding: '44px 36px', textAlign: 'center', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid #C7D2FE' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <ZestioLogo size={44} />
        </div>

        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#E0E7FF', color: '#3730A3', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <ShieldCheck size={34} />
        </div>

        <h2 style={{ fontSize: 30, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Additional Information Required
        </h2>

        <p style={{ fontSize: 15, color: '#6B7C6E', lineHeight: 1.6, marginBottom: 20 }}>
          Our audit team has requested supplementary documentation to complete your onboarding.
        </p>

        <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 16, padding: '16px 20px', textAlign: 'left', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#3730A3', marginBottom: 4 }}>
            Auditor Request Notes:
          </div>
          <div style={{ fontSize: 14, color: '#1E1B4B', fontWeight: 600, lineHeight: 1.5 }}>
            "{notes || 'Please upload clear scanned copy of your updated 2026 Food Safety / NGO registration certificate.'}"
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Btn variant="primary" size="lg" onClick={onReupload} style={{ width: '100%', justifyContent: 'center' }}>
            Upload Requested Documents
          </Btn>
          
          <button 
            onClick={onLogout}
            style={{ background: C.beige, border: 'none', color: C.charcoal, padding: '12px 20px', borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};
