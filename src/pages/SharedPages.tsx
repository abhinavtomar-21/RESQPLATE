import React, { useState } from 'react';
import { C } from "../constants/theme";
import { Bdg, Toggle, Avatar, Btn } from "../components/shared/SharedComponents";
import { useDonations } from "../components/ui/UIComponents";
import { LiveDonationMap } from "../components/logistics/LiveDonationMap";
import { VolunteerNavigation } from "../components/logistics/VolunteerNavigation";

// ─── SHARED PAGES ─────────────────────────────────────────────────────────────

export function DonationHistory() {
  const recentDonations = useDonations();
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Delivered', 'In Transit', 'Pending']
  const filtered = filter === 'All' ? recentDonations : recentDonations.filter(d => d.status === filter)
  
  return (
    <div className="anim-fadeUp">
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 18px', borderRadius: 14, border: 'none', cursor: 'pointer', background: filter === f ? C.forest : C.beige, color: filter === f ? 'white' : C.charcoal, fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>{f}</button>
        ))}
      </div>
      <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)' }}>
        {filtered.map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: i < filtered.length - 1 ? `1px solid ${C.beige}` : 'none' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sageLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🍛</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{d.food}</div>
              <div style={{ fontSize: 12, color: C.olive, marginTop: 3 }}>{d.id} · {d.kg} · {d.meals} meals · {d.ngo}</div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <Bdg label={d.status} color={d.status === 'Delivered' ? 'success' : d.status === 'In Transit' ? 'warning' : 'sage'} />
              <div style={{ fontSize: 11, color: C.olive, marginTop: 4 }}>{d.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MapPage() {
  return (
    <div className="anim-fadeUp" style={{ height: '100%' }}>
      <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: '0 2px 16px rgba(46,52,48,0.07)', height: '100%' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>Live Donation Map</h3>
        <p style={{ fontSize: 12, color: C.olive, marginBottom: 16 }}>Real-time tracking of donations and nearby NGOs</p>
        <div style={{ height: '600px', width: '100%' }}>
           <LiveDonationMap />
        </div>
      </div>
    </div>
  )
}

export function VolNav() {
  return (
    <div className="anim-fadeUp" style={{ height: '600px' }}>
      <VolunteerNavigation />
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="anim-fadeUp">
      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[{ title: 'Notification Preferences', fields: ['Email notifications', 'Push notifications', 'SMS alerts', 'Weekly digest'] }, { title: 'Donation Preferences', fields: ['Auto-match NGO', 'Preferred pickup window', 'Default food categories'] }, { title: 'Privacy & Security', fields: ['Two-factor authentication', 'Public profile visible', 'Data export enabled'] }].map(section => (
          <div key={section.title} style={{ background: C.white, borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(46,52,48,0.07)' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 16 }}>{section.title}</h4>
            {section.fields.map(field => (
              <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.beige}` }}>
                <span style={{ fontSize: 14, color: C.charcoal }}>{field}</span>
                <Toggle />
              </div>
            ))}
          </div>
        ))}
        <Btn variant="primary" onClick={() => alert('Settings saved successfully!')}>Save Settings</Btn>
      </div>
    </div>
  )
}

export function ProfilePage({ name, role }: { name: string; role: string }) {
  return (
    <div className="anim-fadeUp">
      <div style={{ maxWidth: 560 }}>
        <div style={{ background: C.white, borderRadius: 24, padding: 28, boxShadow: '0 2px 16px rgba(46,52,48,0.07)', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
            <Avatar name={name} size={72} />
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: C.charcoal }}>{name}</h3>
              <p style={{ fontSize: 13, color: C.olive, marginTop: 4 }}>{role.charAt(0).toUpperCase() + role.slice(1)} · Verified Member</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Bdg label="FSSAI Certified" color="success" />
                <Bdg label="Platinum Donor" color="warning" />
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Restaurant Name', name], ['FSSAI License', 'FSSAI-MH-2024-1847'], ['City', 'Mumbai, Maharashtra'], ['Contact', '+91 98765 43210'], ['Email', 'manager@grandspice.in'], ['Member Since', 'March 2024']].map(([l, v]) => (
              <div key={l}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.olive, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{l}</label>
                <p style={{ fontSize: 14, color: C.charcoal, fontWeight: 500, marginTop: 4 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
        <Btn variant="primary" onClick={() => alert('Edit Profile modal would open here.')}>Edit Profile</Btn>
      </div>
    </div>
  )
}
