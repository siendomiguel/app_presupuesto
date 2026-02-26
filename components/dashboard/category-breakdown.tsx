"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useUser } from "@/hooks/use-user"
import { useCategorySpending } from "@/hooks/use-categories"
import { startOfYear, endOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, subWeeks, format } from "date-fns"

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; color: string; total?: number } }> }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  const total = data.total || data.value
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="text-xs font-medium text-card-foreground">{data.name}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-card-foreground">${data.value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{total > 0 ? ((data.value / total) * 100).toFixed(1) : 0}% del total</p>
    </div>
  )
}

const periodLabels: Record<string, string> = {
  "7dias": "estos 7 dias",
  "mensual": "este mes",
  "semanal": "estas semanas",
  "anual": "este año",
}

export function CategoryBreakdown() {
  const [period, setPeriod] = useState("mensual")
  const { user } = useUser()

  const now = new Date()

  const dateRanges = useMemo(() => {
    const yearStart = format(startOfYear(now), 'yyyy-MM-dd')
    const yearEnd = format(endOfYear(now), 'yyyy-MM-dd')
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
    const weeksAgo = startOfWeek(subWeeks(now, 7), { weekStartsOn: 1 })
    const weekRangeStart = format(weeksAgo, 'yyyy-MM-dd')
    const weekRangeEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const sevenDaysAgo = format(subDays(now, 6), 'yyyy-MM-dd')
    const today = format(now, 'yyyy-MM-dd')

    return {
      "7dias": { startDate: sevenDaysAgo, endDate: today },
      "mensual": { startDate: monthStart, endDate: monthEnd },
      "semanal": { startDate: weekRangeStart, endDate: weekRangeEnd },
      "anual": { startDate: yearStart, endDate: yearEnd },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const range = dateRanges[period as keyof typeof dateRanges] || dateRanges["mensual"]
  const { spending, loading } = useCategorySpending(user?.id, range.startDate, range.endDate)

  // Transform data for chart (combine USD and COP)
  const categoryData = spending.map(cat => ({
    name: cat.name,
    value: cat.usd + cat.cop,
    color: cat.color || "hsl(158, 64%, 42%)",
  }))

  const total = categoryData.reduce((acc, item) => acc + item.value, 0)

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold text-card-foreground">Gastos por categoria</CardTitle>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="h-8">
            <TabsTrigger value="7dias" className="text-xs px-2 sm:px-3 h-6">7 dias</TabsTrigger>
            <TabsTrigger value="mensual" className="text-xs px-2 sm:px-3 h-6">Mes</TabsTrigger>
            <TabsTrigger value="semanal" className="text-xs px-2 sm:px-3 h-6">Semanal</TabsTrigger>
            <TabsTrigger value="anual" className="text-xs px-2 sm:px-3 h-6">Anual</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        ) : categoryData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-muted-foreground">No hay gastos {periodLabels[period]}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <ChartContainer
              config={{
                alimentacion: { label: "Alimentación", color: "hsl(158, 64%, 42%)" },
                servicios: { label: "Servicios", color: "hsl(43, 96%, 56%)" },
                transporte: { label: "Transporte", color: "hsl(199, 89%, 48%)" },
                entretenimiento: { label: "Entretenimiento", color: "hsl(0, 72%, 51%)" },
                salud: { label: "Salud", color: "hsl(262, 52%, 56%)" },
              }}
              className="h-[200px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={categoryData.map(d => ({ ...d, total }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="grid w-full grid-cols-2 gap-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                  <span className="ml-auto text-xs font-medium tabular-nums text-card-foreground">
                    {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
