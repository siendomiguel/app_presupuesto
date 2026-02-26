"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { budgetSchema, type BudgetFormValues } from "@/lib/validations/budget"
import { budgetsService } from "@/lib/services/budgets"
import { useUser } from "@/hooks/use-user"
import { useCategories } from "@/hooks/use-categories"
import { toast } from "sonner"
import { format } from "date-fns"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Database } from "@/lib/supabase/database.types"

type Budget = Database['public']['Tables']['budgets']['Row']

const GENERAL_VALUE = "__general__"

interface BudgetFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    budget?: Budget | null
    onSuccess?: () => void
}

export function BudgetFormDialog({
    open,
    onOpenChange,
    budget,
    onSuccess,
}: BudgetFormDialogProps) {
    const { user } = useUser()
    const { categories } = useCategories(user?.id, "expense")

    const isEditing = !!budget

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: budget
            ? {
                name: budget.name,
                category_id: budget.category_id ?? null,
                amount_usd: budget.amount_usd,
                amount_cop: budget.amount_cop,
                period: budget.period,
                start_date: budget.start_date,
                end_date: budget.end_date,
            }
            : {
                name: "",
                category_id: null,
                amount_usd: 0,
                amount_cop: 0,
                period: "monthly",
                start_date: "",
                end_date: null,
            },
    })

    // Set start_date on mount to avoid new Date() during SSR
    const [initialized, setInitialized] = useState(false)
    if (!initialized && !budget && open) {
        form.setValue("start_date", format(new Date(), "yyyy-MM-dd"))
        setInitialized(true)
    }

    const onSubmit = async (values: BudgetFormValues) => {
        if (!user) return

        try {
            const payload = {
                ...values,
                category_id: values.category_id || null,
                end_date: values.end_date || null,
            }

            if (isEditing) {
                await budgetsService.updateBudget(budget.id, payload as any)
                toast.success("Presupuesto actualizado")
            } else {
                await budgetsService.createBudget({
                    ...payload,
                    user_id: user.id,
                } as any)
                toast.success("Presupuesto creado")
            }
            onSuccess?.()
            onOpenChange(false)
            form.reset()
        } catch (error) {
            toast.error("Error al guardar el presupuesto")
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar presupuesto" : "Nuevo presupuesto"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria (opcional)</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val === GENERAL_VALUE ? null : val)}
                                        defaultValue={field.value ?? GENERAL_VALUE}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="General (todos los gastos)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={GENERAL_VALUE}>
                                                General (todos los gastos)
                                            </SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount_usd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Limite USD</FormLabel>
                                        <FormControl>
                                            <CurrencyInput value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount_cop"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Limite COP</FormLabel>
                                        <FormControl>
                                            <CurrencyInput value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="period"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Periodo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="weekly">Semanal</SelectItem>
                                            <SelectItem value="monthly">Mensual</SelectItem>
                                            <SelectItem value="yearly">Anual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha inicio</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha fin (opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
