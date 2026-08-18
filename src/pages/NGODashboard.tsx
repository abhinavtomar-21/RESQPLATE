import React, { useState } from 'react';
import { C } from '../constants/theme';
import { SidebarItem, Bdg, Btn, Avatar } from '../components/shared/SharedComponents';
import { DashLayout, DashNav, NOTIFS } from '../components/layout/LayoutComponents';
import { FreshnessSmall, LiveMap, useDonations, monthlyData } from '../components/ui/UIComponents';
import { DonationHistory, MapPage } from './SharedPages';
import { ResQApi } from '../services/api';
import { MapPin, CheckCircle2, Map, Package, History, BarChart2, Users, Bell, Settings, Filter, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export function NGODashboard({ onBack, onNotif }: { onBack: () => void; onNotif: () => void }) {
  const [page, setPage] = useState('nearby')
  const unread = NOTIFS.filter(n => !n.read).length
  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[{ icon: <MapPin size={16} />, label: 'Nearby Donations', id: 'nearby' }, { icon: <CheckCircle2 size={16} />, label: 'Accepted', id: 'accepted' }, { icon: <Map size={16} />, label: 'Live Map', id: 'map' }, { icon: <Package size={16} />, label: 'Inventory', id: 'inventory' }, { icon: <History size={16} />, label: 'History', id: 'history' }, { icon: <BarChart2 size={16} />, label: 'Analytics', id: 'analytics' }, { icon: <Users size={16} />, label: 'Volunteers', id: 'volunteers' }].map(item => (
        <SidebarItem key={item.id} icon={item.icon} label={item.label} active={page === item.id} onClick={() => setPage(item.id)} />
      ))}
      <div style={{ borderTop: `1px solid ${C.beige}`, marginTop: 8, paddingTop: 8 }}>
        <SidebarItem icon={<Bell size={16} />} label="Notifications" badge={unread} onClick={onNotif} />
        <SidebarItem icon={<Settings size={16} />} label="Settings" />
      </div>
    </div>
  )
  const titles: Record<string, string> = { nearby: 'Nearby Donations', accepted: 'Accepted', map: 'Live Map', inventory: 'Inventory', history: 'History', analytics: 'Analytics', volunteers: 'Volunteers' }
  return (
    <DashLayout sidebar={sidebar} onBack={onBack}>
      <DashNav title={titles[page] || page} notifCount={unread} onNotif={onNotif} onProfile={() => {}} name="Asha Foundation" />
      <div style={{ padding: 32 }}>
        {page === 'nearby' && <NGONearby />}
        {page === 'map' && <MapPage />}
        {page === 'analytics' && <NGOAnalytics />}
        {page === 'inventory' && <NGOInventory />}
        {page === 'volunteers' && <NGOVolunteers />}
        {page === 'history' && <DonationHistory />}
        {page === 'accepted' && <NGOAccepted />}
      </div>
    </DashLayout>
  )
}

