import { supabase } from '../db.js';
export class DonationService {
    async getDonations() {
        const { data, error } = await supabase
            .from('donations')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        if (error)
            return [];
        return data;
    }
    async addDonation(item) {
        const { data, error } = await supabase
            .from('donations')
            .insert({
            ...item,
            status: item.status || 'PENDING',
            score: item.score || 85
        })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async updateDonation(id, updates) {
        const { data, error } = await supabase
            .from('donations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async softDeleteDonation(id) {
        const { error } = await supabase
            .from('donations')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        return !error;
    }
}
export const donationService = new DonationService();
