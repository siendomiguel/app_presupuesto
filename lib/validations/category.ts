import { z } from "zod"

export const categorySchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum(["income", "expense"]),
    icon: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
