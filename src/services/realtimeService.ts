import { supabase } from '../lib/supabase';

type EventCallback = (data: any) => void;

class RealtimeSyncEngine {
  private listeners: Record<string, EventCallback[]> = {};
  private channel: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'Zestio_realtime_event' && e.newValue) {
          try {
            const payload = JSON.parse(e.newValue);
            this.emitLocal(payload.event, payload.data);
          } catch (err) {
            console.error("Failed to parse realtime event", err);
          }
        }
      });
    }
  }

  subscribeUser(userId: string, onUpdate: (newProfile: any) => void) {
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    this.channel = supabase
      .channel(`user-profile-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('[REALTIME UPDATE DETECTED]', payload.new);
          onUpdate(payload.new);
          this.broadcast('profile_updated', payload.new);
        }
      )
      .subscribe();
  }

  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  broadcast(event: string, data: any) {
    this.emitLocal(event, data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('Zestio_realtime_event', JSON.stringify({
        event,
        data,
        timestamp: Date.now()
      }));
    }
  }

  private emitLocal(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const RealtimeService = new RealtimeSyncEngine();
