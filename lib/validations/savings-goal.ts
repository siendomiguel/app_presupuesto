import { z } from "zod"

export const savingsGoalSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    target_amount: z.number().positive("El monto debe ser mayor a 0"),
    currency: z.enum(["USD", "COP"]),
    linked_account_id: z.string().nullable().optional(),
    target_date: z.string().nullable().optional(),
    color: z.string().optional(),
})

export type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>

export const depositSchema = z.object({
    amount: z.number().positive("El monto debe ser mayor a 0"),
})

export type DepositFormValues = z.infer<typeof depositSchema>
