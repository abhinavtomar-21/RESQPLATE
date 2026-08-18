import React, { useState } from 'react';
import { C } from './constants/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DemoProvider, useDemo } from './contexts/DemoContext';
import { DemoHeaderBadge } from './components/demo/DemoHeaderBadge';
import { DemoInteractiveExperience } from './components/demo/DemoInteractiveExperience';
import { DemoLoginModal } from './components/demo/DemoLoginModal';
import { RegistrationFlow } from './components/auth/RegistrationFlow';
import { PendingVerificationScreen, SuspendedScreen, RejectedScreen, MoreDocsRequestedScreen } from './components/auth/StatusScreens';
import { MfaChallenge } from './components/auth/MfaChallenge';
import { SessionManager } from './components/auth/SessionManager';
import { VerificationManager } from './components/admin/VerificationManager';
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogViewer } from './components/admin/AuditLogViewer';
import { NotificationPanel } from './components/layout/LayoutComponents';
import { ResQPlateLogo } from './components/shared/SharedComponents';

// Pages
import { LandingPage, RoleChooser, LuxuryFluidWaves } from './pages/LandingPage';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { NGODashboard } from './pages/NGODashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { BackendHealthCheck } from './pages/BackendHealthCheck';

import { AdminPortal } from './components/auth/AdminPortal';
import { SignInModal } from './components/auth/SignInModal';
import { ResetPasswordModal } from './components/auth/ResetPasswordModal';

