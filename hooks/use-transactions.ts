"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { transactionsService } from '@/lib/services/transactions'
import { Database } from '@/lib/supabase/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
    category?: Database['public']['Tables']['categories']['Row']
    budget?: Database['public']['Tables']['budgets']['Row']
    account?: Database['public']['Tables']['accounts']['Row']
}

interface TransactionFilters {
    startDate?: string
    endDate?: string
    categoryId?: string
    budgetId?: string
    type?: 'income' | 'expense' | 'transfer'
    currency?: 'USD' | 'COP'
}

interface TransactionStats {
    income_usd: number
    income_cop: number
    expense_usd: number
    expense_cop: number
    balance_usd: number
    balance_cop: number
}

export function useTransactions(userId: string | undefined, filters?: TransactionFilters) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const stableFilters = useMemo(() => filters, [
        filters?.startDate,
        filters?.endDate,
        filters?.categoryId,
        filters?.budgetId,
        filters?.type,
        filters?.currency,
    ])

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchTransactions = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await transactionsService.getTransactions(userId, stableFilters)
                setTransactions(data as Transaction[])
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching transactions:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [userId, stableFilters, refreshKey])

    return { transactions, loading, error, refetch }
}

export function useTransactionStats(userId: string | undefined, startDate: string, endDate: string) {
    const [stats, setStats] = useState<TransactionStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchStats = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await transactionsService.getStats(userId, startDate, endDate)
                setStats(data)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching transaction stats:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [userId, startDate, endDate, refreshKey])

    return { stats, loading, error, refetch }
}
