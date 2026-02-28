// @ts-nocheck — supabase-js type mismatch with generated Database types
import { createClient } from '@/lib/supabase/client'

export class CategorySuggestionService {
    private supabase = createClient()

    async suggestCategory(
        userId: string,
        description: string,
        type: 'income' | 'expense' | 'transfer'
    ): Promise<{ categoryId: string; categoryName: string } | null> {
        if (!description || description.length < 2) return null

        const descLower = description.toLowerCase().trim()

        // Search past transactions with similar description
        const { data, error } = await this.supabase
            .from('transactions')
            .select('category_id, description, category:categories(id, name)')
            .eq('user_id', userId)
            .eq('type', type)
            .not('category_id', 'is', null)
            .order('date', { ascending: false })
            .limit(200)

        if (error || !data || data.length === 0) return null

        // Count category occurrences for matching descriptions
        const categoryCounts = new Map<string, { count: number; name: string }>()

        for (const tx of data) {
            const txDesc = tx.description.toLowerCase().trim()

            // Exact match (highest priority)
            const isExact = txDesc === descLower
            // Starts with same text
            const isPrefix = txDesc.startsWith(descLower) || descLower.startsWith(txDesc)
            // Contains the search term
            const isPartial = txDesc.includes(descLower) || descLower.includes(txDesc)

            if (!isExact && !isPrefix && !isPartial) continue

            const catId = tx.category_id as string
            const catName = (tx.category as any)?.name ?? ''
            const weight = isExact ? 10 : isPrefix ? 5 : 1

            const existing = categoryCounts.get(catId)
            if (existing) {
                existing.count += weight
            } else {
                categoryCounts.set(catId, { count: weight, name: catName })
            }
        }

        if (categoryCounts.size === 0) return null

        // Return category with highest weighted count
        let bestId = ''
        let bestCount = 0
        let bestName = ''

        for (const [id, { count, name }] of categoryCounts) {
            if (count > bestCount) {
                bestId = id
                bestCount = count
                bestName = name
            }
        }

        return bestId ? { categoryId: bestId, categoryName: bestName } : null
    }
}

export const categorySuggestionService = new CategorySuggestionService()
