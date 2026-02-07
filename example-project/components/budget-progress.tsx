"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const budgets = [
  {
    category: "Alimentacion",
    spent: 680,
    limit: 800,
    color: "hsl(158, 64%, 42%)",
  },
  {
    category: "Transporte",
    spent: 320,
    limit: 400,
    color: "hsl(199, 89%, 48%)",
  },
  {
    category: "Entretenimiento",
    spent: 280,
    limit: 250,
    color: "hsl(0, 72%, 51%)",
  },
  {
    category: "Servicios",
    spent: 450,
    limit: 600,
    color: "hsl(43, 96%, 56%)",
  },
  {
    category: "Salud",
    spent: 120,
    limit: 300,
    color: "hsl(262, 52%, 56%)",
  },
]

export function BudgetProgress() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">Presupuestos del mes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {budgets.map((budget) => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100)
          const isOverBudget = budget.spent > budget.limit

          return (
            <div key={budget.category} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">{budget.category}</span>
                <span className={cn("text-sm tabular-nums", isOverBudget ? "font-semibold text-[hsl(var(--destructive))]" : "text-muted-foreground")}>
                  ${budget.spent.toLocaleString()} / ${budget.limit.toLocaleString()}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: isOverBudget ? "hsl(0, 72%, 51%)" : budget.color,
                  }}
                />
              </div>
              {isOverBudget && (
                <span className="text-xs text-[hsl(var(--destructive))]">
                  Excedido por ${(budget.spent - budget.limit).toLocaleString()}
                </span>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
