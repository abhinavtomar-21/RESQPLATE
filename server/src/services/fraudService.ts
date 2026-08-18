import { supabase } from '../db.js';

export class FraudService {
  async getAlerts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('fraud_alerts')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data;
  }

  async resolveAlert(id: string, action: 'flag' | 'ignore'): Promise<any> {
    const status = action === 'flag' ? 'Investigating' : 'Unresolved';
    const { data, error } = await supabase
      .from('fraud_alerts')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const fraudService = new FraudService();

