"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/use-user"
import { useMonthlyInsights } from "@/hooks/use-insights"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import TrendingUp from "lucide-react/dist/esm/icons/trending-up"
import TrendingDown from "lucide-react/dist/esm/icons/trending-down"
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag"
import Calendar from "lucide-react/dist/esm/icons/calendar"
import Hash from "lucide-react/dist/esm/icons/hash"
import { cn } from "@/lib/utils"

export function MonthlyRecap() {
    const { user, profile } = useUser()
    const currency = (profile?.currency_preference as "USD" | "COP") || "USD"
    const { insights, loading } = useMonthlyInsights(user?.id, currency)

    const monthName = format(new Date(), "MMMM yyyy", { locale: es })

    if (loading) {
        return (
            <Card className="border-border/60">
                <CardContent className="flex items-center justify-center h-[200px]">
                    <p className="text-sm text-muted-foreground">Cargando...</p>
                </CardContent>
            </Card>
        )
    }

    if (!insights) return null

    const stats = [
        {
            label: "Gastos vs mes anterior",
            value: `${insights.expenseChange >= 0 ? "+" : ""}${insights.expenseChange.toFixed(1)}%`,
            icon: insights.expenseChange <= 0 ? TrendingDown : TrendingUp,
            color: insights.expenseChange <= 0 ? "text-[hsl(158,64%,42%)]" : "text-[hsl(0,72%,51%)]",
            detail: formatCurrency(insights.totalExpenses, currency),
        },
        {
            label: "Ingresos vs mes anterior",
            value: `${insights.incomeChange >= 0 ? "+" : ""}${insights.incomeChange.toFixed(1)}%`,
            icon: insights.incomeChange >= 0 ? TrendingUp : TrendingDown,
            color: insights.incomeChange >= 0 ? "text-[hsl(158,64%,42%)]" : "text-[hsl(0,72%,51%)]",
            detail: formatCurrency(insights.totalIncome, currency),
        },
        {
            label: "Categoria top",
            value: insights.topCategory?.name ?? "—",
            icon: ShoppingBag,
            color: "text-foreground",
            detail: insights.topCategory ? formatCurrency(insights.topCategory.amount, currency) : "",
        },
        {
            label: "Gasto diario promedio",
            value: formatCurrency(insights.avgDailyExpense, currency),
            icon: Calendar,
            color: "text-foreground",
            detail: "",
        },
        {
            label: "Transacciones",
            value: String(insights.transactionCount),
            icon: Hash,
            color: "text-foreground",
            detail: "",
        },
    ]

    return (
        <Card className="border-border/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-card-foreground capitalize">
                    Resumen de {monthName}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <stat.icon className={cn("h-4 w-4 shrink-0", stat.color)} />
                            <span className="text-sm text-muted-foreground truncate">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {stat.detail && (
                                <span className="text-xs text-muted-foreground">{stat.detail}</span>
                            )}
                            <span className={cn("text-sm font-semibold tabular-nums", stat.color)}>{stat.value}</span>
                        </div>
                    </div>
                ))}
                {insights.bestWeek && insights.worstWeek && (
                    <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <span className="text-muted-foreground">Mejor semana</span>
                            <p className="font-medium text-[hsl(158,64%,42%)]">
                                Dias {insights.bestWeek.label} · {formatCurrency(insights.bestWeek.amount, currency)}
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Mayor gasto</span>
                            <p className="font-medium text-[hsl(0,72%,51%)]">
                                Dias {insights.worstWeek.label} · {formatCurrency(insights.worstWeek.amount, currency)}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
