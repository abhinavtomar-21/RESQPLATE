import React, { useState } from 'react';
import { C } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { ZestioLogo, Btn } from '../shared/SharedComponents';
import { authService } from '../../services/authService';
import { 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  CheckCircle2, 
  UploadCloud, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  RefreshCw, 
  Lock, 
  User, 
  Phone, 
  Building, 
  Clock, 
  MapPin, 
  Award,
  AlertCircle
} from 'lucide-react';

type Step = 'CHOOSE' | 'SIGNUP' | 'VERIFY_EMAIL' | 'COMPLETE_PROFILE' | 'DOCUMENT_UPLOAD' | 'WAITING_APPROVAL';

export function RegistrationFlow({ 
  onComplete, 
  onCancel, 
  onOpenAdminPortal,
  initialStep = 'CHOOSE',
  initialRole = 'restaurant'
}: { 
  onComplete: () => void; 
  onCancel: () => void; 
  onOpenAdminPortal?: () => void;
  initialStep?: Step;
  initialRole?: string;
}) {
  const [step, setStep] = useState<Step>(initialStep);
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    orgName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: true,
    // Profile Completion Fields
    gstNo: '',
    foodLicense: '',
    address: '',
    operatingHours: '9:00 AM - 10:00 PM',
    ngoRegNo: '',
    ngoType: 'Food Bank & Rescue',
    emergencyContact: '',
    vehicleType: 'Two Wheeler (Bike/Scooter)',
    // Document Upload State
    docUploaded: false,
    docFileName: '',
    docFileSize: '',
    uploadProgress: 0
  });

  const updateForm = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  // Helper for role metadata
  const getRoleMeta = (role: string) => {
    switch (role) {
      case 'restaurant':
        return { title: 'Restaurant / Hotel', group: 'Restaurant Owner', color: C.forest, icon: '🏛' };
      case 'ngo':
        return { title: 'NGO / Organization', group: 'NGO Admin', color: C.sage, icon: '🤝' };
      case 'volunteer':
        return { title: 'Volunteer', group: 'Volunteer', color: '#6B48C8', icon: '🚴' };
      default:
        return { title: 'User', group: 'Volunteer', color: C.forest, icon: '👤' };
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setStep('SIGNUP');
  };

  const hasMinLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[@$!%*?&]/.test(formData.password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg("Please ensure your password meets all requirements.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const roleMeta = getRoleMeta(selectedRole);
    const roleString = selectedRole === 'restaurant' ? 'Restaurant' : selectedRole === 'ngo' ? 'NGO' : 'Volunteer';

    try {
      await authService.signUp(formData.email.trim(), formData.password, {
        data: {
          role: roleString,
          name: formData.fullName || formData.orgName,
          orgName: formData.orgName,
          phone: formData.phone
        },
        emailRedirectTo: `${window.location.origin}/auth/email-confirmed`
      });

      // We removed the backend fetch since we are migrating fully to Supabase
      setStep('VERIFY_EMAIL');
    } catch (err: any) {
      console.error("Sign Up Error:", err);
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    try {
      await authService.resendVerification(formData.email.trim(), `${window.location.origin}/auth/email-confirmed`);
      setResendCooldown(60);
      alert("Verification email resent! Please check your inbox.");
    } catch (err: any) {
      alert("Error sending email: " + err.message);
    }
  };

  const simulateDocumentUpload = () => {
    setLoading(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      updateForm({ uploadProgress: prog });
      if (prog >= 100) {
        clearInterval(interval);
        setLoading(false);
        updateForm({
          docUploaded: true,
          docFileName: `${selectedRole.toUpperCase()}_Verification_License.pdf`,
          docFileSize: '2.4 MB'
        });
      }
    }, 200);
  };

  const handleFinalSubmit = async () => {
    const isVol = selectedRole === 'volunteer';
    const initialStatus = isVol ? 'APPROVED' : 'DOCUMENT_REVIEW';
    const roleString = selectedRole === 'restaurant' ? 'Restaurant' : selectedRole === 'ngo' ? 'NGO' : 'Volunteer';
    
    let activeUserId = 'usr_' + Date.now();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        activeUserId = userId;
        if (!isVol) {
          // Update profile in database directly using Supabase
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              profile_completed: true,
              documents_uploaded: true,
              approval_status: 'DOCUMENT_REVIEW',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (profileError) {
             console.error("Failed to update profile", profileError);
          } else {
             // Create verification request
             const { error: vrError } = await supabase
               .from('verification_requests')
               .insert({
                 restaurant_id: userId,
                 restaurant_name: formData.orgName || formData.fullName,
                 status: 'PENDING',
                 documents: {
                   url: formData.docFileName ? formData.docFileName : null
                 }
               });
               
             if (vrError) console.error("Failed to create verification request", vrError);
          }
        }
      }
    } catch (e) {
      console.error("Failed to submit verification", e);
    }
    
    onComplete();
  };

  return (
    <div style={{ minHeight: '100vh', background: C.ivory, fontFamily: "'Inter', sans-serif", color: C.charcoal, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      
      {/* Container matching landing page max-width */}
      <div style={{ maxWidth: 840, width: '100%', margin: '0 auto' }}>
        
        {/* Header Logo Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ cursor: 'pointer' }} onClick={onCancel}>
            <ZestioLogo size={44} />
          </div>
        </div>

        {/* STEP 1: ROLE CHOOSER (EXACT MATCH TO LANDING PAGE) */}
        {step === 'CHOOSE' && (
          <div className="anim-fadeUp">
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <h1 style={{ fontSize: 38, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Who are you joining as?
              </h1>
              <p style={{ fontSize: 16, color: C.olive, fontWeight: 500 }}>
                Choose your role to enter your dedicated dashboard
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              {[
                { id: 'restaurant', title: 'Restaurant / Hotel', sub: 'Donate surplus food', icon: '🏛', desc: 'Bakeries, hotels, college messes — turn waste into impact.', color: C.forest },
                { id: 'ngo', title: 'NGO / Organization', sub: 'Receive & distribute food', icon: '🤝', desc: 'Accept nearby donations, manage inventory, track impact.', color: C.sage },
                { id: 'volunteer', title: 'Volunteer', sub: 'Pick up & deliver', icon: '🚴', desc: 'Earn badges, certificates, and leaderboard glory.', color: '#6B48C8' }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="btn-press"
                  style={{
                    background: C.white,
                    borderRadius: 24,
                    padding: '32px 24px',
                    border: '1px solid rgba(122,143,120,0.18)',
                    cursor: 'pointer',
                    textAlign: 'left' as const,
                    boxShadow: '0 4px 24px rgba(46,52,48,0.06)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = `2px solid ${role.color}`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(46,52,48,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(122,143,120,0.18)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(46,52,48,0.06)';
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 16 }}>{role.icon}</div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: C.charcoal, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {role.title}
                  </h3>
                  <p style={{ fontSize: 13, fontWeight: 700, color: role.color, marginBottom: 10 }}>{role.sub}</p>
                  <p style={{ fontSize: 13, color: '#6B7C6E', lineHeight: 1.6 }}>{role.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 22, color: role.color, fontSize: 13, fontWeight: 700 }}>
                    Enter portal <ArrowRight size={15} />
                  </div>
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <button
                onClick={onCancel}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.olive, fontSize: 14, fontWeight: 600 }}
              >
                ← Back to landing page
              </button>

            </div>
          </div>
        )}

        {/* STEP 2: SIGN UP FORM */}
        {step === 'SIGNUP' && (
          <div className="anim-fadeUp" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ background: C.white, borderRadius: 28, padding: '40px 36px', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid rgba(122,143,120,0.15)' }}>
              
              <button 
                onClick={() => setStep('CHOOSE')} 
                style={{ background: 'none', border: 'none', color: C.olive, cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
              >
                <ArrowLeft size={16} /> Back to Role Selection
              </button>

              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.sageLight, color: C.forest, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                  <span>{getRoleMeta(selectedRole).icon}</span>
                  <span>Joining as {getRoleMeta(selectedRole).title}</span>
                </div>
                <h2 style={{ fontSize: 30, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Create your account
                </h2>
                <p style={{ fontSize: 14, color: '#6B7C6E', marginTop: 4 }}>
                  Enter your information to access your dedicated portal.
                </p>
              </div>

              {errorMsg && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={iconStyle} />
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Rahul Sharma" 
                      value={formData.fullName} 
                      onChange={e => updateForm({ fullName: e.target.value })} 
                      style={inputStyle} 
                    />
                  </div>
                </div>

                {(selectedRole === 'restaurant' || selectedRole === 'ngo') && (
                  <div>
                    <label style={labelStyle}>{selectedRole === 'restaurant' ? 'Establishment / Restaurant Name' : 'Organization Name'}</label>
                    <div style={{ position: 'relative' }}>
                      <Building size={18} style={iconStyle} />
                      <input 
                        type="text" 
                        required 
                        placeholder={selectedRole === 'restaurant' ? 'e.g. Royal Harvest Bistro' : 'e.g. Annapurna Relief Foundation'} 
                        value={formData.orgName} 
                        onChange={e => updateForm({ orgName: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={iconStyle} />
                    <input 
                      type="email" 
                      required 
                      placeholder="name@company.com" 
                      value={formData.email} 
                      onChange={e => updateForm({ email: e.target.value })} 
                      style={inputStyle} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={iconStyle} />
                      <input 
                        type="password" 
                        required 
                        placeholder="••••••••" 
                        value={formData.password} 
                        onChange={e => updateForm({ password: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={iconStyle} />
                      <input 
                        type="password" 
                        required 
                        placeholder="••••••••" 
                        value={formData.confirmPassword} 
                        onChange={e => updateForm({ confirmPassword: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: C.beige, padding: 16, borderRadius: 16, border: '1px solid rgba(122,143,120,0.15)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.charcoal, marginBottom: 8, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Password Policy</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    <div style={{ color: hasMinLength ? C.forest : C.olive, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: hasMinLength ? 600 : 500 }}>
                      {hasMinLength ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 8+ characters
                    </div>
                    <div style={{ color: hasUpper ? C.forest : C.olive, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: hasUpper ? 600 : 500 }}>
                      {hasUpper ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 1 Uppercase
                    </div>
                    <div style={{ color: hasLower ? C.forest : C.olive, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: hasLower ? 600 : 500 }}>
                      {hasLower ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 1 Lowercase
                    </div>
                    <div style={{ color: hasNumber ? C.forest : C.olive, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: hasNumber ? 600 : 500 }}>
                      {hasNumber ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 1 Number
                    </div>
                    <div style={{ color: hasSpecial ? C.forest : C.olive, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: hasSpecial ? 600 : 500 }}>
                      {hasSpecial ? <CheckCircle2 size={12} /> : <span style={{ width: 4, height: 4, borderRadius: 2, background: C.olive, margin: 4 }} />} 1 Special Char
                    </div>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={iconStyle} />
                    <input 
                      type="tel" 
                      required 
                      placeholder="+91 98765 43210" 
                      value={formData.phone} 
                      onChange={e => updateForm({ phone: e.target.value })} 
                      style={inputStyle} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={formData.agreeTerms} 
                    onChange={e => updateForm({ agreeTerms: e.target.checked })} 
                    style={{ width: 18, height: 18, accentColor: C.forest, cursor: 'pointer' }} 
                  />
                  <label htmlFor="terms" style={{ fontSize: 13, color: '#5A6B5C', cursor: 'pointer' }}>
                    I agree to Zestio <span style={{ color: C.forest, fontWeight: 600 }}>Terms of Service</span> & <span style={{ color: C.forest, fontWeight: 600 }}>Privacy Policy</span>
                  </label>
                </div>

                <div style={{ marginTop: 12 }}>
                  <Btn variant="primary" size="lg" className="w-full" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} />
                  </Btn>
                </div>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(122,143,120,0.12)' }}>
                <span style={{ fontSize: 14, color: '#6B7C6E' }}>Already have an account? </span>
                <button onClick={() => setStep('CHOOSE')} style={{ background: 'none', border: 'none', color: C.forest, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Sign In
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: EMAIL VERIFICATION */}
        {step === 'VERIFY_EMAIL' && (
          <div className="anim-fadeUp" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div style={{ background: C.white, borderRadius: 28, padding: '44px 36px', textAlign: 'center', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid rgba(122,143,120,0.15)' }}>
              
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.sageLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: C.forest, marginBottom: 24 }}>
                <Mail size={36} />
              </div>

              <h2 style={{ fontSize: 32, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Verify your email
              </h2>

              <p style={{ fontSize: 15, color: '#6B7C6E', lineHeight: 1.6, marginBottom: 8 }}>
                We've sent a verification link to:
              </p>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.forest, background: C.sageLight, padding: '8px 18px', borderRadius: 999, display: 'inline-block', marginBottom: 32 }}>
                {formData.email || 'your-email@domain.com'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                <a 
                  href="https://mail.google.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ background: C.forest, color: 'white', textDecoration: 'none', padding: '14px 24px', borderRadius: 16, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  Open Gmail <ExternalLink size={16} />
                </a>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button 
                    onClick={handleResendEmail}
                    disabled={resendCooldown > 0}
                    style={{ background: resendCooldown > 0 ? C.sageLight : C.beige, border: 'none', color: resendCooldown > 0 ? C.olive : C.charcoal, padding: '12px 20px', borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}
                  >
                    <RefreshCw size={15} /> {resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Resend Email'}
                  </button>
                  <button 
                    onClick={() => setStep('SIGNUP')}
                    style={{ background: 'transparent', border: '1px solid rgba(122,143,120,0.3)', color: C.olive, padding: '12px 20px', borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: 'pointer', flex: 1 }}
                  >
                    Change Email
                  </button>
                </div>
              </div>

              <div style={{ paddingTop: 20, borderTop: '1px solid rgba(122,143,120,0.12)' }}>
                <button 
                  onClick={() => setStep('COMPLETE_PROFILE')} 
                  style={{ background: 'none', border: 'none', color: C.forest, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  Email Verified? Continue to Profile <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 4: COMPLETE PROFILE */}
        {step === 'COMPLETE_PROFILE' && (
          <div className="anim-fadeUp" style={{ maxWidth: 620, margin: '0 auto' }}>
            <div style={{ background: C.white, borderRadius: 28, padding: '40px 36px', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid rgba(122,143,120,0.15)' }}>
              
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.sage, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 3 of 4</span>
                <h2 style={{ fontSize: 30, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Complete your profile
                </h2>
                <p style={{ fontSize: 14, color: '#6B7C6E', marginTop: 4 }}>
                  Provide entity details for safety compliance and routing.
                </p>
              </div>

              {selectedRole === 'restaurant' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={labelStyle}>Business / Establishment Name</label>
                    <input type="text" value={formData.orgName} onChange={e => updateForm({ orgName: e.target.value })} style={inputStyleSimple} placeholder="Grand Bistro Cafe" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>GST Number (Optional)</label>
                      <input type="text" value={formData.gstNo} onChange={e => updateForm({ gstNo: e.target.value })} style={inputStyleSimple} placeholder="22AAAAA0000A1Z5" />
                    </div>
                    <div>
                      <label style={labelStyle}>Food License / FSSAI No</label>
                      <input type="text" value={formData.foodLicense} onChange={e => updateForm({ foodLicense: e.target.value })} style={inputStyleSimple} placeholder="FSSAI-1002001100" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Pickup Address & Google Maps Location</label>
                    <input type="text" value={formData.address} onChange={e => updateForm({ address: e.target.value })} style={inputStyleSimple} placeholder="123 Commercial Street, Indiranagar, Bengaluru" />
                  </div>
                  <div>
                    <label style={labelStyle}>Surplus Food Pickup Hours</label>
                    <input type="text" value={formData.operatingHours} onChange={e => updateForm({ operatingHours: e.target.value })} style={inputStyleSimple} placeholder="9:00 PM - 11:30 PM" />
                  </div>
                </div>
              )}

              {selectedRole === 'ngo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={labelStyle}>NGO Registration Number</label>
                    <input type="text" value={formData.ngoRegNo} onChange={e => updateForm({ ngoRegNo: e.target.value })} style={inputStyleSimple} placeholder="REG/NGO/2026/984" />
                  </div>
                  <div>
                    <label style={labelStyle}>Organization Type</label>
                    <select value={formData.ngoType} onChange={e => updateForm({ ngoType: e.target.value })} style={inputStyleSimple}>
                      <option value="Food Bank & Rescue">Food Bank & Rescue</option>
                      <option value="Orphanage & Children Home">Orphanage & Children Home</option>
                      <option value="Shelter Home">Shelter Home</option>
                      <option value="Community Kitchen">Community Kitchen</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Distribution Center Address</label>
                    <input type="text" value={formData.address} onChange={e => updateForm({ address: e.target.value })} style={inputStyleSimple} placeholder="45 Relief Road, Koramangala" />
                  </div>
                </div>
              )}

              {selectedRole === 'volunteer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={labelStyle}>Emergency Contact Number</label>
                    <input type="tel" value={formData.emergencyContact} onChange={e => updateForm({ emergencyContact: e.target.value })} style={inputStyleSimple} placeholder="+91 98765 00000" />
                  </div>
                  <div>
                    <label style={labelStyle}>Preferred Mode of Transport</label>
                    <select value={formData.vehicleType} onChange={e => updateForm({ vehicleType: e.target.value })} style={inputStyleSimple}>
                      <option value="Two Wheeler (Bike/Scooter)">Two Wheeler (Bike/Scooter)</option>
                      <option value="Four Wheeler (Car/Van)">Four Wheeler (Car/Van)</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="On Foot">On Foot</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 28 }}>
                <Btn 
                  variant="primary" 
                  size="lg" 
                  onClick={() => setStep('DOCUMENT_UPLOAD')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Continue to Verification Documents <ArrowRight size={16} />
                </Btn>
              </div>

            </div>
          </div>
        )}

        {/* STEP 5: DOCUMENT UPLOAD */}
        {step === 'DOCUMENT_UPLOAD' && (
          <div className="anim-fadeUp" style={{ maxWidth: 620, margin: '0 auto' }}>
            <div style={{ background: C.white, borderRadius: 28, padding: '40px 36px', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid rgba(122,143,120,0.15)' }}>
              
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.sage, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 4 of 4</span>
                <h2 style={{ fontSize: 30, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Upload Verification Documents
                </h2>
                <p style={{ fontSize: 14, color: '#6B7C6E', marginTop: 4 }}>
                  Please upload your official {selectedRole === 'restaurant' ? 'Health License / FSSAI Certificate' : 'NGO Registration Certificate'}.
                </p>
              </div>

              {/* Upload Card */}
              <input 
                type="file" 
                id="file-upload" 
                style={{ display: 'none' }} 
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    simulateDocumentUpload();
                  }
                }} 
              />
              <div 
                onClick={() => document.getElementById('file-upload')?.click()}
                style={{
                  border: `2px dashed ${formData.docUploaded ? C.forest : C.sage}`,
                  borderRadius: 20,
                  padding: 36,
                  textAlign: 'center',
                  background: formData.docUploaded ? C.sageLight : C.ivory,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: 24
                }}
              >
                {!formData.docUploaded && formData.uploadProgress === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                      <UploadCloud size={28} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal }}>Drag &amp; drop document or click to browse</div>
                      <div style={{ fontSize: 13, color: C.olive, marginTop: 4 }}>Supports PDF, PNG, JPG (Max 10MB)</div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div style={{ padding: '10px 0' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.forest, marginBottom: 10 }}>Uploading Document ({formData.uploadProgress}%)...</div>
                    <div style={{ height: 8, background: '#DDD', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${formData.uploadProgress}%`, height: '100%', background: C.forest, transition: 'width 0.2s' }} />
                    </div>
                  </div>
                )}

                {formData.docUploaded && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: C.forest, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>{formData.docFileName}</div>
                      <div style={{ fontSize: 12, color: C.forest, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <CheckCircle2 size={14} /> Ready for Compliance Review ({formData.docFileSize})
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Btn 
                variant="primary" 
                size="lg" 
                disabled={!formData.docUploaded || loading} 
                onClick={() => setStep('WAITING_APPROVAL')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ShieldCheck size={18} /> Submit Application for Approval
              </Btn>

            </div>
          </div>
        )}

        {/* STEP 6: WAITING FOR ADMIN APPROVAL */}
        {step === 'WAITING_APPROVAL' && (
          <div className="anim-fadeUp" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ background: C.white, borderRadius: 28, padding: '44px 36px', textAlign: 'center', boxShadow: '0 12px 48px rgba(46,52,48,0.08)', border: '1px solid rgba(122,143,120,0.15)' }}>
              
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.sageLight, color: C.forest, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: 32, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Application Submitted!
              </h2>

              <p style={{ fontSize: 15, color: '#6B7C6E', lineHeight: 1.6, marginBottom: 24 }}>
                Thank you for joining Zestio. Your compliance documents are under review by our audit team.
              </p>

              <div style={{ background: C.sageLight, borderRadius: 16, padding: '16px 20px', textAlign: 'left', marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.forest, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} /> Estimated Review Time: 1 - 2 Hours
                </div>
                <div style={{ fontSize: 13, color: '#5A6B5C', lineHeight: 1.5 }}>
                  You will receive an email confirmation at <strong style={{ color: C.charcoal }}>{formData.email || 'your registered email'}</strong> once approved.
                </div>
              </div>

              <Btn variant="primary" size="lg" onClick={handleFinalSubmit} style={{ width: '100%', justifyContent: 'center' }}>
                Proceed to Dashboard <ArrowRight size={16} />
              </Btn>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: C.charcoal,
  marginBottom: 6,
  letterSpacing: '0.04em',
  textTransform: 'uppercase'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px 13px 44px',
  borderRadius: 14,
  border: '1px solid rgba(122,143,120,0.25)',
  background: C.ivory,
  fontSize: 14,
  fontWeight: 500,
  color: C.charcoal,
  outline: 'none',
  fontFamily: "'Inter', sans-serif"
};

const inputStyleSimple: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 14,
  border: '1px solid rgba(122,143,120,0.25)',
  background: C.ivory,
  fontSize: 14,
  fontWeight: 500,
  color: C.charcoal,
  outline: 'none',
  fontFamily: "'Inter', sans-serif"
};

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: 14,
  top: 15,
  color: C.olive
};
