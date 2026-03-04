"use client"

import { useCallback, useEffect, useState } from 'react'
import {
    shoppingListsService,
    type ShoppingListWithCounts,
    type ShoppingList,
    type ShoppingListItem,
} from '@/lib/services/shopping-lists'

export function useShoppingLists(userId: string | undefined) {
    const [lists, setLists] = useState<ShoppingListWithCounts[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchLists = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await shoppingListsService.getShoppingLists(userId)
                setLists(data)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching shopping lists:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchLists()
    }, [userId, refreshKey])

    return { lists, loading, error, refetch }
}

export function useShoppingListDetail(listId: string | null) {
    const [list, setList] = useState<ShoppingList | null>(null)
    const [items, setItems] = useState<ShoppingListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

    useEffect(() => {
        if (!listId) {
            setList(null)
            setItems([])
            setLoading(false)
            return
        }

        const fetchDetail = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await shoppingListsService.getShoppingListWithItems(listId)
                setList(data.list)
                setItems(data.items)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching shopping list detail:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchDetail()
    }, [listId, refreshKey])

    return { list, items, loading, error, refetch }
}
