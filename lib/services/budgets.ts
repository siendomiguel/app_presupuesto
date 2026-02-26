// @ts-nocheck — supabase-js type mismatch with generated Database types
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Budget = Database['public']['Tables']['budgets']['Row']
type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
type BudgetUpdate = Database['public']['Tables']['budgets']['Update']
type BudgetProgress = Database['public']['Views']['budget_progress']['Row']

export class BudgetsService {
    private supabase = createClient()

    async getBudgets(userId: string, period?: 'monthly' | 'weekly' | 'yearly') {
        let query = this.supabase
            .from('budgets')
            .select(`
        *,
        category:categories(*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (period) {
            query = query.eq('period', period)
        }

        const { data, error } = await query

        if (error) throw error
        return data
    }

    async getBudget(id: string) {
        const { data, error } = await this.supabase
            .from('budgets')
            .select(`
        *,
        category:categories(*)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async getBudgetProgress(userId: string) {
        const { data, error } = await this.supabase
            .from('budget_progress')
            .select('*')
            .eq('user_id', userId)

        if (error) throw error
        return data as BudgetProgress[]
    }

    async getCurrentMonthBudgets(userId: string) {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        const { data, error } = await this.supabase
            .from('budget_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('period', 'monthly')
            .lte('start_date', endOfMonth)
            .or(`end_date.is.null,end_date.gte.${startOfMonth}`)

        if (error) throw error
        return data as BudgetProgress[]
    }

    async createBudget(budget: BudgetInsert) {
        const { data, error } = await this.supabase
            .from('budgets')
            .insert(budget as any)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateBudget(id: string, updates: BudgetUpdate) {
        const { data, error } = await this.supabase
            .from('budgets')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async deleteBudget(id: string) {
        const { error } = await this.supabase
            .from('budgets')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }

    // Helper to check if budget is exceeded
    isOverBudget(progress: BudgetProgress): { usd: boolean; cop: boolean } {
        return {
            usd: progress.amount_usd > 0 && progress.spent_usd > progress.amount_usd,
            cop: progress.amount_cop > 0 && progress.spent_cop > progress.amount_cop,
        }
    }

    // Helper to get remaining budget
    getRemainingBudget(progress: BudgetProgress): { usd: number; cop: number } {
        return {
            usd: Math.max(0, progress.amount_usd - progress.spent_usd),
            cop: Math.max(0, progress.amount_cop - progress.spent_cop),
        }
    }
}

export const budgetsService = new BudgetsService()
