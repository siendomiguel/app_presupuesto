"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Plus from "lucide-react/dist/esm/icons/plus"
import Target from "lucide-react/dist/esm/icons/target"
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal"
import Pencil from "lucide-react/dist/esm/icons/pencil"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"
import ArrowDownToLine from "lucide-react/dist/esm/icons/arrow-down-to-line"
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2"
import { useUser } from "@/hooks/use-user"
import { useSavingsGoals } from "@/hooks/use-savings-goals"
import { savingsGoalsService } from "@/lib/services/savings-goals"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SavingsGoalFormDialog } from "@/components/forms/savings-goal-form-dialog"
import { DepositGoalDialog } from "@/components/forms/deposit-goal-dialog"
import { DeleteConfirmationDialog } from "@/components/forms/delete-confirmation-dialog"
import type { SavingsGoal } from "@/lib/services/savings-goals"

export function SavingsGoals() {
    const { user } = useUser()
    const { goals, loading, refetch } = useSavingsGoals(user?.id)

    const [formOpen, setFormOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
    const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null)
    const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null)

    const handleEdit = (goal: SavingsGoal) => {
        setEditingGoal(goal)
        setFormOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingGoal) return
        try {
            await savingsGoalsService.deleteGoal(deletingGoal.id)
            toast.success("Meta eliminada")
            refetch()
        } catch {
            toast.error("Error al eliminar la meta")
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Metas de ahorro
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingGoal(null); setFormOpen(true) }}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
                        </div>
                    ) : goals.length === 0 ? (
                        <div className="text-center py-6">
                            <Target className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">No tienes metas de ahorro</p>
                            <Button variant="link" size="sm" className="mt-1" onClick={() => { setEditingGoal(null); setFormOpen(true) }}>
                                Crear primera meta
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {goals.map(goal => {
                                const pct = goal.target_amount > 0
                                    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                                    : 0
                                const isCompleted = pct >= 100
                                const isHigh = pct >= 75 && !isCompleted

                                return (
                                    <div key={goal.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div
                                                    className="h-3 w-3 rounded-full shrink-0"
                                                    style={{ backgroundColor: goal.color ?? "#2cb67d" }}
                                                />
                                                <span className="font-medium text-sm truncate">{goal.name}</span>
                                                {isCompleted && (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setDepositGoal(goal)} className="gap-2">
                                                        <ArrowDownToLine className="h-4 w-4" />
                                                        Depositar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(goal)} className="gap-2">
                                                        <Pencil className="h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setDeletingGoal(goal)} className="gap-2 text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span className="tabular-nums">
                                                {formatCurrency(goal.current_amount, goal.currency)} / {formatCurrency(goal.target_amount, goal.currency)}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[10px] px-1.5 py-0",
                                                    isCompleted && "border-emerald-500/50 text-emerald-500",
                                                    isHigh && "border-amber-500/50 text-amber-500",
                                                )}
                                            >
                                                {Math.round(pct)}%
                                            </Badge>
                                        </div>

                                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    width: `${pct}%`,
                                                    backgroundColor: isCompleted ? "#10b981" : isHigh ? "#f59e0b" : (goal.color ?? "#2cb67d"),
                                                }}
                                            />
                                        </div>

                                        {goal.target_date && (
                                            <p className="text-[10px] text-muted-foreground">
                                                Meta: {new Date(goal.target_date + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                                            </p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <SavingsGoalFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                goal={editingGoal}
                onSuccess={refetch}
            />

            <DepositGoalDialog
                open={!!depositGoal}
                onOpenChange={(open) => { if (!open) setDepositGoal(null) }}
                goal={depositGoal}
                onSuccess={refetch}
            />

            <DeleteConfirmationDialog
                open={!!deletingGoal}
                onOpenChange={(open) => { if (!open) setDeletingGoal(null) }}
                onConfirm={handleDelete}
                title="Eliminar meta"
                description={`¿Estás seguro de eliminar la meta "${deletingGoal?.name}"? Esta acción no se puede deshacer.`}
            />
        </>
    )
}
