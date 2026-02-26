"use client"

import { useCallback, useEffect, useState } from 'react'
import { accountsService } from '@/lib/services/accounts'
import { Database } from '@/lib/supabase/database.types'

type Account = Database['public']['Tables']['accounts']['Row']

interface TotalBalance {
    usd: number
    cop: number
}

export function useAccounts(userId: string | undefined) {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchAccounts = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await accountsService.getAccounts(userId)
                setAccounts(data)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching accounts:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAccounts()
    }, [userId, refreshKey])

    return { accounts, loading, error, refetch }
}

export function useTotalBalance(userId: string | undefined) {
    const [balance, setBalance] = useState<TotalBalance>({ usd: 0, cop: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchBalance = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await accountsService.getTotalBalance(userId)
                setBalance(data)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching total balance:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchBalance()
    }, [userId, refreshKey])

    return { balance, loading, error, refetch }
}
