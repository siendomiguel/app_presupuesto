// @ts-nocheck — supabase-js type mismatch with generated Database types
import { createClient } from '@/lib/supabase/client'

export interface ShoppingList {
    id: string
    user_id: string
    name: string
    created_at: string
    updated_at: string
}

export interface ShoppingListItem {
    id: string
    list_id: string
    name: string
    quantity: number
    unit_price: number | null
    category_id: string | null
    checked: boolean
    position: number
    created_at: string
    category?: {
        id: string
        name: string
        icon: string | null
        color: string
    } | null
}

export interface ShoppingListWithCounts extends ShoppingList {
    total_items: number
    checked_items: number
    estimated_total: number
}

class ShoppingListsService {
    private supabase = createClient()

    async getShoppingLists(userId: string): Promise<ShoppingListWithCounts[]> {
        const { data: lists, error } = await this.supabase
            .from('shopping_lists')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })

        if (error) throw error

        // Fetch item counts for each list
        const listsWithCounts: ShoppingListWithCounts[] = []
        for (const list of lists) {
            const { data: items, error: itemsError } = await this.supabase
                .from('shopping_list_items')
                .select('checked, quantity, unit_price')
                .eq('list_id', list.id)

            if (itemsError) throw itemsError

            const total_items = items?.length ?? 0
            const checked_items = items?.filter(i => i.checked).length ?? 0
            const estimated_total = items?.reduce((sum, i) => {
                return sum + (i.quantity * (i.unit_price ?? 0))
            }, 0) ?? 0

            listsWithCounts.push({
                ...list,
                total_items,
                checked_items,
                estimated_total,
            })
        }

        return listsWithCounts
    }

    async getShoppingListWithItems(listId: string): Promise<{ list: ShoppingList; items: ShoppingListItem[] }> {
        const { data: list, error: listError } = await this.supabase
            .from('shopping_lists')
            .select('*')
            .eq('id', listId)
            .single()

        if (listError) throw listError

        const { data: items, error: itemsError } = await this.supabase
            .from('shopping_list_items')
            .select(`
                *,
                category:categories(id, name, icon, color)
            `)
            .eq('list_id', listId)
            .order('position', { ascending: true })

        if (itemsError) throw itemsError

        return { list, items: items as ShoppingListItem[] }
    }

    async createShoppingList(data: { user_id: string; name: string }) {
        const { data: list, error } = await this.supabase
            .from('shopping_lists')
            .insert(data as any)
            .select()
            .single()

        if (error) throw error
        return list
    }

    async updateShoppingList(id: string, data: { name: string }) {
        const { data: list, error } = await this.supabase
            .from('shopping_lists')
            .update(data as any)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return list
    }

    async duplicateShoppingList(listId: string, userId: string) {
        // Get original list
        const { list, items } = await this.getShoppingListWithItems(listId)

        // Create new list
        const newList = await this.createShoppingList({
            user_id: userId,
            name: `${list.name} (copia)`,
        })

        // Copy items (unchecked)
        if (items.length > 0) {
            const newItems = items.map(item => ({
                list_id: newList.id,
                name: item.name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                category_id: item.category_id,
                checked: false,
                position: item.position,
            }))

            const { error } = await this.supabase
                .from('shopping_list_items')
                .insert(newItems as any)

            if (error) throw error
        }

        return newList
    }

    async deleteShoppingList(id: string) {
        const { error } = await this.supabase
            .from('shopping_lists')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }

    async addItem(data: {
        list_id: string
        name: string
        quantity: number
        unit_price?: number | null
        category_id?: string | null
        position?: number
    }) {
        const { data: item, error } = await this.supabase
            .from('shopping_list_items')
            .insert({
                ...data,
                unit_price: data.unit_price ?? null,
                category_id: data.category_id ?? null,
            } as any)
            .select(`
                *,
                category:categories(id, name, icon, color)
            `)
            .single()

        if (error) throw error
        return item
    }

    async updateItem(id: string, data: Partial<{
        name: string
        quantity: number
        unit_price: number | null
        category_id: string | null
        checked: boolean
        position: number
    }>) {
        const { data: item, error } = await this.supabase
            .from('shopping_list_items')
            .update(data as any)
            .eq('id', id)
            .select(`
                *,
                category:categories(id, name, icon, color)
            `)
            .single()

        if (error) throw error
        return item
    }

    async deleteItem(id: string) {
        const { error } = await this.supabase
            .from('shopping_list_items')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }

    async toggleItemChecked(id: string, checked: boolean) {
        const { error } = await this.supabase
            .from('shopping_list_items')
            .update({ checked } as any)
            .eq('id', id)

        if (error) throw error
        return true
    }
}

export const shoppingListsService = new ShoppingListsService()
