// @ts-nocheck — supabase-js type mismatch with generated Database types
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Account = Database['public']['Tables']['accounts']['Row']
type AccountInsert = Database['public']['Tables']['accounts']['Insert']
type AccountUpdate = Database['public']['Tables']['accounts']['Update']

export class AccountsService {
    private supabase = createClient()

    async getAccounts(userId: string) {
        const { data, error } = await this.supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    async getAccount(id: string) {
        const { data, error } = await this.supabase
            .from('accounts')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async createAccount(account: AccountInsert) {
        const { data, error } = await this.supabase
            .from('accounts')
            .insert(account as any)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateAccount(id: string, updates: AccountUpdate) {
        const { data, error } = await this.supabase
            .from('accounts')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async deleteAccount(id: string) {
        const { error } = await this.supabase
            .from('accounts')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }

    async getTotalBalance(userId: string): Promise<{ usd: number; cop: number }> {
        const { data, error } = await this.supabase
            .from('accounts')
            .select('balance_usd, balance_cop')
            .eq('user_id', userId)

        if (error) throw error

        const totals = data?.reduce(
            (acc, account) => ({
                usd: acc.usd + account.balance_usd,
                cop: acc.cop + account.balance_cop,
            }),
            { usd: 0, cop: 0 }
        )

        return totals || { usd: 0, cop: 0 }
    }
}

export const accountsService = new AccountsService()
