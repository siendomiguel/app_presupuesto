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
import { useState } from "react"

const monthlyData = [
  { name: "Ene", ingresos: 3800, gastos: 2400 },
  { name: "Feb", ingresos: 4100, gastos: 2800 },
  { name: "Mar", ingresos: 3600, gastos: 2200 },
  { name: "Abr", ingresos: 4250, gastos: 3100 },
  { name: "May", ingresos: 3900, gastos: 2600 },
  { name: "Jun", ingresos: 4500, gastos: 2900 },
  { name: "Jul", ingresos: 4100, gastos: 2500 },
  { name: "Ago", ingresos: 4300, gastos: 3000 },
  { name: "Sep", ingresos: 3700, gastos: 2300 },
  { name: "Oct", ingresos: 4600, gastos: 2700 },
  { name: "Nov", ingresos: 4200, gastos: 3200 },
  { name: "Dic", ingresos: 4250, gastos: 2847 },
]

const weeklyData = [
  { name: "Lun", ingresos: 600, gastos: 380 },
  { name: "Mar", ingresos: 700, gastos: 420 },
  { name: "Mie", ingresos: 550, gastos: 310 },
  { name: "Jue", ingresos: 800, gastos: 560 },
  { name: "Vie", ingresos: 900, gastos: 650 },
  { name: "Sab", ingresos: 400, gastos: 480 },
  { name: "Dom", ingresos: 300, gastos: 350 },
]

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
  const [period, setPeriod] = useState("anual")
  const data = period === "semanal" ? weeklyData : monthlyData

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">Ingresos vs Gastos</CardTitle>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="h-8">
            <TabsTrigger value="semanal" className="text-xs px-3 h-6">Semanal</TabsTrigger>
            <TabsTrigger value="anual" className="text-xs px-3 h-6">Anual</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-2">
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
      </CardContent>
    </Card>
  )
}
