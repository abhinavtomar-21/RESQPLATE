import React, { useRef, useEffect } from 'react';
import { C } from '../constants/theme';
import { AnimCounter } from '../components/ui/UIComponents';
import { Btn, Avatar, ResQPlateLogo } from '../components/shared/SharedComponents';
import { ArrowRight, Star, Leaf, Heart, CheckCircle2, Truck, Cpu, Zap, Navigation, QrCode, BarChart2, Shield, ExternalLink, Share2, Link2 } from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate: (v: string) => void }) {
  return (
    <div style={{ background: C.ivory, minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Nav */}
      <nav className="glass" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '0 32px', borderBottom: '1px solid rgba(122,143,120,0.12)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ResQPlateLogo size={30} />
            <span style={{ fontSize: 17, fontWeight: 800, color: C.charcoal, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>ResQPlate</span>
          </div>
          <div style={{ display: 'flex', gap: 36 }}>
            {['About', 'Impact', 'Features', 'Contact'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} style={{ fontSize: 14, color: '#5A6B5C', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.forest)}
                onMouseLeave={e => (e.currentTarget.style.color = '#5A6B5C')}>{link}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => onNavigate('demo')} style={{ background: '#7EC8A0', color: '#1E2420', border: 'none', padding: '9px 18px', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 10px rgba(126,200,160,0.4)', transition: 'transform 0.15s' }}>
              ✨ Explore Demo
            </button>
            <button onClick={() => onNavigate('signin')} style={{ background: 'transparent', border: 'none', color: '#5A6B5C', padding: '9px 14px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Sign In</button>
            <button onClick={() => onNavigate('choose')} style={{ background: C.forest, color: 'white', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = C.charcoal)}
              onMouseLeave={e => (e.currentTarget.style.background = C.forest)}>
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 100, paddingBottom: 64, paddingLeft: 48, paddingRight: 48, maxWidth: 1200, margin: '0 auto' }}>
        {/* Trust badge */}
        <div className="anim-fadeUp" style={{ marginBottom: 40, marginTop: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EDF2EC', borderRadius: 999, padding: '5px 14px 5px 5px' }}>
            <div style={{ display: 'flex' }}>
              {['A', 'R', 'S', 'M'].map((n, i) => (
                <div key={i} style={{ marginLeft: i > 0 ? -6 : 0, width: 22, height: 22, borderRadius: '50%', background: [C.forest, C.sage, C.olive, '#7EC8A0'][i], border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>{n}</div>
              ))}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.forest }}>Trusted by 1,280+ NGOs across India</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left: Text */}
          <div className="anim-fadeUp" style={{ animationDelay: '0.05s' }}>
            <h1 style={{ fontSize: 76, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span style={{ color: C.charcoal }}>Saving Food.</span><br />
              <span style={{ color: C.forest }}>Feeding Hope.</span>
            </h1>
            <p style={{ fontSize: 17, color: '#6B7C6E', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              An AI-powered ecosystem connecting restaurants, NGOs, and volunteers to eliminate food waste — one plate at a time. Every surplus meal becomes an act of dignity.
            </p>
            <div style={{ display: 'flex', gap: 14, marginBottom: 48, alignItems: 'center', flexWrap: 'wrap' as const }}>
              <button onClick={() => onNavigate('demo')} style={{ background: C.forest, color: 'white', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(70,91,74,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.charcoal; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = C.forest; e.currentTarget.style.transform = 'none' }}>
                ✨ Explore Demo Mode <ArrowRight size={16} />
              </button>
              <button onClick={() => onNavigate('choose')} style={{ background: 'transparent', border: `1.5px solid ${C.forest}`, color: C.forest, padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                Get Started
              </button>
            </div>
            {/* Bottom stats row */}
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} fill={C.warning} color={C.warning} />)}
                </div>
                <span style={{ fontSize: 13, color: '#6B7C6E', fontWeight: 500 }}>4.9 / 5.0</span>
              </div>
              <div style={{ width: 1, height: 20, background: '#DDD' }} />
              <div>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.charcoal, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>8,340+</span>
                <span style={{ fontSize: 13, color: '#6B7C6E', marginLeft: 6, fontWeight: 500 }}>volunteers</span>
              </div>
              <div style={{ width: 1, height: 20, background: '#DDD' }} />
              <div>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.charcoal, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$20M+</span>
                <span style={{ fontSize: 13, color: '#6B7C6E', marginLeft: 6, fontWeight: 500 }}>Meals &amp; Saved</span>
              </div>
            </div>
          </div>

          {/* Right: Floating UI Cards */}
          <div style={{ position: 'relative', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Large sage green oval background blob */}
            <div className="hero-blob" style={{ position: 'absolute', width: 380, height: 360, borderRadius: '50%', background: 'radial-gradient(ellipse at center, #C8D8C4 0%, #B8CDB4 60%, transparent 100%)', top: '50%', left: '50%', transform: 'translate(-48%, -50%)', zIndex: 0 }} />

            {/* Main Freshness Score card */}
            <div className="hero-card-1" style={{ position: 'absolute', left: '2%', top: '10%', zIndex: 3, background: 'white', borderRadius: 20, padding: '20px 24px', boxShadow: '0 8px 40px rgba(46,52,48,0.13)', minWidth: 180 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9EAA8A', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Freshness Score</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <svg width={72} height={72} viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#EEF2EE" strokeWidth="6" />
                  <circle cx="36" cy="36" r="30" fill="none" stroke={C.forest} strokeWidth="6"
                    strokeDasharray={`${(87 / 100) * 188.5} 188.5`}
                    strokeLinecap="round" strokeDashoffset="47" transform="rotate(-90 36 36)" />
                  <text x="36" y="33" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.charcoal} fontFamily="'Plus Jakarta Sans', sans-serif">87</text>
                  <text x="36" y="45" textAnchor="middle" fontSize="8" fontWeight="500" fill={C.olive} fontFamily="Inter, sans-serif">/100</text>
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal }}>Excellent</div>
                  <div style={{ fontSize: 11, color: C.olive }}>Quality</div>
                </div>
              </div>
            </div>

            {/* ResQPlate circular badge */}
            <div className="hero-card-2" style={{ position: 'absolute', right: '6%', top: '25%', zIndex: 3, width: 96, height: 96, borderRadius: '50%', background: `linear-gradient(135deg, ${C.forest} 0%, ${C.sage} 100%)`, boxShadow: '0 8px 32px rgba(70,91,74,0.30)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={22} color="white" />
              <div style={{ fontSize: 7, fontWeight: 800, color: 'white', marginTop: 4, letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.3 }}>ResQPlate<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>Food Rescue</span></div>
            </div>

            {/* Notification: 15 meals donated */}
            <div className="hero-card-3" style={{ position: 'absolute', right: '-2%', top: '5%', zIndex: 4, background: 'white', borderRadius: 14, padding: '10px 14px', boxShadow: '0 6px 28px rgba(46,52,48,0.11)', display: 'flex', gap: 10, alignItems: 'center', minWidth: 200 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.sageLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={16} color={C.forest} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.charcoal }}>15 meals donated</div>
                <div style={{ fontSize: 10, color: C.olive, marginTop: 1 }}>Spiro Sander · Just now</div>
              </div>
            </div>

            {/* Notification: Delivery confirmed */}
            <div className="hero-card-4" style={{ position: 'absolute', left: '0%', bottom: '16%', zIndex: 4, background: 'white', borderRadius: 14, padding: '10px 14px', boxShadow: '0 6px 28px rgba(46,52,48,0.11)', display: 'flex', gap: 10, alignItems: 'center', minWidth: 190 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="#4CAF50" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.charcoal }}>Delivery confirmed</div>
                <div style={{ fontSize: 10, color: C.olive, marginTop: 1 }}>Reaching at $50</div>
              </div>
            </div>

            {/* Notification: Volunteer on route */}
            <div className="hero-card-5" style={{ position: 'absolute', right: '0%', bottom: '10%', zIndex: 4, background: 'white', borderRadius: 14, padding: '10px 14px', boxShadow: '0 6px 28px rgba(46,52,48,0.11)', display: 'flex', gap: 10, alignItems: 'center', minWidth: 180 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={16} color="#FF9800" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.charcoal }}>Volunteer on route</div>
                <div style={{ fontSize: 10, color: C.olive, marginTop: 1 }}>ETA · 8 min</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Counter */}
      <section id="impact" style={{ background: C.charcoal, padding: '72px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 12 }}>Our Impact, Measured</h2>
            <p style={{ color: C.olive, fontSize: 15 }}>Real numbers. Real change. Updated live.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {[{ icon: '🍽', to: 184720, suffix: '+', label: 'Meals Saved', color: C.sage }, { icon: '♻️', to: 62, suffix: ' T', label: 'Food Rescued', color: C.olive }, { icon: '🌱', to: 18, suffix: ' T CO₂', label: 'Emissions Avoided', color: '#7EC8A0' }, { icon: '💧', to: 2400, suffix: ' KL', label: 'Water Saved', color: '#4A90A4' }].map((stat, i) => (
              <div key={i} className="anim-fadeUp" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{stat.icon}</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  <AnimCounter to={stat.to} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: 14, color: C.olive, marginTop: 8, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" style={{ padding: '96px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.sage, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 12 }}>The Process</p>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginBottom: 16 }}>How ResQPlate Works</h2>
            <p style={{ fontSize: 16, color: '#6B7C6E', maxWidth: 460, margin: '0 auto' }}>From surplus to served — in minutes. Powered by AI, driven by humanity.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[{ step: '01', title: 'Restaurant Donates', desc: 'Upload food photos. AI analyzes freshness, quantity, and safety instantly.', icon: '🏛', color: C.forest }, { step: '02', title: 'AI Matches NGO', desc: 'Smart engine finds the best nearby NGO using 13+ real-time factors.', icon: '🤖', color: '#6B48C8' }, { step: '03', title: 'Volunteer Picks Up', desc: 'Nearest volunteer assigned. QR-verified, GPS-tracked, every trip.', icon: '🚴', color: C.sage }, { step: '04', title: 'Community Fed', desc: 'Food reaches people in need. Impact certificate auto-generated.', icon: '❤️', color: '#D4705A' }].map((s, i) => (
              <div key={i} className="anim-fadeUp" style={{ background: C.white, borderRadius: 24, padding: 28, animationDelay: `${i * 0.1}s`, transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 56px rgba(46,52,48,0.14)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ fontSize: 44, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color, letterSpacing: '0.06em', marginBottom: 8 }}>{s.step}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.charcoal, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7C6E', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: C.beige, padding: '96px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.sage, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Platform Features</p>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em' }}>Built for Scale. Designed for Impact.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[{ icon: <Cpu size={22} />, title: 'AI Food Scanner', desc: 'Computer vision classifies food, detects spoilage, estimates servings, and calculates a Freshness Score in seconds.' }, { icon: <Zap size={22} />, title: 'Smart Matching Engine', desc: 'AI matches donations to the best NGO using 13 factors: distance, demand, capacity, dietary needs, and more.' }, { icon: <Navigation size={22} />, title: 'Live Tracking', desc: 'Real-time GPS tracking every donation from pickup to delivery with ETA and delay alerts.' }, { icon: <QrCode size={22} />, title: 'QR Verification', desc: 'Every handoff secured by QR codes. Digital signatures create an immutable chain of custody.' }, { icon: <BarChart2 size={22} />, title: 'Impact Analytics', desc: 'Beautiful dashboards. ESG reporting, CSR certificates, trend analysis for all stakeholders.' }, { icon: <Shield size={22} />, title: 'AI Fraud Detection', desc: 'ML-powered anomaly detection flags duplicate donations, GPS mismatches, and suspicious patterns.' }].map((f, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 22, padding: '24px 26px', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(46,52,48,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sageLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7C6E', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '96px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em' }}>Stories of Impact</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[{ name: 'Chef Arjun Mehta', role: 'Head Chef, The Grand Spice', quote: "ResQPlate turned our biggest guilt — daily food waste — into our greatest pride. We've saved 2,847 meals.", rating: 5 }, { name: 'Dr. Sunita Patel', role: 'Director, Asha Foundation', quote: "The AI matching is extraordinary. We receive exactly what our community needs, and freshness scores give us full confidence.", rating: 5 }, { name: 'Rohan Kumar', role: 'Volunteer, Mumbai', quote: "Being a ResQPlate volunteer changed my life. 47 trips of food to people who genuinely needed it. The app is effortless.", rating: 5 }].map((t, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 24, padding: 28 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill={C.warning} color={C.warning} />)}
                </div>
                <p style={{ fontSize: 14, color: '#4A5A4C', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' as const }}>"{t.quote}"</p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Avatar name={t.name} size={40} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.charcoal }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.olive }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 32px 80px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.charcoal} 100%)`, borderRadius: 36, padding: '72px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(122,143,120,0.15)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(122,143,120,0.1)' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: C.olive, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 16, position: 'relative', zIndex: 1 }}>Join the Movement</p>
            <h2 style={{ fontSize: 52, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 20, position: 'relative', zIndex: 1 }}>Start Saving Food Today</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 40, maxWidth: 460, margin: '0 auto 40px', position: 'relative', zIndex: 1 }}>Whether you're a restaurant, NGO, or volunteer — ResQPlate has a place for you.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <Btn variant="secondary" size="lg" onClick={() => onNavigate('choose')}>Get Started Free <ArrowRight size={16} /></Btn>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={{ background: C.charcoal, padding: '56px 32px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <ResQPlateLogo size={32} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 16, lineHeight: 1.7, maxWidth: 280 }}>AI-powered food rescue ecosystem. Our mission: eliminate food waste while feeding communities in need.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                {[ExternalLink, Share2, Link2].map((Icon, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon size={16} color="rgba(255,255,255,0.5)" />
                  </div>
                ))}
              </div>
            </div>
            {[{ title: 'Platform', links: ['Restaurant Portal', 'NGO Dashboard', 'Volunteer App', 'Admin Console'] }, { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog'] }, { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact'] }].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{col.title}</h4>
                {col.links.map(link => <div key={link} style={{ marginBottom: 10 }}><a href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textDecoration: 'none' }}>{link}</a></div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 12 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>© 2026 ResQPlate Technologies Pvt. Ltd. All rights reserved.</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>Made with ❤️ for a hunger-free world</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function RoleChooser({ onChoose, onOpenAdminPortal }: { onChoose: (role: string) => void; onOpenAdminPortal?: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: "'Inter', sans-serif" }}>
      <div className="anim-fadeUp" style={{ maxWidth: 840, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <ResQPlateLogo size={44} />
          <h1 style={{ fontSize: 36, fontWeight: 800, color: C.charcoal, marginTop: 24, marginBottom: 10, letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Who are you joining as?</h1>
          <p style={{ fontSize: 15, color: C.olive, fontWeight: 500 }}>Choose your role to enter your dedicated portal</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {[{ id: 'restaurant', title: 'Restaurant / Hotel', sub: 'Donate surplus food', icon: '🏛', desc: 'Bakeries, hotels, college messes — turn waste into impact.', color: C.forest }, { id: 'ngo', title: 'NGO / Organization', sub: 'Receive & distribute food', icon: '🤝', desc: 'Accept nearby donations, manage inventory, track impact.', color: C.sage }, { id: 'volunteer', title: 'Volunteer', sub: 'Pick up & deliver', icon: '🚴', desc: 'Earn badges, certificates, and leaderboard glory.', color: '#6B48C8' }].map((role, i) => (
            <button key={role.id} onClick={() => onChoose(role.id)} className="anim-fadeUp btn-press" style={{ background: C.white, borderRadius: 24, padding: '32px 24px', border: '1px solid rgba(122,143,120,0.18)', cursor: 'pointer', textAlign: 'left' as const, animationDelay: `${i * 0.08}s`, transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.border = `2px solid ${role.color}`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(46,52,48,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(122,143,120,0.18)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>{role.icon}</div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: C.charcoal, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{role.title}</h3>
              <p style={{ fontSize: 13, fontWeight: 700, color: role.color, marginBottom: 10 }}>{role.sub}</p>
              <p style={{ fontSize: 13, color: '#6B7C6E', lineHeight: 1.6 }}>{role.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 22, color: role.color, fontSize: 13, fontWeight: 700 }}>
                Enter portal →
              </div>
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <button onClick={() => onChoose('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.olive, fontSize: 14, fontWeight: 600 }}>← Back to landing page</button>
          {onOpenAdminPortal && (
            <button onClick={onOpenAdminPortal} style={{ background: C.beige, border: 'none', padding: '8px 18px', borderRadius: 999, cursor: 'pointer', color: C.charcoal, fontSize: 13, fontWeight: 700 }}>
              🔒 Platform Administrator? Access Admin Portal →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function LuxuryFluidWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let targetMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008; // Ultra slow, majestic speed for luxury feel

      // Buttery smooth mouse interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.03;
      mouse.y += (targetMouse.y - mouse.y) * 0.03;

      const waves = [
        { color: 'rgba(70, 91, 74, 0.15)',  amp: 300, freq: 0.001,  speed: 1.0, offset: 0, y: canvas.height * 0.3 }, // Forest
        { color: 'rgba(122, 143, 120, 0.2)',amp: 350, freq: 0.0015, speed: 1.2, offset: 2, y: canvas.height * 0.6 }, // Sage
        { color: 'rgba(183, 135, 10, 0.08)',amp: 250, freq: 0.002,  speed: 1.5, offset: 4, y: canvas.height * 0.5 }, // Ambani Gold
        { color: 'rgba(158, 170, 138, 0.15)',amp: 200, freq: 0.0012, speed: 0.8, offset: 1, y: canvas.height * 0.8 }  // Olive
      ];

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, wave.y);

        for (let x = 0; x <= canvas.width + 20; x += 20) { // Step by 20px for performance
          let currentY = wave.y + Math.sin(x * wave.freq + time * wave.speed + wave.offset) * wave.amp;

          // Magnetic liquid pull to mouse
          const dx = x - mouse.x;
          const dy = currentY - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Huge influence radius for a soft, liquid magnetic feel
          const influenceRadius = 600; 
          if (distance < influenceRadius) {
            // Smooth cosine interpolation for the magnetic pull
            const pull = (1 + Math.cos(Math.PI * (distance / influenceRadius))) / 2;
            currentY += (mouse.y - currentY) * pull * 0.4;
          }

          ctx.lineTo(x, currentY);
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 180; // Massive soft glowing bands
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.filter = 'blur(60px)'; // Ultra premium Apple-style glass blur
        ctx.stroke();
      });

      ctx.filter = 'none';
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}
