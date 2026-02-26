"use client"

import { useCallback, useEffect, useState } from 'react'
import { budgetsService } from '@/lib/services/budgets'
import { Database } from '@/lib/supabase/database.types'

type Budget = Database['public']['Tables']['budgets']['Row'] & {
    category?: Database['public']['Tables']['categories']['Row']
}

type BudgetProgress = Database['public']['Views']['budget_progress']['Row']

export function useBudgets(userId: string | undefined, period?: 'monthly' | 'weekly' | 'yearly') {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchBudgets = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await budgetsService.getBudgets(userId, period)
                setBudgets(data as Budget[])
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching budgets:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchBudgets()
    }, [userId, period, refreshKey])

    return { budgets, loading, error, refetch }
}

export function useBudgetProgress(userId: string | undefined) {
    const [progress, setProgress] = useState<BudgetProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchProgress = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await budgetsService.getBudgetProgress(userId)
                setProgress(data)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching budget progress:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchProgress()
    }, [userId, refreshKey])

    return { progress, loading, error, refetch }
}

export function useCurrentMonthBudgets(userId: string | undefined) {
    const [budgets, setBudgets] = useState<BudgetProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchBudgets = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await budgetsService.getCurrentMonthBudgets(userId)
                setBudgets(data)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching current month budgets:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchBudgets()
    }, [userId, refreshKey])

    return { budgets, loading, error, refetch }
}
