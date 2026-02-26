import { z } from "zod"

export const transactionItemSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    quantity: z.number().positive("La cantidad debe ser mayor a 0"),
    unit_price: z.number().positive("El precio debe ser mayor a 0"),
})

export const transactionSchema = z.object({
    type: z.enum(["income", "expense", "transfer"]),
    amount: z.number().positive("El monto debe ser mayor a 0"),
    currency: z.enum(["USD", "COP"]),
    description: z.string().min(1, "La descripcion es requerida"),
    account_id: z.string().min(1, "Selecciona una cuenta"),
    category_id: z.string().nullable().optional(),
    budget_id: z.string().nullable().optional(),
    date: z.string().min(1, "La fecha es requerida"),
    merchant: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    items: z.array(transactionItemSchema).optional(),
})

export type TransactionItemFormValues = z.infer<typeof transactionItemSchema>
export type TransactionFormValues = z.infer<typeof transactionSchema>
