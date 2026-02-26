"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal"
import Pencil from "lucide-react/dist/esm/icons/pencil"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Database } from "@/lib/supabase/database.types"

type BudgetProgress = Database['public']['Views']['budget_progress']['Row']

const periodLabels: Record<string, string> = {
    monthly: "Mensual",
    weekly: "Semanal",
    yearly: "Anual",
}

interface BudgetCardProps {
    budget: BudgetProgress
    onEdit: () => void
    onDelete: () => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
    const overUsd = budget.amount_usd > 0 && budget.spent_usd > budget.amount_usd
    const overCop = budget.amount_cop > 0 && budget.spent_cop > budget.amount_cop
    const isOver = overUsd || overCop

    const pctUsd = budget.amount_usd > 0 ? Math.min((budget.spent_usd / budget.amount_usd) * 100, 100) : 0
    const pctCop = budget.amount_cop > 0 ? Math.min((budget.spent_cop / budget.amount_cop) * 100, 100) : 0

    return (
        <Card className={cn("border-border/60", isOver && "border-[hsl(var(--destructive))]/50")}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold">{budget.name}</CardTitle>
                        {isOver && <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className="text-xs">
                            {periodLabels[budget.period]}
                        </Badge>
                        <Badge variant={budget.category_id ? "outline" : "secondary"} className="text-xs">
                            {budget.category_id ? "Por categoria" : "General"}
                        </Badge>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit} className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
                {budget.amount_usd > 0 && (
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">USD</span>
                            <span className={cn("font-medium tabular-nums", overUsd && "text-[hsl(var(--destructive))]")}>
                                {formatCurrency(budget.spent_usd, "USD")} / {formatCurrency(budget.amount_usd, "USD")}
                            </span>
                        </div>
                        <Progress
                            value={pctUsd}
                            className={cn("h-2", overUsd && "[&>div]:bg-[hsl(var(--destructive))]")}
                        />
                    </div>
                )}
                {budget.amount_cop > 0 && (
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">COP</span>
                            <span className={cn("font-medium tabular-nums", overCop && "text-[hsl(var(--destructive))]")}>
                                {formatCurrency(budget.spent_cop, "COP")} / {formatCurrency(budget.amount_cop, "COP")}
                            </span>
                        </div>
                        <Progress
                            value={pctCop}
                            className={cn("h-2", overCop && "[&>div]:bg-[hsl(var(--destructive))]")}
                        />
                    </div>
                )}
                {budget.amount_usd === 0 && budget.amount_cop === 0 && (
                    <p className="text-sm text-muted-foreground">Sin limite configurado</p>
                )}
            </CardContent>
        </Card>
    )
}
