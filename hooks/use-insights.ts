"use client"

import { useState, useEffect, useCallback } from "react"
import { insightsService, type MonthlyInsights } from "@/lib/services/insights"

export function useMonthlyInsights(userId: string | undefined, currency: 'USD' | 'COP') {
    const [insights, setInsights] = useState<MonthlyInsights | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) { setLoading(false); return }
        setLoading(true)
        insightsService.getMonthlyInsights(userId, currency)
            .then(setInsights)
            .catch(() => setInsights(null))
            .finally(() => setLoading(false))
    }, [userId, currency, refreshKey])

    return { insights, loading, refetch }
}