function NGONearby() {
  const recentDonations = useDonations('Pending');
  const [accepted, setAccepted] = useState<number[]>([])
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal }}>Available Donations Nearby</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: C.beige, border: 'none', cursor: 'pointer', borderRadius: 10, padding: 8, display: 'flex' }}><Filter size={16} color={C.charcoal} /></button>
              <button style={{ background: C.beige, border: 'none', cursor: 'pointer', borderRadius: 10, padding: 8, display: 'flex' }}><RefreshCw size={16} color={C.charcoal} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {recentDonations.map((d, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 20, padding: '20px 24px', boxShadow: '0 2px 12px rgba(46,52,48,0.07)', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: C.sageLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🍛</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>{d.food}</h4>
                        <p style={{ fontSize: 12, color: C.olive, marginTop: 3 }}>The Grand Spice · 0.8 km</p>
                      </div>
                      <FreshnessSmall score={d.score} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' as const }}>
                      <Bdg label={d.kg} color="sage" />
                      <Bdg label={`${d.meals} meals`} color="forest" />
                      <Bdg label="2h 15m left" color="warning" />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      {accepted.includes(i) || d.status === 'In Transit' ? <Bdg label="Accepted ✓" color="success" /> : (
                        <>
                          <Btn variant="primary" size="sm" onClick={async () => {
                            setAccepted(a => [...a, i]);
                            await ResQApi.acceptDonation(d.id);
                          }}>Accept</Btn>
                          <Btn variant="secondary" size="sm" onClick={() => alert(`Details for ${d.food}: ${d.kg} (${d.meals} meals). Temperature: ${d.temperature || 'Safe'}. Prepared: ${d.prepTime || 'Recently'}.`)}>Details</Btn>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.white, borderRadius: 24, padding: 20, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, marginBottom: 12 }}>Nearby Map</h4>
            <div style={{ height: 260 }}><LiveMap /></div>
          </div>
          <div style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(46,52,48,0.07)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: C.charcoal, marginBottom: 12 }}>AI Match Rankings</h4>
            {[{ name: 'Asha Foundation', dist: '0.8 km', match: 98 }, { name: 'Green Hope NGO', dist: '1.4 km', match: 94 }, { name: 'CityFeed Trust', dist: '2.1 km', match: 88 }].map((n, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${C.beige}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal }}>{n.name}</div>
                  <div style={{ fontSize: 11, color: C.olive }}>{n.dist}</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.forest }}>{n.match}%</div>
                  <div style={{ fontSize: 10, color: C.olive }}>AI match</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NGOAnalytics() {
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <h3 style={{ fontSize: 14, color: C.olive, marginBottom: 8, fontWeight: 600 }}>Total Received</h3>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.charcoal }}>8,420 <span style={{ fontSize: 14, color: C.success }}>+18%</span></div>
        </div>
        <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <h3 style={{ fontSize: 14, color: C.olive, marginBottom: 8, fontWeight: 600 }}>Families Served</h3>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.charcoal }}>1,240 <span style={{ fontSize: 14, color: C.success }}>+25%</span></div>
        </div>
        <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
          <h3 style={{ fontSize: 14, color: C.olive, marginBottom: 8, fontWeight: 600 }}>Active Volunteers</h3>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.charcoal }}>34 <span style={{ fontSize: 14, color: C.success }}>+6</span></div>
        </div>
      </div>
      <div style={{ background: C.white, borderRadius: 24, padding: '24px 28px', boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>Monthly Intake Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="ngoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.olive} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.olive} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.beige} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: C.olive }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.beige}`, borderRadius: 12, fontSize: 13 }} />
            <Area type="monotone" dataKey="meals" stroke={C.olive} strokeWidth={2.5} fill="url(#ngoGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function NGOInventory() {
  return (
    <div className="anim-fadeUp">
      <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>Current Inventory</h3>
        {[{ name: 'Mixed Veg Biryani', kg: 18, expires: '3h', temp: '65°C', status: 'Fresh' }, { name: 'Dal & Roti', kg: 12, expires: '5h', temp: '60°C', status: 'Fresh' }, { name: 'Paneer Curry', kg: 8, expires: '1.5h', temp: '58°C', status: 'Urgent' }, { name: 'Assorted Breads', kg: 22, expires: '8h', temp: 'Room', status: 'Good' }].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? `1px solid ${C.beige}` : 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.sageLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🍽</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{item.name}</div>
              <div style={{ fontSize: 12, color: C.olive, marginTop: 3 }}>{item.kg} kg · {item.temp} · Expires in {item.expires}</div>
            </div>
            <Bdg label={item.status} color={item.status === 'Fresh' ? 'success' : item.status === 'Urgent' ? 'danger' : 'warning'} />
          </div>
        ))}
      </div>
    </div>
  )
}

function NGOVolunteers() {
  return (
    <div className="anim-fadeUp">
      <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>Assigned Volunteers</h3>
        {[{ name: 'Rohan Kumar', trips: 47, rating: 4.9, status: 'Active', vehicle: 'Bike' }, { name: 'Priya Mehta', trips: 32, rating: 4.8, status: 'On Trip', vehicle: 'Scooter' }, { name: 'Amit Shah', trips: 28, rating: 4.7, status: 'Available', vehicle: 'Car' }].map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: i < 2 ? `1px solid ${C.beige}` : 'none' }}>
            <Avatar name={v.name} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{v.name}</div>
              <div style={{ fontSize: 12, color: C.olive, marginTop: 3 }}>{v.trips} trips · ⭐ {v.rating} · {v.vehicle}</div>
            </div>
            <Bdg label={v.status} color={v.status === 'Active' || v.status === 'Available' ? 'success' : 'warning'} />
          </div>
        ))}
      </div>
    </div>
  )
}

function NGOAccepted() {
  const recentDonations = useDonations('In Transit');
  return (
    <div className="anim-fadeUp">
      <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>Accepted Donations</h3>
        {recentDonations.slice(0, 2).map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: i === 0 ? `1px solid ${C.beige}` : 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.sageLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍛</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{d.food}</div>
              <div style={{ fontSize: 12, color: C.olive, marginTop: 3 }}>{d.kg} · {d.meals} meals · Volunteer assigned</div>
            </div>
            <Bdg label="In Transit" color="warning" />
          </div>
        ))}
      </div>
    </div>
  )
}
