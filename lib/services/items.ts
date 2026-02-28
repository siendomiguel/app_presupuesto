// @ts-nocheck — supabase-js type mismatch with generated Database types
import { createClient } from '@/lib/supabase/client'

export interface ItemSummary {
    name: string
    purchaseCount: number
    totalQuantity: number
    avgPrice: number
    minPrice: number
    maxPrice: number
    totalSpent: number
    lastDate: string
    currency: string
}

export interface ItemPriceEntry {
    id: string
    date: string
    unitPrice: number
    quantity: number
    transactionDescription: string
    currency: string
}

export class ItemsService {
    private supabase = createClient()

    async getItemsSummary(userId: string): Promise<ItemSummary[]> {
        const { data, error } = await this.supabase
            .from('transaction_items')
            .select(`
                id,
                name,
                quantity,
                unit_price,
                transaction:transactions!inner(user_id, date, currency)
            `)
            .eq('transaction.user_id', userId)

        if (error) throw error
        if (!data) return []

        // Group by normalized item name
        const groups = new Map<string, {
            name: string
            prices: number[]
            quantities: number[]
            dates: string[]
            currencies: string[]
        }>()

        for (const item of data) {
            const tx = item.transaction as any
            const key = item.name.toLowerCase().trim()

            if (!groups.has(key)) {
                groups.set(key, {
                    name: item.name,
                    prices: [],
                    quantities: [],
                    dates: [],
                    currencies: [],
                })
            }

            const group = groups.get(key)!
            group.prices.push(item.unit_price)
            group.quantities.push(item.quantity)
            group.dates.push(tx.date)
            group.currencies.push(tx.currency)
        }

        const summaries: ItemSummary[] = []
        for (const group of groups.values()) {
            const totalQuantity = group.quantities.reduce((s, q) => s + q, 0)
            const totalSpent = group.prices.reduce((s, p, i) => s + p * group.quantities[i], 0)

            summaries.push({
                name: group.name,
                purchaseCount: group.prices.length,
                totalQuantity,
                avgPrice: totalSpent / totalQuantity,
                minPrice: Math.min(...group.prices),
                maxPrice: Math.max(...group.prices),
                totalSpent,
                lastDate: group.dates.sort().reverse()[0],
                currency: group.currencies[0],
            })
        }

        return summaries.sort((a, b) => b.purchaseCount - a.purchaseCount)
    }

    async getItemPriceHistory(userId: string, itemName: string): Promise<ItemPriceEntry[]> {
        const { data, error } = await this.supabase
            .from('transaction_items')
            .select(`
                id,
                name,
                quantity,
                unit_price,
                transaction:transactions!inner(user_id, date, description, currency)
            `)
            .eq('transaction.user_id', userId)
            .ilike('name', itemName)
            .order('id')

        if (error) throw error
        if (!data) return []

        return data
            .map((item) => {
                const tx = item.transaction as any
                return {
                    id: item.id,
                    date: tx.date,
                    unitPrice: item.unit_price,
                    quantity: item.quantity,
                    transactionDescription: tx.description,
                    currency: tx.currency,
                }
            })
            .sort((a, b) => a.date.localeCompare(b.date))
    }
}

export const itemsService = new ItemsService()
