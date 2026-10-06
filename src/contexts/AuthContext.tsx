import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeService } from '../services/realtimeService';
import { IS_DEMO_MODE_CONFIGURED, MOCK_DEMO_USER } from '../config/demoConfig';
import { useDemo } from './DemoContext';

// Production State-Based User Schema
export interface User {
  id: string;
  email: string;
  name?: string;
  permissionGroup: string;
  status: string; // Backward compatibility
  mfaVerified: boolean;
  permissions: string[];
  
  // State-Based Onboarding Fields
  email_verified: boolean;
  role: 'Restaurant' | 'NGO' | 'Volunteer' | 'Administrator';
  profile_completed: boolean;
  documents_uploaded: boolean;
  approval_status: 'PENDING' | 'DOCUMENT_REVIEW' | 'APPROVED' | 'REJECTED' | 'MORE_DOCS_REQUESTED' | 'SUSPENDED';
  onboarding_completed: boolean;
  rejection_reason?: string;
  more_docs_notes?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  verifyMFA: (otp: string) => Promise<boolean>;
  updateUserState: (updates: Partial<User>) => void;
  isResettingPassword: boolean;
  clearResetPasswordMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Restore persistent state on startup
  useEffect(() => {
    const syncProfile = async (session: any) => {
      if (!session) return;
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && !error) {
          const mappedUser: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name || profile.org_name || 'Zestio Partner',
            permissionGroup: profile.permission_group || 'Restaurant Owner',
            status: profile.approval_status || 'APPROVED',
            mfaVerified: profile.mfa_verified || (profile.role === 'Administrator'),
            permissions: [],
            email_verified: profile.email_verified || !!session.user.email_confirmed_at,
            role: profile.role as any,
            profile_completed: profile.profile_completed,
            documents_uploaded: profile.documents_uploaded,
            approval_status: profile.approval_status as any,
            onboarding_completed: profile.onboarding_completed,
            rejection_reason: profile.rejection_reason,
            more_docs_notes: profile.more_docs_notes
          };
          setUser(mappedUser);
        } else {
          // Fallback if profile doesn't exist yet (e.g. before trigger fires)
          const metadata = session.user.user_metadata || {};
          const role = metadata.role || 'Restaurant';
          const approval_status = metadata.status || 'DOCUMENT_REVIEW';
          
          const mappedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: metadata.name || 'ResQ Partner',
            permissionGroup: role === 'Restaurant' ? 'Restaurant Owner' : role === 'NGO' ? 'NGO Admin' : role === 'Volunteer' ? 'Volunteer' : 'Super Admin',
            status: approval_status,
            mfaVerified: metadata.mfaVerified ?? (role === 'Administrator'),
            permissions: [],
            email_verified: !!session.user.email_confirmed_at,
            role: role as any,
            profile_completed: metadata.profile_completed ?? false,
            documents_uploaded: metadata.documents_uploaded ?? (role === 'Volunteer' || role === 'Administrator'),
            approval_status: approval_status as any,
            onboarding_completed: metadata.onboarding_completed ?? (role === 'Volunteer')
          };
          setUser(mappedUser);
        }
      } catch (e) {
        console.error("Failed to sync profile from Supabase", e);
      }
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        syncProfile(session);
      } else {
        if (IS_DEMO_MODE_CONFIGURED) {
          setUser(MOCK_DEMO_USER);
        }
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResettingPassword(true);
      }
      if (event === 'SIGNED_OUT') {
        if (IS_DEMO_MODE_CONFIGURED) {
          setUser(MOCK_DEMO_USER);
        } else {
          setUser(null);
        }
      } else if (session) {
        syncProfile(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let profileSubscription: any = null;

    if (user?.id) {
      profileSubscription = supabase
        .channel(`public:profiles:id=eq.${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            const data = payload.new;
            setUser(current => {
              if (!current) return null;
              const updated: User = {
                ...current,
                approval_status: data.approval_status,
                status: data.approval_status,
                onboarding_completed: data.onboarding_completed,
                rejection_reason: data.rejection_reason || current.rejection_reason,
                more_docs_notes: data.more_docs_notes || current.more_docs_notes,
                email_verified: data.email_verified,
                profile_completed: data.profile_completed,
                documents_uploaded: data.documents_uploaded
              };
              return updated;
            });
          }
        )
        .subscribe();
    }

    return () => {
      if (profileSubscription) supabase.removeChannel(profileSubscription);
    };
  }, [user?.id]);

  const login = (token: string, userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const verifyMFA = async (otp: string): Promise<boolean> => {
    if (otp === '123456') {
      if (user) {
        const updated = { ...user, mfaVerified: true };
        setUser(updated);
      }
      return true;
    }
    return false;
  };

  const updateUserState = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
    }
  };

  const clearResetPasswordMode = () => {
    setIsResettingPassword(false);
  };

  let effectiveUser = user;
  let customLogout = logout;
  
  try {
    const { isDemoActive, activeDemoAccount, activeUser, logoutDemoUser } = useDemo();
    if (isDemoActive) {
      if (activeDemoAccount === null) {
        effectiveUser = null;
      } else {
        effectiveUser = activeUser;
      }
      customLogout = async () => {
        logoutDemoUser();
      };
    }
  } catch (e) {
    // DemoContext not present yet
  }

  return (
    <AuthContext.Provider value={{ 
      user: effectiveUser, 
      isLoading, 
      login, 
      logout: customLogout, 
      verifyMFA, 
      updateUserState,
      isResettingPassword,
      clearResetPasswordMode 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
