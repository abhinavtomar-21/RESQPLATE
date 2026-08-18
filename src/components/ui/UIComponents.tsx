import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';
import { ResQApi } from '../../services/api';

// ─── CHART DATA & HOOKS ──────────────────────────────────────────────────────
export const weeklyData = [
  { day: 'Mon', meals: 38, kg: 12 }, { day: 'Tue', meals: 52, kg: 18 },
  { day: 'Wed', meals: 44, kg: 15 }, { day: 'Thu', meals: 61, kg: 22 },
  { day: 'Fri', meals: 78, kg: 28 }, { day: 'Sat', meals: 92, kg: 34 },
  { day: 'Sun', meals: 55, kg: 20 },
]
export const monthlyData = [
  { month: 'Jan', meals: 420 }, { month: 'Feb', meals: 380 }, { month: 'Mar', meals: 510 },
  { month: 'Apr', meals: 630 }, { month: 'May', meals: 720 }, { month: 'Jun', meals: 680 },
  { month: 'Jul', meals: 810 },
]
export const pieData = [
  { name: 'Cooked Meals', value: 45, color: C.forest },
  { name: 'Bakery', value: 25, color: C.sage },
  { name: 'Produce', value: 18, color: C.olive },
  { name: 'Dairy', value: 12, color: C.beige },
]
export const adminGrowth = [
  { month: 'Jan', restaurants: 12, ngos: 8, volunteers: 34 },
  { month: 'Feb', restaurants: 18, ngos: 12, volunteers: 48 },
  { month: 'Mar', restaurants: 24, ngos: 16, volunteers: 67 },
  { month: 'Apr', restaurants: 32, ngos: 21, volunteers: 89 },
  { month: 'May', restaurants: 40, ngos: 28, volunteers: 112 },
  { month: 'Jun', restaurants: 52, ngos: 34, volunteers: 145 },
  { month: 'Jul', restaurants: 67, ngos: 41, volunteers: 178 },
]

export const INITIAL_DONATIONS = [
  { id: 'D-4821', food: 'Mixed Veg Biryani', kg: '18 kg', meals: 54, status: 'Delivered', ngo: 'Asha Foundation', score: 87, time: '2h ago' },
  { id: 'D-4820', food: 'Dal Makhani + Naan', kg: '12 kg', meals: 36, status: 'In Transit', ngo: 'Green Hope', score: 79, time: '4h ago' },
  { id: 'D-4819', food: 'Paneer Butter Masala', kg: '8 kg', meals: 24, status: 'Pending', ngo: 'CityFeed NGO', score: 62, time: '6h ago' },
  { id: 'D-4818', food: 'Assorted Breads', kg: '22 kg', meals: 66, status: 'Delivered', ngo: 'Smile Trust', score: 91, time: '1d ago' },
]
export const INITIAL_REQUESTS = [
  { id: 'R-891', donor: 'The Grand Spice', food: 'Biryani (18 kg)', pickup: '2.3 km', deadline: '45 min', priority: 'High', score: 87 },
  { id: 'R-890', donor: 'Baker Street Co.', food: 'Pastries (8 kg)', pickup: '1.1 km', deadline: '2 hrs', priority: 'Normal', score: 79 },
  { id: 'R-889', donor: 'Metro Hotel', food: 'Mixed Veg (25 kg)', pickup: '3.8 km', deadline: '1 hr', priority: 'Urgent', score: 91 },
]

export function useDonations(statusFilter = 'All') {
  const [data, setData] = useState<any[]>([])
  useEffect(() => { 
    const load = () => {
      ResQApi.getDonations(statusFilter)
        .then(setData)
        .catch(err => {
          console.warn('Using live demo store fallback.', err)
          setData(INITIAL_DONATIONS)
        }) 
    }
    load();
    window.addEventListener('resq_store_updated', load);
    return () => window.removeEventListener('resq_store_updated', load);
  }, [statusFilter])
  return data
}

export function useRequests() {
  const [data, setData] = useState<any[]>([])
  useEffect(() => { 
    const load = () => {
      ResQApi.getVolunteerRequests()
        .then(setData)
        .catch(err => {
          console.warn('Using live demo store fallback.', err)
          setData(INITIAL_REQUESTS)
        }) 
    }
    load();
    window.addEventListener('resq_store_updated', load);
    return () => window.removeEventListener('resq_store_updated', load);
  }, [])
  return data
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
export function AnimCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let timer: any;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let current = 0;
          timer = setInterval(() => {
            current += (to - current) * 0.08; // Ease-out jackpot effect
            if (to - current < 1) { 
              setVal(to); 
              clearInterval(timer); 
            } else {
              setVal(Math.floor(current));
            }
          }, 20);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (timer) clearInterval(timer);
      observer.disconnect();
    }
  }, [to])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ─── FRESHNESS RINGS ─────────────────────────────────────────────────────────
