// @ts-nocheck — supabase-js type mismatch with generated Database types
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']
type SavingsGoalInsert = Database['public']['Tables']['savings_goals']['Insert']
type SavingsGoalUpdate = Database['public']['Tables']['savings_goals']['Update']

export type { SavingsGoal }

export class SavingsGoalsService {
    private supabase = createClient()

    async getGoals(userId: string): Promise<SavingsGoal[]> {
        const { data, error } = await this.supabase
            .from('savings_goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data ?? []
    }

    async createGoal(goal: SavingsGoalInsert) {
        const { data, error } = await this.supabase
            .from('savings_goals')
            .insert(goal as any)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateGoal(id: string, updates: SavingsGoalUpdate) {
        const { data, error } = await this.supabase
            .from('savings_goals')
            .update({ ...updates, updated_at: new Date().toISOString() } as any)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async depositToGoal(id: string, amount: number) {
        const { data: goal } = await this.supabase
            .from('savings_goals')
            .select('current_amount')
            .eq('id', id)
            .single()

        if (!goal) throw new Error('Meta no encontrada')

        const newAmount = (goal.current_amount ?? 0) + amount
        return this.updateGoal(id, { current_amount: newAmount })
    }

    async deleteGoal(id: string) {
        const { error } = await this.supabase
            .from('savings_goals')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

export const savingsGoalsService = new SavingsGoalsService()
