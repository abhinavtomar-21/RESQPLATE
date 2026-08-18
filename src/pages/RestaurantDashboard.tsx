import React, { useState } from 'react';
import { C } from '../constants/theme';
import { SidebarItem, Bdg, Btn, Avatar } from '../components/shared/SharedComponents';
import { DashLayout, DashNav } from '../components/layout/LayoutComponents';
import { DonateFoodModal } from '../components/ui/DonateFoodModal';
import { DonationHistory, MapPage, SettingsPage, ProfilePage } from './SharedPages';
import { ResQApi } from '../services/api';
import { useDonations, weeklyData, monthlyData, pieData } from '../components/ui/UIComponents';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { LayoutDashboard, Plus, History, BarChart2, FileText, Globe, Bell, Settings, User, Utensils, Package, Leaf, Heart, ChevronRight, Download } from 'lucide-react';

export function RestaurantDashboard({ onBack, onNotif }: { onBack: () => void; onNotif: () => void }) {
  const [page, setPage] = useState('overview')
  const [donateOpen, setDonateOpen] = useState(false)
  
  // NOTE: NOTIFS is in LayoutComponents right now. For simplicity, we assume we can import it.
  // We actually need to move NOTIFS to a shared constant or just track the count here.
  const unread = 3; // Hardcoded for now until we centralize notifs

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.olive, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '12px 16px 4px' }}>Menu</div>
      {[
        { icon: <LayoutDashboard size={16} />, label: 'Overview', id: 'overview' },
        { icon: <Plus size={16} />, label: 'Donate Food', id: 'donate' },
        { icon: <History size={16} />, label: 'History', id: 'history' },
        { icon: <BarChart2 size={16} />, label: 'Analytics', id: 'analytics' },
        { icon: <FileText size={16} />, label: 'CSR Reports', id: 'reports' },
        { icon: <Globe size={16} />, label: 'Impact Map', id: 'map' },
      ].map(item => (
        <SidebarItem key={item.id} icon={item.icon} label={item.label} active={page === item.id}
          onClick={() => { setPage(item.id); if (item.id === 'donate') setDonateOpen(true) }} />
      ))}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.olive, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '14px 16px 4px' }}>Account</div>
      <SidebarItem icon={<Bell size={16} />} label="Notifications" badge={unread} onClick={onNotif} />
      <SidebarItem icon={<Settings size={16} />} label="Settings" onClick={() => setPage('settings')} active={page === 'settings'} />
      <SidebarItem icon={<User size={16} />} label="Profile" onClick={() => setPage('profile')} active={page === 'profile'} />
    </div>
  )

  return (
    <DashLayout sidebar={sidebar} onBack={onBack}>
      <DashNav title={page === 'overview' ? 'Restaurant Dashboard' : page === 'history' ? 'Donation History' : page === 'analytics' ? 'Analytics' : page === 'reports' ? 'CSR Reports' : page === 'map' ? 'Impact Map' : page === 'settings' ? 'Settings' : 'My Profile'}
        notifCount={unread} onNotif={onNotif} onProfile={() => setPage('profile')} name="The Grand Spice" />
      <div style={{ padding: 32 }}>
        {page === 'overview' && <RestOverview onDonate={() => setDonateOpen(true)} />}
        {page === 'history' && <DonationHistory />}
        {page === 'analytics' && <RestAnalytics />}
        {page === 'reports' && <CSRReports />}
        {page === 'map' && <MapPage />}
        {page === 'settings' && <SettingsPage />}
        {page === 'profile' && <ProfilePage name="The Grand Spice" role="restaurant" />}
      </div>
      <DonateFoodModal open={donateOpen} onClose={() => { setDonateOpen(false); setPage('overview') }} />
    </DashLayout>
  )
}

