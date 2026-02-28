"use client"

import { useState, useEffect, useCallback } from "react"
import { savingsGoalsService, type SavingsGoal } from "@/lib/services/savings-goals"

export function useSavingsGoals(userId: string | undefined) {
    const [goals, setGoals] = useState<SavingsGoal[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) { setLoading(false); return }
        setLoading(true)
        savingsGoalsService.getGoals(userId)
            .then(setGoals)
            .catch(() => setGoals([]))
            .finally(() => setLoading(false))
    }, [userId, refreshKey])

    return { goals, loading, refetch }
}
