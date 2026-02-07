"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const categoryData = [
  { name: "Alimentacion", value: 680, color: "hsl(158, 64%, 42%)" },
  { name: "Servicios", value: 450, color: "hsl(43, 96%, 56%)" },
  { name: "Transporte", value: 320, color: "hsl(199, 89%, 48%)" },
  { name: "Entretenimiento", value: 280, color: "hsl(0, 72%, 51%)" },
  { name: "Salud", value: 120, color: "hsl(262, 52%, 56%)" },
]

const total = categoryData.reduce((acc, item) => acc + item.value, 0)

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; color: string } }> }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="text-xs font-medium text-card-foreground">{data.name}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-card-foreground">${data.value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{((data.value / total) * 100).toFixed(1)}% del total</p>
    </div>
  )
}

export function CategoryBreakdown() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">Gastos por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <ChartContainer
            config={{
              alimentacion: { label: "Alimentacion", color: "hsl(158, 64%, 42%)" },
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
                  data={categoryData}
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
                  {((item.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
