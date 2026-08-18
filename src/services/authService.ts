import { supabase } from '../lib/supabase';
import { AuthError } from '@supabase/supabase-js';
import { IS_DEMO_MODE_CONFIGURED, MOCK_DEMO_USER } from '../config/demoConfig';

type AuthEvent = 'Sign In' | 'Sign Up' | 'Sign Out' | 'Reset Password Request' | 'Password Changed' | 'Email Verification Resent';

class AuthService {
  private async logAudit(event: AuthEvent, email?: string, details?: any) {
    console.log(`[AUDIT LOG] [${new Date().toISOString()}] Event: ${event} | User: ${email || 'Unknown'} | Details:`, details || 'None');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await supabase.from('audit_logs').insert({
          action: event,
          entity: 'auth',
          entity_id: userId,
          performed_by: userId,
          new_value: details || {}
        });
      }
    } catch (err) {
      console.error("Failed to persist audit log", err);
    }
  }

  mapError(error: AuthError | null): string {
    if (!error) return 'An unexpected error occurred.';
    
    // Log the raw error internally for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error("[AuthService] Raw error:", error);
    }

    // Check for the literal string "{}" which Supabase GoTrue returns when it receives an empty JSON error body
    if (error.message === '{}' || error.message === '[object Object]') {
      return 'Registration failed due to a server validation error.';
    }

    switch (error.message) {
      case 'Invalid login credentials':
        return 'Incorrect email or password.';
      case 'Email not confirmed':
        return 'Please verify your email before signing in.';
      case 'Too many requests':
      case 'over_email_send_rate_limit':
        return 'Too many attempts. Please try again later.';
      case 'Password should be at least 6 characters.':
      case 'weak_password':
        return 'Your password does not meet the required strength.';
      case 'Token has expired or is invalid':
        return 'Your reset link has expired. Request a new one.';
      case 'User already registered':
        return 'An account with this email already exists.';
      default:
        return error.message;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (IS_DEMO_MODE_CONFIGURED || error.message?.includes('Failed to fetch')) {
          console.warn('[AuthService] Supabase network offline or Demo Mode active. Logging in with Demo User.');
          return {
            user: MOCK_DEMO_USER as any,
            session: { access_token: 'demo-token-123', user: MOCK_DEMO_USER as any } as any
          };
        }
        this.logAudit('Sign In', email, { success: false, error: error.message });
        throw new Error(this.mapError(error));
      }
      
      this.logAudit('Sign In', email, { success: true });
      return data;
    } catch (err: any) {
      if (IS_DEMO_MODE_CONFIGURED || err.message?.includes('Failed to fetch')) {
        console.warn('[AuthService] Supabase network offline or Demo Mode active. Logging in with Demo User.');
        return {
          user: MOCK_DEMO_USER as any,
          session: { access_token: 'demo-token-123', user: MOCK_DEMO_USER as any } as any
        };
      }
      throw err;
    }
  }

  async signUp(email: string, password: string, options?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options 
      });
      
      if (error) {
        if (IS_DEMO_MODE_CONFIGURED || error.message?.includes('Failed to fetch')) {
          console.warn('[AuthService] Supabase network offline or Demo Mode active. Completing Demo Signup.');
          const role = options?.data?.role || 'Restaurant';
          return {
            user: { ...MOCK_DEMO_USER, email, role } as any,
            session: { access_token: 'demo-token-123', user: { ...MOCK_DEMO_USER, email, role } } as any
          };
        }
        this.logAudit('Sign Up', email, { success: false, error: error.message });
        throw new Error(this.mapError(error));
      }
      
      this.logAudit('Sign Up', email, { success: true });
      return data;
    } catch (err: any) {
      if (IS_DEMO_MODE_CONFIGURED || err.message?.includes('Failed to fetch')) {
        console.warn('[AuthService] Supabase network offline or Demo Mode active. Completing Demo Signup.');
        const role = options?.data?.role || 'Restaurant';
        return {
          user: { ...MOCK_DEMO_USER, email, role } as any,
          session: { access_token: 'demo-token-123', user: { ...MOCK_DEMO_USER, email, role } } as any
        };
      }
      throw err;
    }
  }

  async signOut() {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(this.mapError(error));
    }
    
    this.logAudit('Sign Out', email, { success: true });
  }

  async resetPassword(email: string, redirectTo: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    
    if (error) {
      this.logAudit('Reset Password Request', email, { success: false, error: error.message });
      throw new Error(this.mapError(error));
    }
    
    this.logAudit('Reset Password Request', email, { success: true });
  }

  async resendVerification(email: string, redirectTo?: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    if (error) {
      this.logAudit('Email Verification Resent', email, { success: false, error: error.message });
      throw new Error(this.mapError(error));
    }
    
    this.logAudit('Email Verification Resent', email, { success: true });
  }

  async updatePassword(password: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;

    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      this.logAudit('Password Changed', email, { success: false, error: error.message });
      throw new Error(this.mapError(error));
    }
    
    this.logAudit('Password Changed', email, { success: true });
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(this.mapError(error));
    return user;
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(this.mapError(error));
    return session;
  }
}

export const authService = new AuthService();
