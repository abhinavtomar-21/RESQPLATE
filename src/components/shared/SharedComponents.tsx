import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { C } from '../../constants/theme';

export function ResQPlateLogo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" stroke={C.forest} strokeWidth="3" fill="none" />
        <path d="M36 12 C36 8, 40 6, 44 10 C42 14, 38 15, 36 12Z" fill={C.sage} />
        <line x1="40" y1="12" x2="40" y2="20" stroke={C.sage} strokeWidth="1.5" />
        <path d="M18 42 C18 30, 62 30, 62 42Z" fill={C.forest} />
        <rect x="16" y="42" width="48" height="4" rx="2" fill={C.forest} />
        <path d="M40 35 C40 35, 36 31, 36 33.5 C36 35.5, 38 37, 40 39 C42 37, 44 35.5, 44 33.5 C44 31, 40 35, 40 35Z" fill="white" />
        <line x1="58" y1="20" x2="58" y2="30" stroke={C.forest} strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="20" x2="56" y2="25" stroke={C.forest} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="60" y1="20" x2="60" y2="25" stroke={C.forest} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M28 54 C28 50, 32 48, 36 50 L40 52 L44 50 C48 48, 52 50, 52 54" stroke={C.sage} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="60" r="3" fill={C.olive} />
        <circle cx="40" cy="60" r="3" fill={C.forest} />
        <circle cx="48" cy="60" r="3" fill={C.olive} />
        <path d="M30 63 L34 68" stroke={C.olive} strokeWidth="2" strokeLinecap="round" />
        <path d="M38 63 L42 68" stroke={C.forest} strokeWidth="2" strokeLinecap="round" />
        <path d="M46 63 L50 68" stroke={C.olive} strokeWidth="2" strokeLinecap="round" />
      </svg>
      {showText && (
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: size * 0.45, color: C.charcoal, letterSpacing: '-0.03em', lineHeight: 1 }}>
            ResQ<span style={{ color: C.forest }}>Plate</span>
          </div>
          <div style={{ fontSize: size * 0.22, color: C.olive, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 600, marginTop: 2 }}>
            Rescue Food, Feed Hope
          </div>
        </div>
      )}
    </div>
  )
}

export function Btn({ children, variant = 'primary', onClick, disabled, className = '', icon, size = 'md', style }: {
  children: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; onClick?: (e?: any) => void;
  disabled?: boolean; className?: string; icon?: React.ReactNode; size?: 'sm' | 'md' | 'lg'; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Inter', sans-serif",
    fontWeight: 600, borderRadius: 18, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease', whiteSpace: 'nowrap' as const, opacity: disabled ? 0.5 : 1,
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14,
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 32px' : '11px 22px',
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: C.forest, color: C.white, boxShadow: '0 4px 16px rgba(70,91,74,0.28)' },
    secondary: { background: C.beige, color: C.charcoal },
    ghost: { background: 'transparent', color: C.forest },
    danger: { background: '#FEE', color: C.danger },
  }
  const [hover, setHover] = useState(false)
  const hoverStyle = hover && !disabled ? (variant === 'primary' ? { background: C.charcoal } : variant === 'secondary' ? { background: '#DDD8CE' } : {}) : {}
  return (
    <button className={`btn-press ${className}`} style={{ ...base, ...variants[variant], ...hoverStyle, ...style }}
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  )
}

export function Bdg({ label, color = 'sage' }: { label: string; color?: 'sage' | 'olive' | 'forest' | 'warning' | 'danger' | 'success' }) {
  const map: Record<string, { bg: string; text: string }> = {
    sage: { bg: C.sageLight, text: C.forest },
    olive: { bg: '#EDF2EA', text: C.olive },
    forest: { bg: '#E8EDE8', text: C.forest },
    warning: { bg: '#FEF9E7', text: '#B7870A' },
    danger: { bg: '#FEE', text: C.danger },
    success: { bg: '#E8F5E9', text: C.success },
  }
  const s = map[color] || map.sage
  return (
    <span style={{
      background: s.bg, color: s.text, padding: '4px 12px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.text, display: 'inline-block' }} />
      {label}
    </span>
  )
}

export function StatCard({ label, value, change, icon, accent }: {
  label: string; value: string; change?: string; icon: React.ReactNode; accent?: string
}) {
  const [hover, setHover] = useState(false)
  return (
    <div style={{
      background: C.white, borderRadius: 24, padding: '24px 28px',
      boxShadow: hover ? '0 16px 56px rgba(46,52,48,0.14)' : '0 2px 16px rgba(46,52,48,0.07)',
      display: 'flex', flexDirection: 'column', gap: 16,
      transform: hover ? 'translateY(-4px)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent || C.sageLight, color: C.forest }}>{icon}</div>
        {change && <span style={{ fontSize: 13, fontWeight: 600, color: change.startsWith('+') ? C.success : C.danger }}>{change}</span>}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.charcoal, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: C.olive, marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const hue = name.charCodeAt(0) % 60
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${120 + hue}, 30%, ${48 + hue % 18}%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  )
}

export function Modal({ open, onClose, children, title, width = 560 }: {
  open: boolean; onClose: () => void; children: React.ReactNode; title?: string; width?: number
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="anim-fadeIn" style={{ position: 'fixed', inset: 0, background: 'rgba(46,52,48,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="anim-scaleIn" style={{ background: C.white, borderRadius: 28, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 96px rgba(46,52,48,0.22)' }}>
        {title && (
          <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.charcoal }}>{title}</h3>
            <button onClick={onClose} style={{ background: C.beige, border: 'none', cursor: 'pointer', borderRadius: 10, padding: 8, display: 'flex', color: C.charcoal }}><X size={18} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function SidebarItem({ icon, label, active, onClick, badge }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; badge?: number
}) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 16px',
      borderRadius: 14, border: 'none', cursor: 'pointer', textAlign: 'left' as const,
      background: active ? C.sageLight : hover ? C.beige : 'transparent',
      color: active ? C.forest : C.olive, fontWeight: active ? 600 : 500,
      fontSize: 14, transition: 'all 0.15s', fontFamily: "'Inter', sans-serif",
    }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <span style={{ display: 'flex', color: active ? C.forest : C.olive }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span style={{ background: C.forest, color: 'white', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 7px' }}>{badge}</span>
      )}
    </button>
  )
}

export function Toggle() {
  const [on, setOn] = useState(Math.random() > 0.4)
  return (
    <button onClick={() => setOn(!on)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: on ? C.forest : C.beige, position: 'relative', transition: 'background 0.2s', padding: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </button>
  )
}
