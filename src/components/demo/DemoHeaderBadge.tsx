import React from 'react';
import { C } from '../../constants/theme';
import { useDemo } from '../../contexts/DemoContext';
import { Sparkles, RotateCcw, ShieldAlert, LogOut, ChevronDown } from 'lucide-react';

export function DemoHeaderBadge({ onNavigateToFullDashboard }: { onNavigateToFullDashboard?: () => void }) {
  const { isDemoActive, activeUser, logoutDemoUser, resetDemo, exitDemo } = useDemo();

  if (!isDemoActive) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #1E2420 0%, #2E3430 50%, #1E2420 100%)',
      color: 'white',
      padding: '8px 24px',
      fontSize: 13,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid rgba(126, 200, 160, 0.25)`,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 99999,
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Left Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(126, 200, 160, 0.18)',
          border: '1px solid rgba(126, 200, 160, 0.4)',
          color: '#7EC8A0',
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#7EC8A0',
            boxShadow: '0 0 10px #7EC8A0',
            animation: 'pulse 1.5s infinite'
          }} />
          <Sparkles size={13} />
          DEMO MODE
        </div>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
          Logged In Account: <strong style={{ color: 'white' }}>{activeUser?.name || 'Green Bowl Restaurant'} ({activeUser?.email})</strong>
        </span>
      </div>

      {/* Center/Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Switch Account / Log Out */}
        <button
          onClick={logoutDemoUser}
          title="Log out and return to Demo Account Selector"
          style={{
            background: C.forest,
            color: 'white',
            border: 'none',
            padding: '5px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <LogOut size={13} />
          Switch Demo Account
        </button>

        {/* Reset Demo */}
        <button
          onClick={resetDemo}
          title="Reset sample data state"
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '5px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        >
          <RotateCcw size={13} />
          Reset Demo Data
        </button>

        {/* Backend Health Check Button */}
        {onNavigateToFullDashboard && (
          <button
            onClick={onNavigateToFullDashboard}
            title="Inspect Supabase & Backend Connection Health"
            style={{
              background: 'rgba(126, 200, 160, 0.2)',
              color: '#7EC8A0',
              border: '1px solid rgba(126, 200, 160, 0.4)',
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ShieldAlert size={13} />
            Health Check
          </button>
        )}

        {/* Exit Demo */}
        <button
          onClick={exitDemo}
          title="Return to real authentication mode"
          style={{
            background: 'rgba(192, 57, 43, 0.2)',
            color: '#FF8A8A',
            border: '1px solid rgba(192, 57, 43, 0.4)',
            padding: '5px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <LogOut size={13} />
          Exit Demo
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.4; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
