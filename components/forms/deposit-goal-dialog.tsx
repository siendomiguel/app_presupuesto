"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { depositSchema, type DepositFormValues } from "@/lib/validations/savings-goal"
import { savingsGoalsService, type SavingsGoal } from "@/lib/services/savings-goals"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/format"

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
import { CurrencyInput } from "@/components/ui/currency-input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface DepositGoalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    goal: SavingsGoal | null
    onSuccess?: () => void
}

export function DepositGoalDialog({ open, onOpenChange, goal, onSuccess }: DepositGoalDialogProps) {
    const form = useForm<DepositFormValues>({
        resolver: zodResolver(depositSchema),
        defaultValues: { amount: 0 },
    })

    const currentAmount = goal?.current_amount ?? 0
    const targetAmount = goal?.target_amount ?? 0
    const remaining = Math.max(targetAmount - currentAmount, 0)
    const pct = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0

    const onSubmit = async (values: DepositFormValues) => {
        if (!goal) return
        try {
            await savingsGoalsService.depositToGoal(goal.id, values.amount)
            toast.success(`Depósito de ${formatCurrency(values.amount, goal.currency)} realizado`)
            form.reset({ amount: 0 })
            onSuccess?.()
            onOpenChange(false)
        } catch {
            toast.error("Error al realizar el depósito")
        }
    }

    if (!goal) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[380px]">
                <DialogHeader>
                    <DialogTitle>Depositar a "{goal.name}"</DialogTitle>
                </DialogHeader>

                <div className="space-y-2 mb-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso actual</span>
                        <span className="font-medium tabular-nums">
                            {formatCurrency(currentAmount, goal.currency)} / {formatCurrency(targetAmount, goal.currency)}
                        </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                        Faltan {formatCurrency(remaining, goal.currency)} para completar la meta
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto a depositar ({goal.currency})</FormLabel>
                                <FormControl>
                                    <CurrencyInput value={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Depositando..." : "Depositar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