export function FreshnessRing({ score }: { score: number }) {
  const color = score >= 80 ? C.success : score >= 60 ? C.warning : C.danger
  const r = 44, cx = 52, cy = 52, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={104} height={104} viewBox="0 0 104 104">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.beige} strokeWidth={8} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
        <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 22, fontWeight: 800, fill: color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{score}</text>
        <text x={cx} y={cy + 20} textAnchor="middle" style={{ fontSize: 10, fill: C.olive, fontFamily: "'Inter', sans-serif" }}>/100</text>
      </svg>
      <span style={{ fontSize: 13, fontWeight: 600, color }}>{score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair'} Freshness</span>
    </div>
  )
}

export function FreshnessSmall({ score }: { score: number }) {
  const color = score >= 80 ? C.success : score >= 60 ? C.warning : C.danger
  const r = 18, cx = 22, cy = 22, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.beige} strokeWidth={4} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fontWeight: 800, fill: color, fontFamily: 'sans-serif' }}>{score}</text>
    </svg>
  )
}

// ─── LIVE MAP ─────────────────────────────────────────────────────────────────
export function LiveMap() {
  const markers = [
    { x: 35, y: 38, type: 'restaurant', label: 'The Grand Spice', emoji: '🏛' },
    { x: 55, y: 52, type: 'ngo', label: 'Asha Foundation', emoji: '🤝' },
    { x: 62, y: 30, type: 'ngo', label: 'Green Hope', emoji: '🤝' },
    { x: 45, y: 60, type: 'volunteer', label: 'Rohan K.', emoji: '🚴' },
    { x: 28, y: 55, type: 'volunteer', label: 'Priya M.', emoji: '🚴' },
  ]
  const typeColor: Record<string, string> = { restaurant: C.forest, ngo: C.sage, volunteer: C.warning }
  return (
    <div className="map-bg" style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', width: '100%', height: '100%', minHeight: 260 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <line x1="0" y1="40%" x2="100%" y2="40%" stroke="white" strokeWidth="12" strokeOpacity="0.6" />
        <line x1="0" y1="65%" x2="100%" y2="65%" stroke="white" strokeWidth="8" strokeOpacity="0.5" />
        <line x1="35%" y1="0" x2="35%" y2="100%" stroke="white" strokeWidth="10" strokeOpacity="0.55" />
        <line x1="65%" y1="0" x2="65%" y2="100%" stroke="white" strokeWidth="8" strokeOpacity="0.45" />
      </svg>
      {markers.map((m, i) => (
        <div key={i} className="anim-scaleIn" style={{ position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%,-50%)', animationDelay: `${i * 0.1}s` }}>
          <div style={{ position: 'relative' }}>
            {m.type === 'volunteer' && <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: typeColor[m.type], opacity: 0.2, animation: 'ping 2.5s ease-in-out infinite' }} />}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: typeColor[m.type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: `0 4px 12px ${typeColor[m.type]}60`, border: '2.5px solid white', zIndex: 1, position: 'relative', cursor: 'pointer' }}>{m.emoji}</div>
            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: C.charcoal, color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' as const, marginBottom: 6, opacity: 0.9 }}>{m.label}</div>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: '8px 12px', display: 'flex', gap: 12, backdropFilter: 'blur(8px)' }}>
        {[{ label: 'Donor', color: C.forest }, { label: 'NGO', color: C.sage }, { label: 'Volunteer', color: C.warning }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 10, color: C.charcoal, fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── QR CODE ─────────────────────────────────────────────────────────────────
export function QRCode({ value }: { value: string }) {
  return (
    <div style={{ background: C.white, padding: 16, borderRadius: 16, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <rect width={120} height={120} fill="white" />
        {[...Array(7)].map((_, r) => [...Array(7)].map((_, c) => {
          const hash = (value.charCodeAt((r * 7 + c) % value.length) + r * c) % 3
          return hash === 0 ? <rect key={`${r}-${c}`} x={c * 14 + 6} y={r * 14 + 6} width={12} height={12} fill={C.charcoal} rx={2} /> : null
        }))}
        <rect x={6} y={6} width={28} height={28} fill="none" stroke={C.charcoal} strokeWidth={3} rx={4} />
        <rect x={86} y={6} width={28} height={28} fill="none" stroke={C.charcoal} strokeWidth={3} rx={4} />
        <rect x={6} y={86} width={28} height={28} fill="none" stroke={C.charcoal} strokeWidth={3} rx={4} />
        <rect x={16} y={16} width={8} height={8} fill={C.charcoal} rx={1} />
        <rect x={96} y={16} width={8} height={8} fill={C.charcoal} rx={1} />
        <rect x={16} y={96} width={8} height={8} fill={C.charcoal} rx={1} />
      </svg>
      <span style={{ fontSize: 10, color: C.olive, fontWeight: 600, letterSpacing: '0.06em' }}>{value}</span>
    </div>
  )
}
