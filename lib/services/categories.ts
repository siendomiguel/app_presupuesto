import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export class CategoriesService {
    private supabase = createClient()

    async getCategories(userId: string, type?: 'income' | 'expense') {
        let query = this.supabase
            .from('categories')
            .select('*')
            .eq('user_id', userId)
            .order('name')

        if (type) {
            query = query.eq('type', type)
        }

        const { data, error } = await query

        if (error) throw error
        return data
    }

    async getCategory(id: string) {
        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async createCategory(category: CategoryInsert) {
        const { data, error } = await this.supabase
            .from('categories')
            .insert(category)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateCategory(id: string, updates: CategoryUpdate) {
        const { data, error } = await this.supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async deleteCategory(id: string) {
        const { error } = await this.supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }

    async getCategorySpending(userId: string, startDate: string, endDate: string) {
        const { data, error } = await this.supabase
            .from('transactions')
            .select('category_id, amount, currency, categories(name, color)')
            .eq('user_id', userId)
            .eq('type', 'expense')
            .gte('date', startDate)
            .lte('date', endDate)
            .not('category_id', 'is', null)

        if (error) throw error

        // Aggregate by category
        const categoryMap = new Map<string, { name: string; color: string; usd: number; cop: number }>()

        data?.forEach((t: any) => {
            if (!t.categories) return

            const key = t.category_id
            if (!categoryMap.has(key)) {
                categoryMap.set(key, {
                    name: t.categories.name,
                    color: t.categories.color,
                    usd: 0,
                    cop: 0,
                })
            }

            const category = categoryMap.get(key)!
            if (t.currency === 'USD') {
                category.usd += t.amount
            } else {
                category.cop += t.amount
            }
        })

        return Array.from(categoryMap.values())
    }
}

export const categoriesService = new CategoriesService()
