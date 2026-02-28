"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { savingsGoalSchema, type SavingsGoalFormValues } from "@/lib/validations/savings-goal"
import { savingsGoalsService, type SavingsGoal } from "@/lib/services/savings-goals"
import { useUser } from "@/hooks/use-user"
import { useAccounts } from "@/hooks/use-accounts"
import { toast } from "sonner"

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

interface SavingsGoalFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    goal?: SavingsGoal | null
    onSuccess?: () => void
}

const COLORS = [
    { label: "Verde", value: "#2cb67d" },
    { label: "Azul", value: "#0ea5e9" },
    { label: "Morado", value: "#8b5cf6" },
    { label: "Dorado", value: "#eab308" },
    { label: "Rosa", value: "#ec4899" },
    { label: "Naranja", value: "#f97316" },
]

export function SavingsGoalFormDialog({ open, onOpenChange, goal, onSuccess }: SavingsGoalFormDialogProps) {
    const { user, profile } = useUser()
    const { accounts } = useAccounts(user?.id)
    const isEditing = !!goal
    const defaultCurrency = (profile?.currency_preference as "USD" | "COP") || "USD"

    const savingsAccounts = accounts.filter(a => a.type === 'savings')

    const form = useForm<SavingsGoalFormValues>({
        resolver: zodResolver(savingsGoalSchema),
        defaultValues: {
            name: "",
            target_amount: 0,
            currency: defaultCurrency,
            linked_account_id: null,
            target_date: null,
            color: "#2cb67d",
        },
    })

    useEffect(() => {
        if (!open) return
        if (goal) {
            form.reset({
                name: goal.name,
                target_amount: goal.target_amount,
                currency: goal.currency,
                linked_account_id: goal.linked_account_id,
                target_date: goal.target_date,
                color: goal.color ?? "#2cb67d",
            })
        } else {
            form.reset({
                name: "",
                target_amount: 0,
                currency: defaultCurrency,
                linked_account_id: null,
                target_date: null,
                color: "#2cb67d",
            })
        }
    }, [open, goal])

    const onSubmit = async (values: SavingsGoalFormValues) => {
        if (!user) return
        try {
            if (isEditing) {
                await savingsGoalsService.updateGoal(goal.id, values as any)
                toast.success("Meta actualizada")
            } else {
                await savingsGoalsService.createGoal({
                    ...values,
                    user_id: user.id,
                    linked_account_id: values.linked_account_id || null,
                    target_date: values.target_date || null,
                } as any)
                toast.success("Meta creada")
            }
            onSuccess?.()
            onOpenChange(false)
        } catch {
            toast.error("Error al guardar la meta")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar meta" : "Nueva meta de ahorro"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl><Input placeholder="Ej: Vacaciones, Fondo de emergencia" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="target_amount" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto objetivo</FormLabel>
                                    <FormControl>
                                        <CurrencyInput value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="currency" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Moneda</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="COP">COP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="target_date" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha meta <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {savingsAccounts.length > 0 && (
                            <FormField control={form.control} name="linked_account_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vincular cuenta <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sin vincular" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {savingsAccounts.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}

                        <FormField control={form.control} name="color" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <div className="flex gap-2">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            className="h-7 w-7 rounded-full border-2 transition-all"
                                            style={{
                                                backgroundColor: c.value,
                                                borderColor: field.value === c.value ? 'white' : 'transparent',
                                                boxShadow: field.value === c.value ? `0 0 0 2px ${c.value}` : 'none',
                                            }}
                                            onClick={() => field.onChange(c.value)}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
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
