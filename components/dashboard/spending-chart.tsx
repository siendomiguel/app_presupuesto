"use client"

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useMemo } from "react"
import { useUser } from "@/hooks/use-user"
import { useTransactions } from "@/hooks/use-transactions"
import { startOfYear, endOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, subWeeks, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval, format } from "date-fns"
import { es } from "date-fns/locale"

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-card-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: entry.dataKey === "ingresos" ? "hsl(158, 64%, 42%)" : "hsl(199, 89%, 48%)",
            }}
          />
          <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
          <span className="font-medium text-card-foreground">${entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export function SpendingChart() {
  const [period, setPeriod] = useState("mensual")
  const { user } = useUser()

  // Get date ranges
  const now = new Date()
  const yearStart = format(startOfYear(now), 'yyyy-MM-dd')
  const yearEnd = format(endOfYear(now), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const weeksAgo = startOfWeek(subWeeks(now, 7), { weekStartsOn: 1 })
  const weekRangeStart = format(weeksAgo, 'yyyy-MM-dd')
  const weekRangeEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const sevenDaysAgo = format(subDays(now, 6), 'yyyy-MM-dd')
  const today = format(now, 'yyyy-MM-dd')

  // Fetch transactions based on period
  const dateRanges: Record<string, { startDate: string; endDate: string }> = {
    "7dias": { startDate: sevenDaysAgo, endDate: today },
    "mensual": { startDate: monthStart, endDate: monthEnd },
    "semanal": { startDate: weekRangeStart, endDate: weekRangeEnd },
    "anual": { startDate: yearStart, endDate: yearEnd },
  }
  const range = dateRanges[period] || dateRanges["mensual"]
  const { transactions, loading } = useTransactions(user?.id, range)

  // Process data for charts
  const data = useMemo(() => {
    if (!transactions.length) return []

    if (period === "7dias") {
      const days = eachDayOfInterval({ start: subDays(now, 6), end: now })
      return days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd')
        const dayTx = transactions.filter(t => t.date === dayStr)
        return {
          name: format(day, 'EEE d', { locale: es }),
          ingresos: dayTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          gastos: dayTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        }
      })
    } else if (period === "mensual") {
      const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })
      return days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd')
        const dayTx = transactions.filter(t => t.date === dayStr)
        return {
          name: format(day, 'd', { locale: es }),
          ingresos: dayTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          gastos: dayTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        }
      })
    } else if (period === "semanal") {
      const weeks = eachWeekOfInterval(
        { start: weeksAgo, end: endOfWeek(now, { weekStartsOn: 1 }) },
        { weekStartsOn: 1 }
      )
      return weeks.map(weekStart => {
        const wEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
        const wStartStr = format(weekStart, 'yyyy-MM-dd')
        const wEndStr = format(wEnd, 'yyyy-MM-dd')
        const weekTransactions = transactions.filter(t => t.date >= wStartStr && t.date <= wEndStr)

        return {
          name: `${format(weekStart, 'd MMM', { locale: es })}`,
          ingresos: weekTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          gastos: weekTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
        }
      })
    } else {
      const months = eachMonthOfInterval({ start: startOfYear(now), end: endOfYear(now) })
      return months.map(month => {
        const monthStr = format(month, 'yyyy-MM')
        const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr))

        return {
          name: format(month, 'MMM', { locale: es }),
          ingresos: monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          gastos: monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, period])

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">Ingresos vs Gastos</CardTitle>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="h-8">
            <TabsTrigger value="7dias" className="text-xs px-2 sm:px-3 h-6">7 dias</TabsTrigger>
            <TabsTrigger value="mensual" className="text-xs px-2 sm:px-3 h-6">Mes</TabsTrigger>
            <TabsTrigger value="semanal" className="text-xs px-2 sm:px-3 h-6">Semanal</TabsTrigger>
            <TabsTrigger value="anual" className="text-xs px-2 sm:px-3 h-6">Anual</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="flex items-center justify-center h-[280px]">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[280px]">
            <p className="text-sm text-muted-foreground">No hay datos para mostrar</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              ingresos: { label: "Ingresos", color: "hsl(158, 64%, 42%)" },
              gastos: { label: "Gastos", color: "hsl(199, 89%, 48%)" },
            }}
            className="h-[280px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  interval={period === "mensual" ? 4 : undefined}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  tickFormatter={(value) => `$${value >= 1000 ? `${value / 1000}k` : value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="hsl(158, 64%, 42%)"
                  strokeWidth={2}
                  fill="url(#fillIngresos)"
                />
                <Area
                  type="monotone"
                  dataKey="gastos"
                  stroke="hsl(199, 89%, 48%)"
                  strokeWidth={2}
                  fill="url(#fillGastos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
