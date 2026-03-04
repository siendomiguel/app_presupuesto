"use client"

import { useState, useMemo } from "react"
import { useUser } from "@/hooks/use-user"
import { useBudgets, useBudgetProgress } from "@/hooks/use-budgets"
import { useTransactions } from "@/hooks/use-transactions"
import { BudgetCard } from "@/components/budgets/budget-card"
import { BudgetFormDialog } from "@/components/forms/budget-form-dialog"
import { DeleteConfirmationDialog } from "@/components/forms/delete-confirmation-dialog"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { budgetsService } from "@/lib/services/budgets"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Plus from "lucide-react/dist/esm/icons/plus"
import { toast } from "sonner"
import { Database } from "@/lib/supabase/database.types"
import { formatCurrency } from "@/lib/format"

type Budget = Database['public']['Tables']['budgets']['Row']
type BudgetProgressRow = Database['public']['Views']['budget_progress']['Row']

export default function BudgetsPage() {
    const { user } = useUser()
    const { budgets, refetch: refetchBudgets } = useBudgets(user?.id)
    const { progress, loading, refetch: refetchProgress } = useBudgetProgress(user?.id)

    const [formOpen, setFormOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<BudgetProgressRow | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [selectedBudget, setSelectedBudget] = useState<BudgetProgressRow | null>(null)

    const txFilters = useMemo(() => {
        if (!selectedBudget) return undefined
        return {
            type: 'expense' as const,
            categoryId: selectedBudget.category_id || undefined,
            startDate: selectedBudget.start_date,
            endDate: selectedBudget.end_date || undefined,
        }
    }, [selectedBudget])

    const { transactions: budgetTransactions, loading: txLoading } = useTransactions(
        selectedBudget ? user?.id : undefined,
        txFilters
    )

    const handleEdit = (bp: BudgetProgressRow) => {
        const budget = budgets.find(b => b.id === bp.budget_id)
        if (budget) {
            setEditingBudget(budget)
            setFormOpen(true)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await budgetsService.deleteBudget(deleteTarget.budget_id)
            toast.success("Presupuesto eliminado")
            refetchBudgets()
            refetchProgress()
        } catch {
            toast.error("Error al eliminar el presupuesto")
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    const handleFormSuccess = () => {
        refetchBudgets()
        refetchProgress()
        setEditingBudget(null)
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Presupuestos</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Controla tus limites de gasto generales o por categoria
                    </p>
                </div>
                <Button onClick={() => { setEditingBudget(null); setFormOpen(true) }} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Nuevo presupuesto
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-[180px] rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : progress.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-sm text-muted-foreground">No hay presupuestos</p>
                    <p className="text-xs text-muted-foreground mt-1">Crea tu primer presupuesto para controlar tus gastos</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {progress.map((bp) => (
                        <BudgetCard
                            key={bp.budget_id}
                            budget={bp}
                            onEdit={() => handleEdit(bp)}
                            onDelete={() => setDeleteTarget(bp)}
                            onClick={() => setSelectedBudget(bp)}
                        />
                    ))}
                </div>
            )}

            <BudgetFormDialog
                open={formOpen}
                onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingBudget(null) }}
                budget={editingBudget}
                onSuccess={handleFormSuccess}
            />

            <DeleteConfirmationDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                title="Eliminar presupuesto"
                description="Esta accion no se puede deshacer. Se eliminara el presupuesto y su historial de progreso."
                onConfirm={handleDelete}
                loading={deleting}
            />

            <Dialog open={!!selectedBudget} onOpenChange={(open) => { if (!open) setSelectedBudget(null) }}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{selectedBudget?.name} — Transacciones</DialogTitle>
                        {selectedBudget && (
                            <p className="text-sm text-muted-foreground">
                                {selectedBudget.amount_usd > 0 && (
                                    <span>Gastado {formatCurrency(selectedBudget.spent_usd, "USD")} de {formatCurrency(selectedBudget.amount_usd, "USD")}</span>
                                )}
                                {selectedBudget.amount_usd > 0 && selectedBudget.amount_cop > 0 && " · "}
                                {selectedBudget.amount_cop > 0 && (
                                    <span>Gastado {formatCurrency(selectedBudget.spent_cop, "COP")} de {formatCurrency(selectedBudget.amount_cop, "COP")}</span>
                                )}
                            </p>
                        )}
                    </DialogHeader>
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <TransactionTable
                            transactions={budgetTransactions}
                            loading={txLoading}
                            onEdit={() => {}}
                            onDelete={() => {}}
                        />
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    )
}
