"use client"

import { useState } from "react"
import { useUser } from "@/hooks/use-user"
import { useBudgets, useBudgetProgress } from "@/hooks/use-budgets"
import { BudgetCard } from "@/components/budgets/budget-card"
import { BudgetFormDialog } from "@/components/forms/budget-form-dialog"
import { DeleteConfirmationDialog } from "@/components/forms/delete-confirmation-dialog"
import { budgetsService } from "@/lib/services/budgets"
import { Button } from "@/components/ui/button"
import Plus from "lucide-react/dist/esm/icons/plus"
import { toast } from "sonner"
import { Database } from "@/lib/supabase/database.types"

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
        </>
    )
}
