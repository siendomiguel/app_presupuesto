"use client"

import { useState, useEffect, useCallback } from "react"
import { itemsService, type ItemSummary, type ItemPriceEntry } from "@/lib/services/items"

export function useItemsSummary(userId: string | undefined) {
    const [items, setItems] = useState<ItemSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) { setLoading(false); return }
        setLoading(true)
        itemsService.getItemsSummary(userId)
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setLoading(false))
    }, [userId, refreshKey])

    return { items, loading, refetch }
}

export function useItemPriceHistory(userId: string | undefined, itemName: string | null) {
    const [history, setHistory] = useState<ItemPriceEntry[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!userId || !itemName) { setHistory([]); return }
        setLoading(true)
        itemsService.getItemPriceHistory(userId, itemName)
            .then(setHistory)
            .catch(() => setHistory([]))
            .finally(() => setLoading(false))
    }, [userId, itemName])

    return { history, loading }
}
