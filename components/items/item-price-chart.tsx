"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { formatCurrency, parseLocalDate } from "@/lib/format"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { ItemPriceEntry } from "@/lib/services/items"

const COMPARE_COLORS = [
    "hsl(158, 64%, 42%)",
    "hsl(0, 72%, 51%)",
    "hsl(262, 52%, 56%)",
    "hsl(43, 96%, 56%)",
    "hsl(199, 89%, 48%)",
]

interface ItemPriceChartProps {
    data: Map<string, ItemPriceEntry[]>
    currency: string
}

export function ItemPriceChart({ data, currency }: ItemPriceChartProps) {
    const itemNames = Array.from(data.keys())
    const isCompare = itemNames.length > 1

    // Build unified timeline data
    const allDates = new Set<string>()
    for (const entries of data.values()) {
        for (const e of entries) allDates.add(e.date)
    }

    const sortedDates = Array.from(allDates).sort()
    const chartData = sortedDates.map(date => {
        const point: Record<string, any> = {
            date,
            label: format(parseLocalDate(date), "dd MMM yy", { locale: es }),
        }
        for (const [name, entries] of data.entries()) {
            const match = entries.find(e => e.date === date)
            if (match) point[name] = match.unitPrice
        }
        return point
    })

    const config: Record<string, { label: string; color: string }> = {}
    itemNames.forEach((name, i) => {
        config[name] = { label: name, color: COMPARE_COLORS[i % COMPARE_COLORS.length] }
    })

    if (chartData.length === 0) {
        return (
            <Card className="border-border/60">
                <CardContent className="flex items-center justify-center h-[200px]">
                    <p className="text-sm text-muted-foreground">No hay datos de precios para mostrar</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border/60">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-card-foreground">
                    {isCompare ? "Comparacion de precios" : `Historial de precios — ${itemNames[0]}`}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <ChartContainer config={config} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                className="fill-muted-foreground"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                className="fill-muted-foreground"
                                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null
                                    return (
                                        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                                            <p className="mb-1.5 text-xs font-medium text-card-foreground">{label}</p>
                                            {payload.map((entry: any) => (
                                                <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
                                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-muted-foreground">{entry.dataKey}:</span>
                                                    <span className="font-medium text-card-foreground">{formatCurrency(entry.value, currency)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }}
                            />
                            {isCompare && <Legend />}
                            {itemNames.map((name, i) => (
                                <Line
                                    key={name}
                                    type="monotone"
                                    dataKey={name}
                                    stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