function RestOverview({ onDonate }: { onDonate: () => void }) {
  const recentDonations = useDonations();
  return (
    <div className="anim-fadeUp">
      <div style={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.charcoal} 100%)`, borderRadius: 24, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 16 }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(122,143,120,0.12)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(122,143,120,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 13, color: C.olive, marginBottom: 8, fontWeight: 500 }}>Good morning, The Grand Spice 🌿</p>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 10 }}>You have saved<br /><span style={{ color: C.olive }}>2,847 meals</span> this year</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 22 }}>Your generosity has kept 47 families fed this month.</p>
          <Btn variant="secondary" icon={<Plus size={16} />} size="lg" onClick={onDonate}>Donate Today's Surplus</Btn>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 52 }}>🏆</div>
          <Bdg label="Platinum Donor" color="warning" />
        </div>
      </div>
      {/* Rest of Overview omitted for brevity, you'd paste it from App.tsx */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 24, marginBottom: 24 }}>
        <div style={{ background: C.white, borderRadius: 24, padding: '24px 28px', boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal }}>Weekly Donations</h3>
              <p style={{ fontSize: 12, color: C.olive, marginTop: 2 }}>Meals donated per day</p>
            </div>
            <Bdg label="This week" color="sage" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.sage} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.sage} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.beige} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.beige}`, borderRadius: 12, fontSize: 13 }} />
              <Area type="monotone" dataKey="meals" stroke={C.forest} strokeWidth={2.5} fill="url(#grad1)" dot={{ fill: C.forest, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: C.white, borderRadius: 24, padding: '24px 28px', boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>By Food Type</h3>
          <p style={{ fontSize: 12, color: C.olive, marginBottom: 16 }}>This month</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: C.white, border: `1px solid ${C.beige}`, borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          {pieData.map(item => (
            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                <span style={{ fontSize: 12, color: C.charcoal }}>{item.name}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.charcoal }}>{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ background: C.white, borderRadius: 24, padding: '24px 28px', boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal }}>Recent Donations</h3>
          <Btn variant="ghost" size="sm" onClick={() => alert('Navigating to History...')}>View all <ChevronRight size={14} /></Btn>
        </div>
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.beige}` }}>
                {['ID', 'Food', 'Weight', 'Meals', 'Freshness', 'NGO', 'Status', 'Time'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: C.olive, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDonations.map((d, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.beige}`, transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.ivory}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 12px', fontSize: 13, fontWeight: 600, color: C.forest }}>{d.id}</td>
                  <td style={{ padding: '12px 12px', fontSize: 13, color: C.charcoal }}>{d.food}</td>
                  <td style={{ padding: '12px 12px', fontSize: 13, color: C.charcoal }}>{d.kg}</td>
                  <td style={{ padding: '12px 12px', fontSize: 13, color: C.charcoal }}>{d.meals}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 48, height: 5, borderRadius: 3, background: C.beige, overflow: 'hidden' }}>
                        <div style={{ width: `${d.score}%`, height: '100%', background: d.score >= 80 ? C.success : d.score >= 60 ? C.warning : C.danger, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.charcoal }}>{d.score}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: 13, color: C.charcoal }}>{d.ngo}</td>
                  <td style={{ padding: '12px 12px' }}><Bdg label={d.status} color={d.status === 'Delivered' ? 'success' : (d.status === 'In Transit') ? 'warning' : 'sage'} /></td>
                  <td style={{ padding: '12px 12px', fontSize: 12, color: C.olive }}>{d.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RestAnalytics() {
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: C.white, borderRadius: 24, padding: '24px 28px', boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>Monthly Meals Saved</h3>
          <p style={{ fontSize: 12, color: C.olive, marginBottom: 20 }}>Jan – Jul 2026</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.beige} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.beige}`, borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="meals" fill={C.sage} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: C.white, borderRadius: 24, padding: '24px 28px', boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>Impact Metrics</h3>
          <p style={{ fontSize: 12, color: C.olive, marginBottom: 20 }}>Cumulative 2026</p>
          {[{ label: 'Meals Saved', value: 2847, max: 4000, color: C.forest }, { label: 'CO₂ Avoided (kg)', value: 1240, max: 2000, color: C.sage }, { label: 'Water Saved (L)', value: 8400, max: 15000, color: '#4A90A4' }, { label: 'Families Supported', value: 312, max: 500, color: C.olive }].map(m => (
            <div key={m.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.charcoal, fontWeight: 500 }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.charcoal }}>{m.value.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: C.beige, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(m.value / m.max) * 100}%`, height: '100%', background: m.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CSRReports() {
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[{ title: 'July 2026 Impact', sub: 'Monthly CSR Report', icon: '📊', date: 'Jul 19, 2026' }, { title: 'Q2 2026 Summary', sub: 'Quarterly Report', icon: '📋', date: 'Jul 1, 2026' }, { title: '2025 Annual Impact', sub: 'Annual ESG Report', icon: '🏆', date: 'Jan 1, 2026' }].map((r, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(46,52,48,0.07)', transition: 'all 0.3s' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>{r.icon}</div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>{r.title}</h4>
            <p style={{ fontSize: 12, color: C.olive, marginBottom: 16 }}>{r.sub} · {r.date}</p>
            <Btn variant="secondary" size="sm" icon={<Download size={13} />} onClick={() => alert(`Downloading ${r.title} PDF...`)}>Download PDF</Btn>
          </div>
        ))}
      </div>
      <div style={{ background: C.white, borderRadius: 24, padding: '24px 28px', boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>ESG Scorecard</h3>
        {[{ category: 'Environmental', score: 88, items: ['1.2T CO₂ avoided', '8,400L water saved', '847kg food diverted'] }, { category: 'Social', score: 92, items: ['2,847 meals provided', '312 families supported', '47 NGOs partnered'] }, { category: 'Governance', score: 95, items: ['100% verified donations', 'FSSAI compliant', 'Immutable audit trail'] }].map(g => (
          <div key={g.category} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.beige}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.charcoal }}>{g.category}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: C.forest }}>{g.score}<span style={{ fontSize: 14, color: C.olive }}>/100</span></span>
            </div>
            <div style={{ height: 6, background: C.beige, borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ width: `${g.score}%`, height: '100%', background: C.sage, borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {g.items.map(item => <Bdg key={item} label={item} color="sage" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
