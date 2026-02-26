import { z } from "zod"

export const accountSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum(["cash", "bank", "credit_card", "savings"]),
    balance_usd: z.number(),
    balance_cop: z.number(),
})

export type AccountFormValues = z.infer<typeof accountSchema>
