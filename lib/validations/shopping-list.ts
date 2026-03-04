import { z } from "zod"

export const shoppingListSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
})

export type ShoppingListFormValues = z.infer<typeof shoppingListSchema>

export const shoppingListItemSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    quantity: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    unit_price: z.number().min(0, "El precio no puede ser negativo").nullable().optional(),
    category_id: z.string().nullable().optional(),
})

export type ShoppingListItemFormValues = z.infer<typeof shoppingListItemSchema>
