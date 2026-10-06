import React, { useState } from 'react';
import { Bell, ChevronDown, X, Truck, CheckCircle2, Building2, Cpu, Trophy, FileText } from 'lucide-react';
import { C } from '../../constants/theme';
import { Avatar } from '../shared/SharedComponents';

// ─── NOTIFICATION PANEL ──────────────────────────────────────────────────────
export const NOTIFS = [
  { id: 1, type: 'pickup', title: 'Volunteer en route', msg: 'Rohan K. will arrive in ~12 min to collect your donation.', time: '2m ago', read: false },
  { id: 2, type: 'success', title: 'Donation completed!', msg: '45 meals delivered to Asha Foundation. Impact cert ready.', time: '1h ago', read: false },
  { id: 3, type: 'ngo', title: 'NGO accepted', msg: 'Green Hope NGO accepted your donation of Mixed Rice.', time: '3h ago', read: true },
  { id: 4, type: 'ai', title: 'Freshness Alert', msg: 'AI detected your paneer dish scores 62/100. Pickup within 2 hrs.', time: '5h ago', read: true },
  { id: 5, type: 'badge', title: 'New badge earned!', msg: 'You unlocked "Eco Warrior" — 100 meals saved!', time: '1d ago', read: true },
  { id: 6, type: 'system', title: 'Monthly CSR report', msg: 'Your July impact report is ready to download.', time: '2d ago', read: true },
]
const notifIcon: Record<string, React.ReactNode> = {
  pickup: <Truck size={16} />, success: <CheckCircle2 size={16} />, ngo: <Building2 size={16} />,
  ai: <Cpu size={16} />, badge: <Trophy size={16} />, system: <FileText size={16} />,
}
const notifColor: Record<string, string> = {
  pickup: C.sage, success: C.success, ngo: C.forest, ai: '#6B48C8', badge: C.warning, system: C.olive,
}

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notifs, setNotifs] = useState(NOTIFS)
  const unread = notifs.filter(n => !n.read).length
  if (!open) return null
  return (
    <div className="anim-fadeIn" style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose}>
      <div className="anim-slideRight" style={{ position: 'absolute', right: 16, top: 16, width: 380, maxHeight: '90vh', background: C.white, borderRadius: 24, boxShadow: '0 24px 80px rgba(46,52,48,0.18)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.beige}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.charcoal }}>Notifications</h3>
            {unread > 0 && <p style={{ fontSize: 12, color: C.olive, marginTop: 2 }}>{unread} unread</p>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} style={{ fontSize: 12, color: C.forest, background: C.sageLight, border: 'none', cursor: 'pointer', borderRadius: 8, padding: '6px 12px', fontWeight: 600 }}>Mark all read</button>
            <button onClick={onClose} style={{ background: C.beige, border: 'none', cursor: 'pointer', borderRadius: 8, padding: 6, display: 'flex', color: C.charcoal }}><X size={16} /></button>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notifs.map(n => (
            <div key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{ padding: '16px 24px', display: 'flex', gap: 14, cursor: 'pointer', background: n.read ? 'transparent' : '#F0F5F0', borderBottom: `1px solid ${C.beige}`, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.beige}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : '#F0F5F0'}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: `${notifColor[n.type]}18`, color: notifColor[n.type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{notifIcon[n.type]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.charcoal }}>{n.title}</span>
                  <span style={{ fontSize: 11, color: C.olive, flexShrink: 0 }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 12, color: '#6B7C6E', marginTop: 3, lineHeight: 1.5 }}>{n.msg}</p>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.forest, flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD LAYOUT ────────────────────────────────────────────────────────
export function DashNav({ title, notifCount, onNotif, onProfile, name }: {
  title: string; notifCount: number; onNotif: () => void; onProfile: () => void; name: string
}) {
  return (
    <div style={{ padding: '18px 32px', background: C.white, borderBottom: `1px solid ${C.beige}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.charcoal, letterSpacing: '-0.02em' }}>{title}</h2>
        <p style={{ fontSize: 12, color: C.olive, marginTop: 2 }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: C.sage, marginRight: 5, verticalAlign: 'middle' }} />
          Live · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <button onClick={onNotif} style={{ background: C.beige, border: 'none', cursor: 'pointer', borderRadius: 12, padding: 10, display: 'flex', color: C.charcoal }}>
            <Bell size={18} />
          </button>
          {notifCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: C.forest, color: 'white', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '2px 6px', minWidth: 18, textAlign: 'center' as const }}>{notifCount}</span>}
        </div>
        <button onClick={onProfile} style={{ background: C.beige, border: 'none', cursor: 'pointer', borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, color: C.charcoal, fontWeight: 600, fontSize: 13 }}>
          <Avatar name={name} size={26} />
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  )
}

export function DashLayout({ sidebar, children, onBack }: { sidebar: React.ReactNode; children: React.ReactNode; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.ivory }}>
      <div style={{ width: 252, background: C.white, borderRight: `1px solid ${C.beige}`, padding: '0 14px 24px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 20 }}>
        <div style={{ padding: '28px 16px 20px', cursor: 'pointer' }} onClick={onBack}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width={32} height={32} viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke={C.forest} strokeWidth="3" fill="none" />
              <path d="M36 12 C36 8, 40 6, 44 10 C42 14, 38 15, 36 12Z" fill={C.sage} />
              <line x1="40" y1="12" x2="40" y2="20" stroke={C.sage} strokeWidth="1.5" />
              <path d="M18 42 C18 30, 62 30, 62 42Z" fill={C.forest} />
              <rect x="16" y="42" width="48" height="4" rx="2" fill={C.forest} />
              <path d="M40 35 C40 35, 36 31, 36 33.5 C36 35.5, 38 37, 40 39 C42 37, 44 35.5, 44 33.5 C44 31, 40 35, 40 35Z" fill="white" />
              <line x1="58" y1="20" x2="58" y2="30" stroke={C.forest} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: C.charcoal, letterSpacing: '-0.03em' }}>
              ZYVORA
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {sidebar}
        </div>
      </div>
      <div style={{ flex: 1, marginLeft: 252, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}
