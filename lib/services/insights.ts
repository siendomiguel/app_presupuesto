// @ts-nocheck — supabase-js type mismatch with generated Database types
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, subMonths, format, eachWeekOfInterval, endOfWeek, startOfWeek, differenceInDays } from 'date-fns'

export interface MonthlyInsights {
    totalExpenses: number
    totalIncome: number
    prevTotalExpenses: number
    prevTotalIncome: number
    expenseChange: number
    incomeChange: number
    topCategory: { name: string; amount: number } | null
    avgDailyExpense: number
    transactionCount: number
    bestWeek: { label: string; amount: number } | null
    worstWeek: { label: string; amount: number } | null
}

export class InsightsService {
    private supabase = createClient()

    async getMonthlyInsights(userId: string, currency: 'USD' | 'COP'): Promise<MonthlyInsights> {
        const now = new Date()
        const currentStart = format(startOfMonth(now), 'yyyy-MM-dd')
        const currentEnd = format(endOfMonth(now), 'yyyy-MM-dd')
        const prevStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
        const prevEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')

        // Fetch current month transactions
        const { data: currentTx } = await this.supabase
            .from('transactions')
            .select('type, amount, currency, date, category:categories(name)')
            .eq('user_id', userId)
            .eq('currency', currency)
            .gte('date', currentStart)
            .lte('date', currentEnd)

        // Fetch previous month transactions
        const { data: prevTx } = await this.supabase
            .from('transactions')
            .select('type, amount, currency')
            .eq('user_id', userId)
            .eq('currency', currency)
            .gte('date', prevStart)
            .lte('date', prevEnd)

        const txs = currentTx ?? []
        const prevTxs = prevTx ?? []

        // Current month totals
        const totalExpenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
        const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

        // Previous month totals
        const prevTotalExpenses = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
        const prevTotalIncome = prevTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

        // % change
        const expenseChange = prevTotalExpenses > 0 ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 : 0
        const incomeChange = prevTotalIncome > 0 ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100 : 0

        // Top category by expense
        const catTotals = new Map<string, number>()
        for (const tx of txs) {
            if (tx.type !== 'expense') continue
            const name = (tx.category as any)?.name ?? 'Sin categoria'
            catTotals.set(name, (catTotals.get(name) ?? 0) + tx.amount)
        }
        let topCategory: { name: string; amount: number } | null = null
        for (const [name, amount] of catTotals) {
            if (!topCategory || amount > topCategory.amount) topCategory = { name, amount }
        }

        // Avg daily expense
        const daysElapsed = Math.max(differenceInDays(now, startOfMonth(now)) + 1, 1)
        const avgDailyExpense = totalExpenses / daysElapsed

        // Best/worst week
        const weeks = eachWeekOfInterval(
            { start: startOfMonth(now), end: endOfMonth(now) },
            { weekStartsOn: 1 }
        )
        let bestWeek: { label: string; amount: number } | null = null
        let worstWeek: { label: string; amount: number } | null = null

        for (const weekStart of weeks) {
            const wEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
            const wStartStr = format(weekStart, 'yyyy-MM-dd')
            const wEndStr = format(wEnd, 'yyyy-MM-dd')
            const weekExpenses = txs
                .filter(t => t.type === 'expense' && t.date >= wStartStr && t.date <= wEndStr)
                .reduce((s, t) => s + t.amount, 0)

            const label = `${format(weekStart, 'dd')}-${format(wEnd, 'dd')}`
            if (!bestWeek || weekExpenses < bestWeek.amount) bestWeek = { label, amount: weekExpenses }
            if (!worstWeek || weekExpenses > worstWeek.amount) worstWeek = { label, amount: weekExpenses }
        }

        return {
            totalExpenses,
            totalIncome,
            prevTotalExpenses,
            prevTotalIncome,
            expenseChange,
            incomeChange,
            topCategory,
            avgDailyExpense,
            transactionCount: txs.length,
            bestWeek,
            worstWeek,
        }
    }
}

export const insightsService = new InsightsService()
