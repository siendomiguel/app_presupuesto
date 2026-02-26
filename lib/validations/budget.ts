import { z } from "zod"

export const budgetSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    category_id: z.string().nullable().optional(),
    amount_usd: z.number().min(0, "El monto no puede ser negativo"),
    amount_cop: z.number().min(0, "El monto no puede ser negativo"),
    period: z.enum(["monthly", "weekly", "yearly"]),
    start_date: z.string().min(1, "La fecha de inicio es requerida"),
    end_date: z.string().nullable().optional(),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>