function AppContent() {
  const { user, isLoading, login, logout, verifyMFA, updateUserState, isResettingPassword, clearResetPasswordMode } = useAuth();
  const { isDemoActive, activeDemoAccount, activeRole, enterDemo } = useDemo();
  const [view, setView] = useState<'landing' | 'register' | 'dashboard' | 'session_manager' | 'choose' | 'admin_portal' | 'signin' | 'demo' | 'health'>('landing');
  const [notifOpen, setNotifOpen] = useState(false);

  const nav = (v: string) => {
    if (v === 'demo') {
      enterDemo();
      setView('demo');
    } else {
      setView(v as any);
    }
  };

  // Handle Dedicated Callback Routes
  const path = window.location.pathname;
  
  React.useEffect(() => {
    if (path.includes('/backend-health') || path === '/backend-health') {
      setView('health');
    } else if (path.includes('/demo') || path === '/demo') {
      nav('demo');
    } else if (!isLoading && path.startsWith('/auth/')) {
      // Clear the URL to return to standard SPA routing
      window.history.replaceState({}, document.title, '/');
      // Trigger a re-render
      nav('landing'); 
    }
  }, [isLoading, path]);

  // Show full-screen loading either during initial load or while processing a callback
  if (isLoading || (path.startsWith('/auth/') && path !== '/')) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.ivory }}>
        <ResQPlateLogo size={48} />
        <h2 style={{ marginTop: 24, fontSize: 24, color: C.charcoal, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {path.includes('email-confirmed') ? 'Verifying your email...' : path.includes('reset-password') ? 'Verifying reset link...' : 'Authenticating...'}
        </h2>
        <p style={{ marginTop: 12, color: C.olive }}>Please wait while we securely load your session.</p>
        <div style={{ marginTop: 32, width: 40, height: 40, border: `4px solid ${C.sageLight}`, borderTopColor: C.forest, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Global State-Based Route Decision Engine
  if (user) {
    // TELEMETRY: DEBUG LOGS REQUESTED BY USER
    let targetRoute = 'Unknown';
    let reason = 'Unknown';
    if (user.role === 'Administrator' || (user.permissionGroup && user.permissionGroup.includes('Admin') && user.permissionGroup !== 'NGO Admin')) {
      targetRoute = 'AdminDashboard';
      reason = 'User is an Administrator';
    } else if (!user.email_verified) {
      targetRoute = 'PendingVerificationScreen (Email)';
      reason = 'Email not verified';
    } else if (!user.profile_completed) {
      targetRoute = 'RegistrationFlow (Profile)';
      reason = 'Profile not completed';
    } else if (user.role !== 'Volunteer' && !user.documents_uploaded) {
      targetRoute = 'RegistrationFlow (Documents)';
      reason = 'Documents not uploaded';
    } else if (user.role !== 'Volunteer' && user.approval_status !== 'APPROVED') {
      targetRoute = user.approval_status === 'REJECTED' ? 'RejectedScreen' : user.approval_status === 'MORE_DOCS_REQUESTED' ? 'MoreDocsRequestedScreen' : user.approval_status === 'SUSPENDED' ? 'SuspendedScreen' : 'PendingVerificationScreen (Under Review)';
      reason = `Approval status is ${user.approval_status}`;
    } else if (view === 'session_manager') {
      targetRoute = 'SessionManager';
      reason = 'User explicitly navigated to Session Manager';
    } else {
      targetRoute = `${user.role}Dashboard`;
      reason = 'Onboarding completed and fully approved';
    }

    console.log(`
=================================================
[TELEMETRY] ROUTING ENGINE DECISION
=================================================
Current User ID      : ${user.id}
Current Role         : ${user.role}
Email Verified       : ${user.email_verified}
Profile Completed    : ${user.profile_completed}
Documents Uploaded   : ${user.documents_uploaded}
Approval Status      : ${user.approval_status}
Onboarding Completed : ${user.onboarding_completed}
-------------------------------------------------
Target Route         : ${targetRoute}
Reason for Redirect  : ${reason}
=================================================
    `);

    // ==========================================
    // EXPLICIT ROUTING ENGINE (AS REQUESTED)
    // ==========================================

    // 1. If email is not verified
    if (!user.email_verified) {
      return <PendingVerificationScreen onLogout={logout} />;
    }

    // 2. Else if profile_completed == false
    if (!user.profile_completed) {
      return (
        <RegistrationFlow 
          initialStep="COMPLETE_PROFILE"
          initialRole={user.role ? user.role.toLowerCase() : 'restaurant'}
          onComplete={() => updateUserState({ profile_completed: true })}
          onCancel={logout}
        />
      );
    }

    // 3. Document Upload (Sub-step of Profile Completion for NGO/Restaurant)
    if (user.role !== 'Volunteer' && user.role !== 'Administrator' && !user.documents_uploaded) {
      return (
        <RegistrationFlow 
          initialStep="DOCUMENT_UPLOAD"
          initialRole={user.role ? user.role.toLowerCase() : 'restaurant'}
          onComplete={() => updateUserState({ documents_uploaded: true, approval_status: 'DOCUMENT_REVIEW' })}
          onCancel={logout}
        />
      );
    }

    // 4. Session Manager
    if (view === 'session_manager') {
       return (
         <div style={{ padding: '40px', background: C.ivory, minHeight: '100vh' }}>
           <button onClick={() => setView('dashboard')} style={{ padding: '10px 20px', borderRadius: 8, cursor: 'pointer', marginBottom: 20 }}>← Back to Dashboard</button>
           <SessionManager />
         </div>
       );
    }

    // 5. Explicit Role Routing
    if (user.role === 'Administrator' || (user.permissionGroup && user.permissionGroup.includes('Admin') && user.permissionGroup !== 'NGO Admin')) {
      if (!user.mfaVerified) {
        return <MfaChallenge onSuccess={async () => { await verifyMFA('123456'); setView('dashboard'); }} />;
      }
      return (
        <div style={{ background: C.ivory, minHeight: '100vh', padding: '24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.forest, background: C.sageLight, padding: '6px 16px', borderRadius: 999 }}>
              👑 System Administrator Portal
            </div>
            <button onClick={logout} style={{ background: C.danger, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
              Sign Out Admin
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <VerificationManager />
            <UserManagement />
            <AuditLogViewer />
            <AdminDashboard onBack={logout} onNotif={() => setNotifOpen(true)} />
          </div>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
      );
    }

    if (user.role === 'Volunteer' || (user.permissionGroup && user.permissionGroup.includes('Volunteer'))) {
      return (
        <div>
          <VolunteerDashboard onBack={logout} onNotif={() => setNotifOpen(true)} />
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
      );
    }

    // For Restaurant and NGO, check approval status
    if (user.approval_status !== 'APPROVED') {
      if (user.approval_status === 'REJECTED') {
        return <RejectedScreen reason={user.rejection_reason} onLogout={logout} onReupload={() => updateUserState({ documents_uploaded: false, approval_status: 'DOCUMENT_REVIEW' })} />;
      }
      if (user.approval_status === 'MORE_DOCS_REQUESTED') {
        return <MoreDocsRequestedScreen notes={user.more_docs_notes} onLogout={logout} onReupload={() => updateUserState({ documents_uploaded: false, approval_status: 'DOCUMENT_REVIEW' })} />;
      }
      if (user.approval_status === 'SUSPENDED') {
        return <SuspendedScreen onLogout={logout} />;
      }
      // PENDING / DOCUMENT_REVIEW
      return <PendingVerificationScreen onLogout={logout} />;
    }

    if (user.role === 'NGO' || (user.permissionGroup && user.permissionGroup.includes('NGO'))) {
      return (
        <div>
          <button onClick={() => setView('session_manager')} style={{position: 'absolute', top: 20, right: 100, zIndex: 9999, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'}}>Manage Devices</button>
          <NGODashboard onBack={logout} onNotif={() => setNotifOpen(true)} />
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
      );
    }

    // Default to Restaurant
    return (
      <div>
         <button onClick={() => setView('session_manager')} style={{position: 'absolute', top: 20, right: 100, zIndex: 9999, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'}}>Manage Devices</button>
         <RestaurantDashboard onBack={logout} onNotif={() => setNotifOpen(true)} />
         <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>
    );
  }

  // Unauthenticated Routes or Dedicated Demo Experience Route
  return (
    <div>
      <DemoHeaderBadge onNavigateToFullDashboard={() => setView('health')} />
      <DemoLoginModal open={isDemoActive && activeDemoAccount === null} />
      {view === 'health' && <BackendHealthCheck onBack={() => setView('landing')} />}
      {view === 'demo' && <DemoInteractiveExperience />}
      {view === 'landing' && <LuxuryFluidWaves />}
      {view === 'landing' && <LandingPage onNavigate={nav} />}
      <SignInModal 
        open={view === 'signin'}
        onClose={() => nav('landing')}
        onNavigateToSignUp={() => nav('choose')}
        onNavigateToAdminPortal={() => nav('admin_portal')}
      />
      {view === 'admin_portal' && (
        <AdminPortal 
          onLoginSuccess={() => nav('landing')} // AuthContext handles the state
          onCancel={() => nav('landing')} 
        />
      )}
      {(view === 'choose' || view === 'register') && (
        <RegistrationFlow 
          onComplete={() => nav('landing')} 
          onCancel={() => nav('landing')} 
          onOpenAdminPortal={() => nav('admin_portal')}
        />
      )}
      {isResettingPassword && (
        <ResetPasswordModal 
          onClose={() => clearResetPasswordMode()}
          onSuccess={() => {
            clearResetPasswordMode();
            nav('signin');
            alert("Password successfully updated. You can now log in.");
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <DemoProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DemoProvider>
  );
}
