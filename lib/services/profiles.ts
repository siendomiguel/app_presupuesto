// @ts-nocheck — supabase-js type mismatch with generated Database types
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class ProfilesService {
    private supabase = createClient()

    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data
    }

    async updateProfile(userId: string, updates: ProfileUpdate) {
        const { data, error } = await this.supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() } as any)
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

export const profilesService = new ProfilesService()
