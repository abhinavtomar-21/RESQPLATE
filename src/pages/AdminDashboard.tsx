import React, { useState } from 'react';
import { C } from '../constants/theme';
import { SidebarItem, Bdg, Btn, Avatar, StatCard } from '../components/shared/SharedComponents';
import { DashLayout, DashNav, NOTIFS } from '../components/layout/LayoutComponents';
import { weeklyData, adminGrowth, useDonations } from '../components/ui/UIComponents';
import { MapPage } from './SharedPages';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Legend, Line } from 'recharts';
import { LayoutDashboard, Building2, HandHeart, Users, Map, BarChart2, Shield, AlertCircle, FileText, Bell, Settings, Activity, Utensils, Package, Leaf, Globe } from 'lucide-react';
import { VerificationManager } from '../components/admin/VerificationManager';
import { ResQApi } from '../services/api';

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
export function AdminDashboard({ onBack, onNotif }: { onBack: () => void; onNotif: () => void }) {
  const [page, setPage] = useState('overview')
  const unread = NOTIFS.filter(n => !n.read).length
  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[{ icon: <LayoutDashboard size={16} />, label: 'Platform Overview', id: 'overview' }, { icon: <Building2 size={16} />, label: 'Restaurants', id: 'restaurants' }, { icon: <HandHeart size={16} />, label: 'NGOs', id: 'ngos' }, { icon: <Users size={16} />, label: 'Volunteers', id: 'volunteers' }, { icon: <Map size={16} />, label: 'Live Heatmap', id: 'heatmap' }, { icon: <BarChart2 size={16} />, label: 'AI Analytics', id: 'analytics' }, { icon: <Shield size={16} />, label: 'Verification Queue', id: 'verification' }, { icon: <AlertCircle size={16} />, label: 'Fraud Detection', id: 'fraud' }, { icon: <FileText size={16} />, label: 'Reports', id: 'reports' }].map(item => (
        <SidebarItem key={item.id} icon={item.icon} label={item.label} active={page === item.id} onClick={() => setPage(item.id)} />
      ))}
      <div style={{ borderTop: `1px solid ${C.beige}`, marginTop: 8, paddingTop: 8 }}>
        <SidebarItem icon={<Bell size={16} />} label="Notifications" badge={unread} onClick={onNotif} />
        <SidebarItem icon={<Settings size={16} />} label="System Settings" />
      </div>
    </div>
  )
  const titles: Record<string, string> = { overview: 'Platform Overview', restaurants: 'Restaurants', ngos: 'NGOs', volunteers: 'Volunteers', heatmap: 'Live Heatmap', analytics: 'AI Analytics', verification: 'Verification Queue', fraud: 'Fraud Detection', reports: 'Reports' }
  return (
    <DashLayout sidebar={sidebar} onBack={onBack}>
      <DashNav title={titles[page]} notifCount={unread} onNotif={onNotif} onProfile={() => {}} name="Admin User" />
      <div style={{ padding: 32 }}>
        {page === 'overview' && <AdminOverview />}
        {page === 'heatmap' && <MapPage />}
        {page === 'analytics' && <AdminAnalytics />}
        {page === 'verification' && <VerificationQueue />}
        {page === 'restaurants' && <AdminEntities type="Restaurants" />}
        {page === 'ngos' && <AdminEntities type="NGOs" />}
        {page === 'volunteers' && <AdminEntities type="Volunteers" />}
        {page === 'fraud' && <FraudDetection />}
        {page === 'reports' && <div />} {/* CSRReports is imported in RestaurantDashboard, typically we'd extract it to SharedPages if used here, but let's just use a placeholder or extract it */}
      </div>
    </DashLayout>
  )
}

