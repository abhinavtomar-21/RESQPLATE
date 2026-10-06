import React from 'react';
import { C } from '../../constants/theme';
import { ZYVORALogo } from '../shared/SharedComponents';
import { Utensils, Building2, Truck, ArrowRight, ShieldCheck, Sparkles, LogIn } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';

export function DemoLoginModal({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const { loginAsDemoAccount, isDemoActive } = useDemo();

  if (!open || !isDemoActive) return null;

  const demoAccounts = [
    {
      type: 'admin' as const,
      roleName: 'ADMINISTRATOR / SUPERVISOR',
      name: 'ZYVORA Admin Overview',
      email: 'admin@ZYVORA.demo',
      location: 'System Control Center',
      icon: <ShieldCheck size={24} color="#8E44AD" />,
      color: '#8E44AD',
      bg: '#F3E5F5',
      badge: 'Step 1 & Approval',
      desc: 'Approve pending user registrations, review food donations, approve batches for NGO matching, and monitor system impact.'
    },
    {
      type: 'restaurant' as const,
      roleName: 'RESTAURANT / DONOR',
      name: 'Green Bowl Restaurant',
      email: 'restaurant@ZYVORA.demo',
      location: 'Vellore, Main Hall',
      icon: <Utensils size={24} color={C.forest} />,
      color: C.forest,
      bg: C.sageLight,
      badge: 'Step 2 & 6',
      desc: 'Create surplus food donation, run AI vision scan, complete safety sign-off, and track final delivery.'
    },
    {
      type: 'ngo' as const,
      roleName: 'NGO / RECEIVER',
      name: 'Hope Foundation',
      email: 'ngo@ZYVORA.demo',
      location: 'Vellore, Branch 2',
      icon: <Building2 size={24} color={C.olive} />,
      color: C.olive,
      bg: C.ivory,
      badge: 'Step 3',
      desc: 'Receive live surplus food alerts, view visual AI analysis, accept donations, and request pickup.'
    },
    {
      type: 'volunteer' as const,
      roleName: 'VOLUNTEER / LOGISTICS',
      name: 'Demo Volunteer',
      email: 'volunteer@ZYVORA.demo',
      location: 'Vellore Delivery Zone',
      icon: <Truck size={24} color={C.warning} />,
      color: C.warning,
      bg: '#FFFBEB',
      badge: 'Step 4 & 5',
      desc: 'Receive instant pickup notifications, accept tasks, collect food from donor, and confirm delivery to NGO.'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(20, 24, 22, 0.75)',
      backdropFilter: 'blur(10px)',
      padding: 20,
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div className="anim-fadeUp" style={{
        background: C.white,
        borderRadius: 28,
        maxWidth: 680,
        width: '100%',
        padding: '36px 36px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(122, 143, 120, 0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.sageLight, color: C.forest, padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            <Sparkles size={13} /> PROFESSOR DEMO SIMULATION
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <ZYVORALogo size={42} />
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.02em', margin: 0 }}>
            Choose Demo Account to Log In
          </h2>
          <p style={{ fontSize: 14, color: C.olive, marginTop: 6, lineHeight: 1.5 }}>
            Simulate three real users interacting in sequence through the same database pipeline.
          </p>
        </div>

        {/* Account Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {demoAccounts.map((acc) => (
            <div
              key={acc.type}
              onClick={() => {
                loginAsDemoAccount(acc.type);
                if (onClose) onClose();
              }}
              style={{
                background: C.white,
                borderRadius: 20,
                padding: '18px 22px',
                border: `2px solid ${C.beige}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = acc.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${acc.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.beige;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: acc.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {acc.icon}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: acc.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {acc.roleName}
                    </span>
                    <span style={{ fontSize: 10, background: C.beige, color: C.charcoal, padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                      {acc.badge}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 17, fontWeight: 800, color: C.charcoal, margin: 0 }}>
                    {acc.name}
                  </h4>
                  <p style={{ fontSize: 12, color: C.olive, margin: '2px 0 0' }}>
                    {acc.email} · {acc.location}
                  </p>
                </div>
              </div>

              <button
                style={{
                  background: acc.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 18px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0
                }}
              >
                <LogIn size={15} /> Log In <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', background: C.ivory, padding: '12px 16px', borderRadius: 14, border: `1px solid ${C.beige}` }}>
          <p style={{ fontSize: 12, color: C.olive, margin: 0, fontWeight: 500 }}>
            🔒 <strong style={{ color: C.charcoal }}>Single Database Pipeline:</strong> Donations created by the Restaurant pass live to the NGO and Volunteer accounts upon logging in.
          </p>
        </div>
      </div>
    </div>
  );
}
