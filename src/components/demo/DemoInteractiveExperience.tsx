import React, { useState } from 'react';
import { C } from '../../constants/theme';
import { useDemo, DemoFlowStep } from '../../contexts/DemoContext';
import { 
  LayoutDashboard, Plus, Sparkles, CheckCircle2, Truck, Heart, BarChart2, User, 
  ArrowRight, ShieldCheck, Cpu, MapPin, Clock, AlertCircle, RefreshCw, Check, 
  Leaf, Info, FileText, ChevronRight, CheckCheck, Star
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export function DemoInteractiveExperience() {
  const { 
    flowStep, 
    setFlowStep, 
    demoMetrics, 
    currentDonation, 
    updateDonationForm, 
    submitDonationToAI, 
    approveSafetyVerify, 
    confirmNgoMatch, 
    advancePickupStatus,
    resetDemo 
  } = useDemo();

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [safetyChecklist, setSafetyChecklist] = useState({
    tempMaintained: true,
    licensedKitchen: true,
    hygieneChecked: true,
    noAllergens: true
  });

  const handleRunAi = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiAnalyzing(false);
      submitDonationToAI();
    }, 1200);
  };

  const navItems: { id: DemoFlowStep; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: <LayoutDashboard size={17} /> },
    { id: 'create', label: 'Create Donation', icon: <Plus size={17} /> },
    { id: 'ai_analysis', label: 'AI Food Analysis', icon: <Cpu size={17} />, badge: 'AI' },
    { id: 'human_verify', label: 'Human Verification', icon: <ShieldCheck size={17} /> },
    { id: 'ngo_match', label: 'NGO Matching', icon: <Heart size={17} /> },
    { id: 'pickup', label: 'Pickup Coordination', icon: <Truck size={17} /> },
    { id: 'impact', label: 'Impact Dashboard', icon: <BarChart2 size={17} /> },
    { id: 'profile', label: 'Demo Profile', icon: <User size={17} /> }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 45px)', background: C.ivory, fontFamily: "'Inter', sans-serif" }}>
      {/* ─── SIDEBAR NAVIGATION ─── */}
      <aside style={{
        width: 260,
        background: C.white,
        borderRight: `1px solid ${C.beige}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        flexShrink: 0
      }}>
        <div>
          {/* Logo & Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 24px', borderBottom: `1px solid ${C.beige}` }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>R</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.charcoal, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zestio</div>
              <div style={{ fontSize: 11, color: C.forest, fontWeight: 700, letterSpacing: '0.04em' }}>DEMO PLATFORM</div>
            </div>
          </div>

          {/* Navigation Section */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.olive, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px 10px' }}>
              Professor Walkthrough
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navItems.map(item => {
                const isActive = flowStep === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFlowStep(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: 'none',
                      background: isActive ? C.forest : 'transparent',
                      color: isActive ? 'white' : C.charcoal,
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.ivory; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: isActive ? 'white' : C.forest }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span style={{ fontSize: 9, fontWeight: 800, background: isActive ? 'rgba(255,255,255,0.2)' : C.sageLight, color: isActive ? 'white' : C.forest, padding: '2px 6px', borderRadius: 6 }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Demo Mode Footer Card */}
        <div style={{
          background: `linear-gradient(135deg, ${C.sageLight} 0%, #E2EBE1 100%)`,
          borderRadius: 16,
          padding: 16,
          border: `1px solid ${C.sage}40`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.forest, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
            <Sparkles size={14} /> DEMO ACTIVE
          </div>
          <p style={{ fontSize: 11, color: C.charcoal, lineHeight: 1.4, margin: 0 }}>
            Authentication is intentionally bypassed for rapid evaluation.
          </p>
          <button
            onClick={resetDemo}
            style={{
              marginTop: 12,
              width: '100%',
              background: C.white,
              color: C.forest,
              border: `1px solid ${C.sage}`,
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <RefreshCw size={12} /> Reset Data State
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ─── SCREEN 1: OVERVIEW DASHBOARD ─── */}
        {flowStep === 'overview' && (
          <div className="anim-fadeUp">
            {/* Header Hero Banner */}
            <div style={{
              background: `linear-gradient(135deg, ${C.forest} 0%, ${C.charcoal} 100%)`,
              borderRadius: 24,
              padding: '32px 36px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ position: 'relative', zIndex: 1, maxWidth: 540 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: C.olive, marginBottom: 12 }}>
                  <Leaf size={14} /> Restaurant / Donor Portal
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Welcome back, <span style={{ color: C.olive }}>Demo User</span> 🌿
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8, lineHeight: 1.6 }}>
                  You have saved <strong>{demoMetrics.mealsDistributed.toLocaleString()} meals</strong> and offset <strong>{demoMetrics.co2ReducedTons} tons of CO₂</strong> through the Zestio ecosystem.
                </p>
                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setFlowStep('create')}
                    style={{
                      background: 'white',
                      color: C.forest,
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Plus size={16} /> Donate Today's Surplus
                  </button>
                  <button
                    onClick={() => setFlowStep('impact')}
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '12px 20px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <BarChart2 size={16} /> View ESG Analytics
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.08)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: 48 }}>🏆</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.warning, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Platinum Rescue Partner</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Top 2% Food Donor in Region</div>
              </div>
            </div>

            {/* Metric Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 24 }}>
              {[
                { label: 'Total Food Saved', val: `${demoMetrics.foodSavedKg.toLocaleString()} kg`, icon: <Leaf size={20} color={C.forest} />, bg: '#EDF4EE' },
                { label: 'Meals Distributed', val: demoMetrics.mealsDistributed.toLocaleString(), icon: <Heart size={20} color="#D35400" />, bg: '#FDF2E9' },
                { label: 'CO₂ Reduction', val: `${demoMetrics.co2ReducedTons} tons`, icon: <ShieldCheck size={20} color="#27AE60" />, bg: '#E8F8F5' },
                { label: 'Active Donations', val: demoMetrics.activeDonations, icon: <Truck size={20} color="#2980B9" />, bg: '#EBF5FB' }
              ].map((m, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: `1px solid ${C.beige}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.olive }}>{m.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.icon}
                    </div>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.charcoal, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {m.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Donations Table */}
            <div style={{ background: C.white, borderRadius: 20, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: `1px solid ${C.beige}`, marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: C.charcoal, margin: 0 }}>Active & Recent Surplus Listings</h3>
                  <p style={{ fontSize: 13, color: C.olive, margin: '4px 0 0' }}>Real-time status of food rescue items in transit</p>
                </div>
                <button
                  onClick={() => setFlowStep('create')}
                  style={{ background: C.forest, color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={14} /> New Listing
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.beige}`, color: C.olive, textTransform: 'uppercase', fontSize: 11, fontWeight: 700 }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Item ID</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Food Item</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Quantity</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Freshness Score</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Matched NGO</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${C.beige}` }}>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: C.forest }}>{currentDonation.id}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>{currentDonation.food}</td>
                    <td style={{ padding: '14px 12px' }}>{currentDonation.kg} ({currentDonation.meals} meals)</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ background: '#E8F8F5', color: '#27AE60', padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: 12 }}>
                        {currentDonation.freshnessScore}% Fresh
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>{currentDonation.ngoName}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 800,
                        background: currentDonation.status === 'DELIVERED' ? '#E8F8F5' : currentDonation.status === 'NGO_MATCHED' ? '#EBF5FB' : '#FEF9E7',
                        color: currentDonation.status === 'DELIVERED' ? '#27AE60' : currentDonation.status === 'NGO_MATCHED' ? '#2980B9' : '#D4AC0D'
                      }}>
                        {currentDonation.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => setFlowStep('create')}
                        style={{ background: C.sageLight, color: C.forest, border: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                      >
                        Explore Flow →
                      </button>
                    </td>
                  </tr>
                  {[
                    { id: 'RSQ-DEMO-808', food: 'Paneer Makhani & Naan', kg: '18 kg', meals: 65, score: 94, ngo: 'City Hope Shelter', status: 'DELIVERED' },
                    { id: 'RSQ-DEMO-707', food: 'Mixed Fruit Salad Bowl', kg: '12 kg', meals: 40, score: 88, ngo: 'Seva Annakshetra', status: 'DELIVERED' }
                  ].map((r, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${C.beige}` }}>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: C.forest }}>{r.id}</td>
                      <td style={{ padding: '14px 12px' }}>{r.food}</td>
                      <td style={{ padding: '14px 12px' }}>{r.kg} ({r.meals} meals)</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ background: '#E8F8F5', color: '#27AE60', padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: 12 }}>{r.score}% Fresh</span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>{r.ngo}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ background: '#E8F8F5', color: '#27AE60', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>DELIVERED</span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right', color: C.olive, fontSize: 12 }}>Completed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Guidance Banner */}
            <div style={{ background: `linear-gradient(90deg, ${C.forest} 0%, #344337 100%)`, borderRadius: 16, padding: '20px 28px', color: 'white', marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.olive, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Step 1 of 6 Completed</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>Next Step: Create Surplus Donation & Run AI Analysis</div>
              </div>
              <button
                onClick={() => setFlowStep('create')}
                style={{ background: 'white', color: C.forest, border: 'none', padding: '10px 22px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                Create Donation Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── SCREEN 2: CREATE DONATION ─── */}
        {flowStep === 'create' && (
          <div className="anim-fadeUp" style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
            <div style={{ background: C.white, borderRadius: 24, padding: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${C.beige}` }}>
              <div style={{ borderBottom: `1px solid ${C.beige}`, paddingBottom: 20, marginBottom: 24 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.sageLight, color: C.forest, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                  <Plus size={14} /> Step 2: Create Donation
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: C.charcoal, margin: 0 }}>Register Surplus Food Batch</h2>
                <p style={{ fontSize: 13, color: C.olive, marginTop: 4 }}>Enter details for automated AI fresh testing and matching</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>Food Name / Item</label>
                  <input
                    type="text"
                    value={currentDonation.food}
                    onChange={e => updateDonationForm({ food: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.beige}`, fontSize: 14, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>Food Category</label>
                  <select
                    value={currentDonation.category}
                    onChange={e => updateDonationForm({ category: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.beige}`, fontSize: 14, outline: 'none' }}
                  >
                    <option value="Cooked Meal">Cooked Meal (Rice/Curry/Naan)</option>
                    <option value="Bakery & Snacks">Bakery & Pastries</option>
                    <option value="Raw Produce">Fresh Fruits & Vegetables</option>
                    <option value="Packaged Items">Sealed / Packaged Goods</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>Quantity (kg / lbs)</label>
                  <input
                    type="text"
                    value={currentDonation.kg}
                    onChange={e => updateDonationForm({ kg: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.beige}`, fontSize: 14, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>Estimated Servings</label>
                  <input
                    type="number"
                    value={currentDonation.meals}
                    onChange={e => updateDonationForm({ meals: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.beige}`, fontSize: 14, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>Preparation Time</label>
                  <input
                    type="text"
                    value={currentDonation.prepTime}
                    onChange={e => updateDonationForm({ prepTime: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.beige}`, fontSize: 14, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>Storage Condition</label>
                  <input
                    type="text"
                    value={currentDonation.storageCondition}
                    onChange={e => updateDonationForm({ storageCondition: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.beige}`, fontSize: 14, outline: 'none' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>Pickup Address / Location</label>
                  <input
                    type="text"
                    value={currentDonation.location}
                    onChange={e => updateDonationForm({ location: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.beige}`, fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Sample Photo Preview Block */}
              <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: C.ivory, border: `1.5px dashed ${C.sage}`, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: C.forest, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                  SAMPLE FOOD
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.charcoal }}>Food Image Loaded for AI Assessment</div>
                  <div style={{ fontSize: 12, color: C.olive, marginTop: 2 }}>High-resolution sample photo: Vegetable Biryani (Batch #909)</div>
                  <div style={{ fontSize: 11, color: C.forest, fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} /> Ready for Vision Engine Analysis
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setFlowStep('overview')}
                  style={{ background: 'transparent', border: `1px solid ${C.beige}`, color: C.charcoal, padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  ← Back to Dashboard
                </button>

                <button
                  onClick={handleRunAi}
                  disabled={aiAnalyzing}
                  style={{
                    background: C.forest,
                    color: 'white',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(70,91,74,0.25)'
                  }}
                >
                  {aiAnalyzing ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Running AI Quality Scan...
                    </>
                  ) : (
                    <>
                      <Cpu size={18} /> Submit &amp; Run AI Analysis <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 3: AI FOOD ANALYSIS DEMO ─── */}
        {flowStep === 'ai_analysis' && (
          <div className="anim-fadeUp" style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            {/* Disclaimer Alert */}
            <div style={{ background: '#FFF8E7', border: '1px solid #FFE0B2', borderRadius: 16, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertCircle size={20} color="#E67E22" />
              <div style={{ fontSize: 12, color: '#B9770E', lineHeight: 1.4 }}>
                <strong>PROTOTYPE DEMO NOTICE:</strong> The AI food quality assessment below is simulated for product demonstration purposes. It demonstrates Zestio's visual inspection workflow and does not replace statutory food safety certification.
              </div>
            </div>

            <div style={{ background: C.white, borderRadius: 24, padding: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${C.beige}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.beige}`, paddingBottom: 20, marginBottom: 28 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.sageLight, color: C.forest, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                    <Cpu size={14} /> Step 3: AI Computer Vision Analysis
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: C.charcoal, margin: 0 }}>Freshness &amp; Safety Assessment Result</h2>
                </div>
                <div style={{ background: '#E8F8F5', color: '#27AE60', padding: '6px 14px', borderRadius: 12, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> PASS (Confidence: {currentDonation.confidenceScore}%)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28 }}>
                {/* Left Meter Graphic */}
                <div style={{ background: C.ivory, borderRadius: 20, padding: 24, textAlign: 'center', border: `1px solid ${C.beige}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.olive, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    Freshness Index
                  </div>
                  <svg width={130} height={130} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E2EBE1" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={C.forest} strokeWidth="8"
                      strokeDasharray={`${(currentDonation.freshnessScore / 100) * 263.8} 263.8`}
                      strokeLinecap="round" strokeDashoffset="65" transform="rotate(-90 50 50)" />
                    <text x="50" y="47" textAnchor="middle" fontSize="22" fontWeight="800" fill={C.charcoal}>{currentDonation.freshnessScore}%</text>
                    <text x="50" y="62" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.forest}>FRESH</text>
                  </svg>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.forest, marginTop: 12 }}>
                    Safe Shelf-Life: ~4.5 Hours
                  </div>
                </div>

                {/* Right Result Key-Values */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Food Recognition', val: currentDonation.food, sub: 'Detected with high visual clarity' },
                    { label: 'Food Category', val: currentDonation.category, sub: 'Standard Cooked Grains & Spices' },
                    { label: 'Estimated Freshness', val: `${currentDonation.freshnessScore}% Fresh`, sub: 'Optimal thermal preservation detected' },
                    { label: 'Safety Status', val: currentDonation.safetyStatus, sub: 'No visual discoloration or spoilage' },
                    { label: 'Model Confidence', val: `${currentDonation.confidenceScore}% Confidence`, sub: 'ResQ-Vision-V2 Neural Net' }
                  ].map((row, idx) => (
                    <div key={idx} style={{ padding: '12px 16px', background: C.ivory, borderRadius: 14, border: `1px solid ${C.beige}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 11, color: C.olive, fontWeight: 600 }}>{row.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.charcoal, marginTop: 2 }}>{row.val}</div>
                      </div>
                      <span style={{ fontSize: 11, color: C.forest, fontWeight: 500 }}>{row.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation Box */}
              <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: '#F4F8F4', border: `1px solid ${C.forest}30`, display: 'flex', gap: 14, alignItems: 'center' }}>
                <Sparkles size={24} color={C.forest} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.forest }}>AI Recommendation</div>
                  <div style={{ fontSize: 13, color: C.charcoal, marginTop: 2 }}>"{currentDonation.aiRecommendation}"</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setFlowStep('create')}
                  style={{ background: 'transparent', border: `1px solid ${C.beige}`, color: C.charcoal, padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  ← Edit Donation Details
                </button>

                <button
                  onClick={() => setFlowStep('human_verify')}
                  style={{
                    background: C.forest,
                    color: 'white',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(70,91,74,0.25)'
                  }}
                >
                  Proceed to Human Safety Checklist <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 4: HUMAN VERIFICATION FLOW ─── */}
        {flowStep === 'human_verify' && (
          <div className="anim-fadeUp" style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <div style={{ background: C.white, borderRadius: 24, padding: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${C.beige}` }}>
              <div style={{ borderBottom: `1px solid ${C.beige}`, paddingBottom: 20, marginBottom: 28 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.sageLight, color: C.forest, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                  <ShieldCheck size={14} /> Step 4: Human Safety Verification & Timeline
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: C.charcoal, margin: 0 }}>Safety Timeline &amp; Sign-Off</h2>
              </div>

              {/* Status Timeline Workflow Diagram */}
              <div style={{ background: C.ivory, padding: 24, borderRadius: 20, border: `1px solid ${C.beige}`, marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.olive, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  End-to-End Safety Workflow Timeline
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                  {[
                    { title: 'Food Submitted', active: true, done: true },
                    { title: 'AI Analysis', active: true, done: true },
                    { title: 'Safety Questions', active: true, done: false },
                    { title: 'Human Verification', active: false, done: false },
                    { title: 'Approved', active: false, done: false }
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: s.done ? C.forest : s.active ? C.warning : C.beige,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800
                      }}>
                        {s.done ? <Check size={16} /> : i + 1}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.active ? C.charcoal : C.olive }}>{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Safety Checklist */}
              <h4 style={{ fontSize: 16, fontWeight: 800, color: C.charcoal, marginBottom: 14 }}>Mandatory Safety Sign-Off Questions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'tempMaintained', q: 'Has the food been stored at or below 4°C (or above 60°C for hot meals) since preparation?' },
                  { key: 'licensedKitchen', q: 'Was this food prepared in an FSSAI-certified / licensed commercial kitchen facility?' },
                  { key: 'hygieneChecked', q: 'Have food handlers verified that containers are sealed and food grade certified?' },
                  { key: 'noAllergens', q: 'Are all ingredients accurately labeled with potential allergen warnings?' }
                ].map((item) => {
                  const isChecked = (safetyChecklist as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => setSafetyChecklist(prev => ({ ...prev, [item.key]: !isChecked }))}
                      style={{
                        padding: '14px 18px',
                        background: isChecked ? C.sageLight : C.white,
                        border: `1.5px solid ${isChecked ? C.forest : C.beige}`,
                        borderRadius: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: `2px solid ${isChecked ? C.forest : C.olive}`,
                        background: isChecked ? C.forest : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        {isChecked && <CheckCheck size={14} />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.charcoal }}>{item.q}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setFlowStep('ai_analysis')}
                  style={{ background: 'transparent', border: `1px solid ${C.beige}`, color: C.charcoal, padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  ← Back to AI Results
                </button>

                <button
                  onClick={approveSafetyVerify}
                  style={{
                    background: C.forest,
                    color: 'white',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(70,91,74,0.25)'
                  }}
                >
                  Approve Safety &amp; Find Nearby NGOs <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 5: NGO MATCHING DEMO ─── */}
        {flowStep === 'ngo_match' && (
          <div className="anim-fadeUp" style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <div style={{ background: C.white, borderRadius: 24, padding: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${C.beige}` }}>
              <div style={{ borderBottom: `1px solid ${C.beige}`, paddingBottom: 20, marginBottom: 28 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.sageLight, color: C.forest, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                  <Heart size={14} /> Step 5: Intelligent NGO Matching Engine
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: C.charcoal, margin: 0 }}>Optimal Nearby NGO Pairing</h2>
                <p style={{ fontSize: 13, color: C.olive, marginTop: 4 }}>Spatial Haversine algorithm matching surplus food to closest verified community kitchen</p>
              </div>

              {/* Matched NGO Card */}
              <div style={{
                background: currentDonation.status === 'NGO_MATCHED' || currentDonation.status === 'PICKUP_IN_PROGRESS' || currentDonation.status === 'DELIVERED' ? '#F4F9F5' : C.white,
                border: `2px solid ${C.forest}`,
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <span style={{ background: C.forest, color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                      Primary Match (Rank #1)
                    </span>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: C.charcoal, margin: '8px 0 2px' }}>{currentDonation.ngoName}</h3>
                    <div style={{ fontSize: 13, color: C.olive, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color={C.forest} /> Distance: <strong>{currentDonation.ngoDistance}</strong> • Community Kitchen Center
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.forest }}>100 Servings</div>
                    <div style={{ fontSize: 12, color: C.olive }}>Capacity: {currentDonation.ngoCapacity}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, margin: '20px 0', padding: '14px', background: C.white, borderRadius: 14, border: `1px solid ${C.beige}` }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.olive }}>Required Meals</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.charcoal }}>80 Meals / Day</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.olive }}>Pickup Readiness</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#27AE60' }}>Ready Immediately</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.olive }}>Trust Score</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.forest }}>98/100 (Verified)</div>
                  </div>
                </div>

                {/* Match Action Button */}
                {currentDonation.status === 'NGO_MATCHED' || currentDonation.status === 'PICKUP_IN_PROGRESS' || currentDonation.status === 'DELIVERED' ? (
                  <div style={{ background: '#27AE60', color: 'white', padding: '14px', borderRadius: 14, fontWeight: 800, fontSize: 15, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <CheckCircle2 size={20} /> NGO Matched ✓ (Inventory Locked for Hope Foundation)
                  </div>
                ) : (
                  <button
                    onClick={confirmNgoMatch}
                    style={{
                      width: '100%',
                      background: C.forest,
                      color: 'white',
                      border: 'none',
                      padding: '14px',
                      borderRadius: 14,
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(70,91,74,0.3)'
                    }}
                  >
                    <Heart size={18} /> Confirm &amp; Match Donation to {currentDonation.ngoName}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setFlowStep('human_verify')}
                  style={{ background: 'transparent', border: `1px solid ${C.beige}`, color: C.charcoal, padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  ← Back to Verification
                </button>

                <button
                  onClick={() => setFlowStep('pickup')}
                  disabled={currentDonation.status === 'DRAFT'}
                  style={{
                    background: currentDonation.status === 'DRAFT' ? C.beige : C.forest,
                    color: currentDonation.status === 'DRAFT' ? C.olive : 'white',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: currentDonation.status === 'DRAFT' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  Proceed to Pickup Coordination <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 6: PICKUP COORDINATION DEMO ─── */}
        {flowStep === 'pickup' && (
          <div className="anim-fadeUp" style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <div style={{ background: C.white, borderRadius: 24, padding: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${C.beige}` }}>
              <div style={{ borderBottom: `1px solid ${C.beige}`, paddingBottom: 20, marginBottom: 28 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.sageLight, color: C.forest, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                  <Truck size={14} /> Step 6: Real-Time Pickup &amp; Route Logistics
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: C.charcoal, margin: 0 }}>Volunteer Pickup Coordination</h2>
              </div>

              {/* Pickup Progress Steps Bar */}
              <div style={{ background: C.ivory, padding: 24, borderRadius: 20, border: `1px solid ${C.beige}`, marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.olive, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  Logistics Tracking Timeline
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {[
                    { title: 'Donation Approved', done: true },
                    { title: 'NGO Matched', done: true },
                    { title: 'Volunteer Assigned', done: true },
                    { title: 'Pickup In Progress', done: currentDonation.status === 'PICKUP_IN_PROGRESS' || currentDonation.status === 'DELIVERED' },
                    { title: 'Food Delivered', done: currentDonation.status === 'DELIVERED' }
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: p.done ? C.forest : C.beige,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800
                      }}>
                        {p.done ? <Check size={16} /> : i + 1}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: p.done ? C.charcoal : C.olive }}>{p.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volunteer & Logistics Detail Card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: C.ivory, padding: 20, borderRadius: 16, border: `1px solid ${C.beige}` }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.olive, textTransform: 'uppercase', marginBottom: 8 }}>Assigned Logistics Partner</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.charcoal }}>{currentDonation.volunteerName}</div>
                  <div style={{ fontSize: 13, color: C.forest, fontWeight: 600, marginTop: 2 }}>{currentDonation.volunteerVehicle}</div>
                  <div style={{ fontSize: 12, color: C.olive, marginTop: 8 }}>Rating: ★ 4.98 (240+ Food Rescues)</div>
                </div>

                <div style={{ background: C.ivory, padding: 20, borderRadius: 16, border: `1px solid ${C.beige}` }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.olive, textTransform: 'uppercase', marginBottom: 8 }}>Destination Community Center</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.charcoal }}>{currentDonation.ngoName}</div>
                  <div style={{ fontSize: 13, color: C.olive, marginTop: 2 }}>Estimated Arrival: <strong>{currentDonation.estPickupTime}</strong></div>
                  <div style={{ fontSize: 12, color: C.forest, fontWeight: 600, marginTop: 8 }}>Dual OTP Security Code: #4892</div>
                </div>
              </div>

              {/* Interactive Status Simulation Button */}
              <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: '#EBF5FB', border: '1px solid #AED6F1', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#2980B9', marginBottom: 10 }}>
                  Current Status: {currentDonation.status}
                </div>
                <button
                  onClick={advancePickupStatus}
                  style={{
                    background: '#2980B9',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <RefreshCw size={14} /> Simulate Next Logistics Step (Advance Pickup/Delivery)
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setFlowStep('ngo_match')}
                  style={{ background: 'transparent', border: `1px solid ${C.beige}`, color: C.charcoal, padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  ← Back to NGO Match
                </button>

                <button
                  onClick={() => setFlowStep('impact')}
                  style={{
                    background: C.forest,
                    color: 'white',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(70,91,74,0.25)'
                  }}
                >
                  View Final Impact Dashboard <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 7: IMPACT DASHBOARD DEMO ─── */}
        {flowStep === 'impact' && (
          <div className="anim-fadeUp" style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
            <div style={{ background: C.white, borderRadius: 24, padding: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${C.beige}` }}>
              <div style={{ borderBottom: `1px solid ${C.beige}`, paddingBottom: 20, marginBottom: 28 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.sageLight, color: C.forest, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                  <BarChart2 size={14} /> Step 7: Environmental &amp; Social Impact Dashboard
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: C.charcoal, margin: 0 }}>Quantifiable Community Impact</h2>
                <p style={{ fontSize: 13, color: C.olive, marginTop: 4 }}>The complete story: Food Waste → Food Recovery → NGO Matching → Human Impact</p>
              </div>

              {/* Big Metric Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
                {[
                  { title: 'Total Food Rescued', val: `${demoMetrics.foodSavedKg.toLocaleString()} kg`, sub: '100% Edible Surplus Saved' },
                  { title: 'Meals Distributed', val: demoMetrics.mealsDistributed.toLocaleString(), sub: 'Nutritious Servings Provided' },
                  { title: 'CO₂ Emissions Avoided', val: `${demoMetrics.co2ReducedTons} Tons`, sub: 'Direct Landfill Diversion' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: `linear-gradient(135deg, ${C.forest} 0%, #344337 100%)`, padding: 24, borderRadius: 20, color: 'white' }}>
                    <div style={{ fontSize: 12, color: C.olive, fontWeight: 700 }}>{item.title}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, margin: '8px 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.val}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{item.sub}</div>
                  </div>
                ))}
              </div>

              {/* Narrative Story Section */}
              <div style={{ background: C.ivory, padding: 24, borderRadius: 20, border: `1px solid ${C.beige}`, marginBottom: 28 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: C.charcoal, margin: '0 0 14px' }}>The Zestio Impact Model</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAnchor: 'middle' }}>
                  {[
                    { step: '1. Food Waste', desc: 'Surplus detected at commercial kitchens' },
                    { step: '2. Food Recovery', desc: 'AI visual check & thermal verification' },
                    { step: '3. NGO Match', desc: 'Haversine spatial routing to nearby shelters' },
                    { step: '4. Human Impact', desc: 'Dignified meals served to vulnerable families' }
                  ].map((s, i) => (
                    <div key={i} style={{ background: C.white, padding: 16, borderRadius: 14, border: `1px solid ${C.beige}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.forest, marginBottom: 4 }}>{s.step}</div>
                      <div style={{ fontSize: 11, color: C.olive, lineHeight: 1.4 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setFlowStep('overview')}
                  style={{ background: 'transparent', border: `1px solid ${C.beige}`, color: C.charcoal, padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  ← Return to Overview
                </button>

                <button
                  onClick={resetDemo}
                  style={{ background: C.forest, color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RefreshCw size={14} /> Restart Full Walkthrough
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 8: DEMO PROFILE ─── */}
        {flowStep === 'profile' && (
          <div className="anim-fadeUp" style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
            <div style={{ background: C.white, borderRadius: 24, padding: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${C.beige}` }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: C.charcoal, margin: '0 0 16px' }}>Demo User Profile</h2>
              <div style={{ padding: 20, background: C.ivory, borderRadius: 16, border: `1px solid ${C.beige}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.charcoal }}>Name: Demo User</div>
                <div style={{ fontSize: 13, color: C.olive, marginTop: 4 }}>Email: demo@Zestio.demo</div>
                <div style={{ fontSize: 13, color: C.forest, fontWeight: 600, marginTop: 4 }}>Organization: The Grand Spice Hotel &amp; Restaurant</div>
                <div style={{ fontSize: 13, color: C.forest, fontWeight: 600, marginTop: 4 }}>Role: Restaurant Owner / Commercial Donor</div>
                <div style={{ fontSize: 12, color: C.olive, marginTop: 10 }}>FSSAI Registration: #11522001928392 (Verified)</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
