"use client"

import { useCallback, useEffect, useState } from 'react'
import { categoriesService } from '@/lib/services/categories'
import { Database } from '@/lib/supabase/database.types'

type Category = Database['public']['Tables']['categories']['Row']

interface CategorySpending {
    name: string
    color: string
    usd: number
    cop: number
}

export function useCategories(userId: string | undefined, type?: 'income' | 'expense') {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchCategories = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await categoriesService.getCategories(userId, type)
                setCategories(data)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching categories:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [userId, type, refreshKey])

    return { categories, loading, error, refetch }
}

export function useCategorySpending(
    userId: string | undefined,
    startDate: string,
    endDate: string
) {
    const [spending, setSpending] = useState<CategorySpending[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchSpending = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await categoriesService.getCategorySpending(userId, startDate, endDate)
                setSpending(data)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching category spending:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchSpending()
    }, [userId, startDate, endDate, refreshKey])

    return { spending, loading, error, refetch }
}