function AdminOverview() {
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Restaurants" value="67" change="+5 this week" icon={<Building2 size={20} />} />
        <StatCard label="Active NGOs" value="41" change="+3 this week" icon={<HandHeart size={20} />} />
        <StatCard label="Volunteers" value="178" change="+12 this week" icon={<Users size={20} />} />
        <StatCard label="Live Donations" value="14" icon={<Activity size={20} />} accent="#FEF0F0" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Meals Saved" value="184,720" change="+2,847 today" icon={<Utensils size={20} />} />
        <StatCard label="Food Rescued" value="62.4 T" change="+847 kg" icon={<Package size={20} />} />
        <StatCard label="CO₂ Avoided" value="18.7 T" icon={<Leaf size={20} />} />
        <StatCard label="Cities Active" value="12" icon={<Globe size={20} />} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 24 }}>
        <div style={{ background: C.white, borderRadius: 24, padding: '24px 28px', boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>Platform Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={adminGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.beige} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.beige}`, borderRadius: 12, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="restaurants" stroke={C.forest} strokeWidth={2.5} dot={false} name="Restaurants" />
              <Line type="monotone" dataKey="ngos" stroke={C.sage} strokeWidth={2.5} dot={false} name="NGOs" />
              <Line type="monotone" dataKey="volunteers" stroke={C.olive} strokeWidth={2.5} dot={false} name="Volunteers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(46,52,48,0.07)', flex: 1 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, marginBottom: 12 }}>Live Activity</h4>
            {[{ msg: 'New donation: The Grand Spice (18 kg)', time: '2m ago', dot: C.sage }, { msg: 'NGO verified: Green Hope, Pune', time: '8m ago', dot: C.forest }, { msg: 'Rohan K. completed trip #47', time: '15m ago', dot: C.olive }, { msg: 'Freshness alert: D-4819 (62/100)', time: '22m ago', dot: C.warning }].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < 3 ? `1px solid ${C.beige}` : 'none', alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.dot, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: C.charcoal, lineHeight: 1.4 }}>{a.msg}</p>
                  <span style={{ fontSize: 11, color: C.olive }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(46,52,48,0.07)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, marginBottom: 12 }}>System Health</h4>
            {[{ label: 'AI Engine', val: 99.9, color: C.success }, { label: 'API', val: 99.7, color: C.success }, { label: 'Database', val: 98.2, color: C.success }].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.charcoal }}>{s.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.val}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminAnalytics() {
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>AI Engine Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B48C8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6B48C8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.beige} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.beige}`, borderRadius: 12, fontSize: 13 }} />
              <Area type="monotone" dataKey="meals" stroke="#6B48C8" strokeWidth={2.5} fill="url(#aiGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>AI Engine Stats</h3>
          {[['Donations Analyzed', '14,820'], ['Avg Freshness Score', '81.4/100'], ['Spoilage Prevented', '94.2%'], ['Avg Match Time', '2.3 sec'], ['Model Accuracy', '96.8%']].map(([l, v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? `1px solid ${C.beige}` : 'none' }}>
              <span style={{ fontSize: 13, color: C.charcoal }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.forest }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VerificationQueue() {
  const donations = useDonations('All');
  const pendingDonations = donations.filter(d => (d.status || '').toLowerCase() === 'pending' || (d.status || '').toLowerCase() === 'pending_admin_approval');

  const handleApproveDonation = async (id: string) => {
    await ResQApi.acceptDonation(id);
    alert(`Donation '${id}' has been approved by Admin and is now AVAILABLE for NGO matching! Notification sent via Resend.`);
  };

  return (
    <div className="anim-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Account Verification Section */}
      <VerificationManager />

      {/* Donation Verification & Oversight Section */}
      <div style={{ background: C.white, borderRadius: 28, padding: '32px 28px', boxShadow: '0 8px 40px rgba(46,52,48,0.08)', border: '1px solid rgba(122,143,120,0.15)' }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.charcoal, marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Food Donations Awaiting Admin Approval
        </h3>
        {pendingDonations.length === 0 ? (
          <p style={{ fontSize: 13, color: C.olive, background: C.sageLight, padding: 16, borderRadius: 16 }}>
            No pending food donations requiring admin review at this time.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingDonations.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.ivory, padding: 16, borderRadius: 16, border: `1px solid ${C.beige}` }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>{d.food} ({d.kg})</div>
                  <div style={{ fontSize: 12, color: C.olive, marginTop: 2 }}>{d.meals} meals · Temp: {d.temperature || '4°C'} · AI Freshness Score: {d.score}/100</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Bdg label="Pending Admin Approval" color="warning" />
                  <Btn variant="primary" size="sm" onClick={() => handleApproveDonation(d.id)}>Approve Donation</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminEntities({ type }: { type: string }) {
  const data = type === 'Restaurants'
    ? [{ name: 'The Grand Spice', city: 'Mumbai', score: 98, count: 142 }, { name: 'Baker Street Co.', city: 'Mumbai', score: 94, count: 87 }, { name: 'Metro Hotel', city: 'Delhi', score: 89, count: 64 }]
    : type === 'NGOs'
    ? [{ name: 'Asha Foundation', city: 'Mumbai', score: 99, count: 312 }, { name: 'Green Hope NGO', city: 'Pune', score: 96, count: 224 }]
    : [{ name: 'Rohan Kumar', city: 'Mumbai', score: 98, count: 47 }, { name: 'Priya Mehta', city: 'Mumbai', score: 97, count: 62 }]
  const countLabel = type === 'Volunteers' ? 'trips' : 'donations'
  return (
    <div className="anim-fadeUp">
      <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>{type}</h3>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: i < data.length - 1 ? `1px solid ${C.beige}` : 'none' }}>
            <Avatar name={item.name} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{item.name}</div>
              <div style={{ fontSize: 12, color: C.olive, marginTop: 3 }}>{item.city} · Trust Score: {item.score}/100 · {item.count} {countLabel}</div>
            </div>
            <Bdg label="Active" color="success" />
            <Btn variant="secondary" size="sm">View</Btn>
          </div>
        ))}
      </div>
    </div>
  )
}

function FraudDetection() {
  return (
    <div className="anim-fadeUp">
      <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
          <Shield size={18} color={C.danger} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal }}>Fraud & Anomaly Alerts</h3>
        </div>
        {[{ id: 'F-001', entity: 'Quick Bites Restaurant', reason: 'Duplicate donation detected within 10 minutes', risk: 'High' }, { id: 'F-002', entity: 'Volunteer #V-492', reason: 'GPS location mismatch during delivery', risk: 'Medium' }, { id: 'F-003', entity: 'Sunrise Bakery', reason: 'Freshness score significantly lower than reported', risk: 'Low' }].map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0', borderBottom: i < 2 ? `1px solid ${C.beige}` : 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={18} color={C.danger} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{a.entity}</div>
              <p style={{ fontSize: 12, color: '#6B7C6E', marginTop: 3 }}>{a.reason}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <Bdg label={`${a.risk} Risk`} color={a.risk === 'High' ? 'danger' : a.risk === 'Medium' ? 'warning' : 'sage'} />
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant="danger" size="sm">Flag</Btn>
                <Btn variant="secondary" size="sm">Dismiss</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
