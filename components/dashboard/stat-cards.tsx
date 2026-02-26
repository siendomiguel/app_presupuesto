"use client"

import { Card, CardContent } from "@/components/ui/card"
import TrendingUp from "lucide-react/dist/esm/icons/trending-up"
import TrendingDown from "lucide-react/dist/esm/icons/trending-down"
import Wallet from "lucide-react/dist/esm/icons/wallet"
import PiggyBank from "lucide-react/dist/esm/icons/piggy-bank"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { useUser } from "@/hooks/use-user"
import { useTotalBalance } from "@/hooks/use-accounts"
import { useTransactionStats } from "@/hooks/use-transactions"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export function StatCards() {
  const { user } = useUser()

  // Get current month dates
  const now = new Date()
  const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const currentMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  // Get previous month dates for comparison
  const prevMonth = subMonths(now, 1)
  const prevMonthStart = format(startOfMonth(prevMonth), 'yyyy-MM-dd')
  const prevMonthEnd = format(endOfMonth(prevMonth), 'yyyy-MM-dd')

  // Fetch data
  const { balance, loading: balanceLoading } = useTotalBalance(user?.id)
  const { stats: currentStats, loading: currentStatsLoading } = useTransactionStats(
    user?.id,
    currentMonthStart,
    currentMonthEnd
  )
  const { stats: prevStats } = useTransactionStats(
    user?.id,
    prevMonthStart,
    prevMonthEnd
  )

  // Calculate totals (prioritize USD, show COP if no USD)
  const totalBalance = balance.usd > 0 ? balance.usd : balance.cop
  const balanceCurrency = balance.usd > 0 ? 'USD' : 'COP'

  const currentIncome = (currentStats?.income_usd || 0) + (currentStats?.income_cop || 0)
  const currentExpense = (currentStats?.expense_usd || 0) + (currentStats?.expense_cop || 0)
  const currentSavings = currentIncome - currentExpense

  const prevIncome = (prevStats?.income_usd || 0) + (prevStats?.income_cop || 0)
  const prevExpense = (prevStats?.expense_usd || 0) + (prevStats?.expense_cop || 0)
  const prevSavings = prevIncome - prevExpense

  // Calculate percentage changes
  const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0
  const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0
  const savingsChange = prevSavings > 0 ? ((currentSavings - prevSavings) / prevSavings) * 100 : 0
  const balanceChange = 2.5 // Placeholder for now

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  const loading = balanceLoading || currentStatsLoading

  const stats = [
    {
      label: "Balance total",
      value: loading ? "..." : formatCurrency(totalBalance, balanceCurrency),
      change: formatChange(balanceChange),
      trend: "up" as const,
      icon: Wallet,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Ingresos del mes",
      value: loading ? "..." : formatCurrency(currentIncome, 'USD'),
      change: formatChange(incomeChange),
      trend: incomeChange >= 0 ? "up" as const : "down" as const,
      icon: TrendingUp,
      iconBg: "bg-[hsl(158,64%,42%)]/10",
      iconColor: "text-[hsl(158,64%,42%)]",
    },
    {
      label: "Gastos del mes",
      value: loading ? "..." : formatCurrency(currentExpense, 'USD'),
      change: formatChange(expenseChange),
      trend: expenseChange >= 0 ? "down" as const : "up" as const,
      icon: TrendingDown,
      iconBg: "bg-[hsl(var(--destructive))]/10",
      iconColor: "text-[hsl(var(--destructive))]",
    },
    {
      label: "Ahorro del mes",
      value: loading ? "..." : formatCurrency(currentSavings, 'USD'),
      change: formatChange(savingsChange),
      trend: savingsChange >= 0 ? "up" as const : "down" as const,
      icon: PiggyBank,
      iconBg: "bg-[hsl(199,89%,48%)]/10",
      iconColor: "text-[hsl(199,89%,48%)]",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-2xl font-bold tracking-tight text-card-foreground">{stat.value}</span>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.iconBg)}>
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
                  stat.trend === "up" && stat.label !== "Gastos del mes"
                    ? "bg-[hsl(158,64%,42%)]/10 text-[hsl(158,64%,42%)]"
                    : "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]"
                )}
              >
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
