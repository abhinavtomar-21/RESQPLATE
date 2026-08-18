import React, { useState } from 'react';
import { C } from '../constants/theme';
import { SidebarItem, Bdg, Btn, Avatar, StatCard } from '../components/shared/SharedComponents';
import { DashLayout, DashNav, NOTIFS } from '../components/layout/LayoutComponents';
import { useRequests, QRCode } from '../components/ui/UIComponents';
import { DonationHistory, MapPage, VolNav } from './SharedPages';
import { ResQApi } from '../services/api';
import { Map, History, Bell, Navigation, Trophy, Award, Star, Package, Truck, Clock, Zap, CheckCircle2, Download } from 'lucide-react';

// ─── VOLUNTEER DASHBOARD ──────────────────────────────────────────────────────
export function VolunteerDashboard({ onBack, onNotif }: { onBack: () => void; onNotif: () => void }) {
  const [page, setPage] = useState('requests')
  const unread = NOTIFS.filter(n => !n.read).length
  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[{ icon: <Bell size={16} />, label: 'Pickup Requests', id: 'requests', badge: 3 }, { icon: <Map size={16} />, label: 'Live Map', id: 'map' }, { icon: <Navigation size={16} />, label: 'Navigation', id: 'nav' }, { icon: <Trophy size={16} />, label: 'Achievements', id: 'achievements' }, { icon: <Award size={16} />, label: 'Certificates', id: 'certs' }, { icon: <Star size={16} />, label: 'Leaderboard', id: 'leaderboard' }, { icon: <History size={16} />, label: 'History', id: 'history' }].map(item => (
        <SidebarItem key={item.id} icon={item.icon} label={item.label} active={page === item.id} onClick={() => setPage(item.id)} badge={item.badge} />
      ))}
    </div>
  )
  const titles: Record<string, string> = { requests: 'Pickup Requests', map: 'Live Map', nav: 'Navigation', achievements: 'Achievements', certs: 'Certificates', leaderboard: 'Leaderboard', history: 'History' }
  return (
    <DashLayout sidebar={sidebar} onBack={onBack}>
      <DashNav title={titles[page]} notifCount={unread} onNotif={onNotif} onProfile={() => {}} name="Rohan Kumar" />
      <div style={{ padding: 32 }}>
        {page === 'requests' && <VolReqs />}
        {page === 'map' && <MapPage />}
        {page === 'nav' && <VolNav />}
        {page === 'achievements' && <VolAchievements />}
        {page === 'certs' && <VolCerts />}
        {page === 'leaderboard' && <VolLeaderboard />}
        {page === 'history' && <DonationHistory />}
      </div>
    </DashLayout>
  )
}

function VolReqs() {
  const volunteerRequests = useRequests();
  const [accepted, setAccepted] = useState<number[]>([])
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Trips Today" value="3" icon={<Truck size={20} />} />
        <StatCard label="Meals Carried" value="142" icon={<Package size={20} />} change="+42" />
        <StatCard label="Volunteer Score" value="4.9 ⭐" icon={<Star size={20} />} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {volunteerRequests.map((req, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 22, padding: '20px 24px', boxShadow: '0 2px 12px rgba(46,52,48,0.07)', borderLeft: `4px solid ${req.priority === 'Urgent' ? C.danger : req.priority === 'High' ? C.warning : C.sage}` }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>{req.food}</h4>
                  <Bdg label={req.priority} color={req.priority === 'Urgent' ? 'danger' : req.priority === 'High' ? 'warning' : 'sage'} />
                </div>
                <p style={{ fontSize: 13, color: C.olive }}>from <strong style={{ color: C.charcoal }}>{req.donor}</strong> · {req.pickup} from you</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: C.olive, display: 'flex', gap: 5, alignItems: 'center' }}><Clock size={13} /> Deadline in {req.deadline}</span>
                  <span style={{ fontSize: 12, color: C.forest, fontWeight: 600, display: 'flex', gap: 5, alignItems: 'center' }}><Zap size={13} /> Freshness: {req.score}/100</span>
                </div>
              </div>
              <div>
                {accepted.includes(i) ? (
                  <div style={{ textAlign: 'center' as const }}>
                    <CheckCircle2 size={28} color={C.success} />
                    <p style={{ fontSize: 11, color: C.success, marginTop: 4, fontWeight: 600 }}>Accepted</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Btn variant="primary" size="sm" onClick={async () => {
                      setAccepted(a => [...a, i]);
                      await ResQApi.acceptPickupRequest(req.id);
                    }}>Accept</Btn>
                    <Btn variant="secondary" size="sm" onClick={() => alert('Request declined and passed to next volunteer.')}>Decline</Btn>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VolAchievements() {
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[{ name: 'First Rescue', icon: '🌱', earned: true }, { name: 'Eco Warrior', icon: '🌍', earned: true }, { name: 'Speed Hero', icon: '⚡', earned: true }, { name: 'Night Owl', icon: '🦉', earned: true }, { name: 'Century Club', icon: '💯', earned: false }, { name: 'Legend', icon: '👑', earned: false }].map((b, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 20, padding: 24, textAlign: 'center' as const, boxShadow: '0 2px 12px rgba(46,52,48,0.07)', opacity: b.earned ? 1 : 0.4 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{b.icon}</div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: C.charcoal }}>{b.name}</h4>
            {b.earned && <div style={{ marginTop: 12 }}><Bdg label="Earned" color="success" /></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function VolLeaderboard() {
  return (
    <div className="anim-fadeUp">
      <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>City Leaderboard — Mumbai</h3>
        {[{ rank: '🥇', name: 'Priya Mehta', trips: 234, meals: 8420 }, { rank: '🥈', name: 'Rohan Kumar', trips: 189, meals: 6840, you: true }, { rank: '🥉', name: 'Amit Shah', trips: 156, meals: 5620 }, { rank: '4️⃣', name: 'Sneha Joshi', trips: 134, meals: 4800 }].map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? `1px solid ${C.beige}` : 'none', background: l.you ? C.sageLight : 'transparent', borderRadius: l.you ? 12 : 0, paddingLeft: l.you ? 12 : 0, paddingRight: l.you ? 12 : 0 }}>
            <span style={{ fontSize: 20, width: 32, textAlign: 'center' as const }}>{l.rank}</span>
            <Avatar name={l.name} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{l.name} {l.you && <Bdg label="You" color="forest" />}</div>
              <div style={{ fontSize: 12, color: C.olive, marginTop: 2 }}>{l.trips} trips</div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.forest }}>{l.meals.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: C.olive }}>meals</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VolCerts() {
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[{ title: 'Impact Certificate', sub: '47 pickup trips · 1,680 meals', date: 'July 2026', bg: C.forest }, { title: 'Volunteer of the Month', sub: 'Top performer — June 2026', date: 'June 2026', bg: '#B7870A' }].map((cert, i) => (
          <div key={i} style={{ background: cert.bg, borderRadius: 24, padding: 28, color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ fontSize: 36, marginBottom: 16 }}>🏅</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: 'white' }}>{cert.title}</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Rohan Kumar</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>{cert.sub}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{cert.date}</span>
              <Btn variant="secondary" size="sm" icon={<Download size={13} />}>Download</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
