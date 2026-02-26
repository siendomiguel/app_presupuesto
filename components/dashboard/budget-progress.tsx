"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { useCurrentMonthBudgets } from "@/hooks/use-budgets"

export function BudgetProgress() {
  const { user } = useUser()
  const { budgets, loading } = useCurrentMonthBudgets(user?.id)

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">Presupuestos del mes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Cargando presupuestos...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No hay presupuestos configurados</p>
          </div>
        ) : (
          budgets.map((budget) => {
            // Combine USD and COP for display (prioritize USD)
            const spent = budget.spent_usd + budget.spent_cop
            const limit = budget.amount_usd + budget.amount_cop
            const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
            const isOverBudget = spent > limit

            return (
              <div key={budget.budget_id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">{budget.name}</span>
                  <span className={cn("text-sm tabular-nums", isOverBudget ? "font-semibold text-[hsl(var(--destructive))]" : "text-muted-foreground")}>
                    ${spent.toLocaleString()} / ${limit.toLocaleString()}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isOverBudget ? "hsl(0, 72%, 51%)" : "hsl(158, 64%, 42%)",
                    }}
                  />
                </div>
                {isOverBudget && (
                  <span className="text-xs text-[hsl(var(--destructive))]">
                    Excedido por ${(spent - limit).toLocaleString()}
                  </span>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
