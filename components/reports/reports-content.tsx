"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { useUser } from "@/hooks/use-user"
import { useTransactions, useTransactionStats } from "@/hooks/use-transactions"
import { useCategorySpending } from "@/hooks/use-categories"
import { DateRangeSelector } from "@/components/reports/date-range-selector"
import { ExportCsv } from "@/components/reports/export-csv"
import { formatCurrency, parseLocalDate } from "@/lib/format"
import { startOfMonth, endOfMonth, format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import Receipt from "lucide-react/dist/esm/icons/receipt"
import Store from "lucide-react/dist/esm/icons/store"
import TrendingDown from "lucide-react/dist/esm/icons/trending-down"

const COLORS = [
    "hsl(158, 64%, 42%)",
    "hsl(199, 89%, 48%)",
    "hsl(43, 96%, 56%)",
    "hsl(262, 52%, 56%)",
    "hsl(var(--destructive))",
    "hsl(25, 95%, 53%)",
    "hsl(330, 81%, 60%)",
    "hsl(210, 20%, 50%)",
]

type TrendGrouping = "day" | "week"

export function ReportsContent() {
    const { user, profile } = useUser()
    const defaultCurrency = (profile?.currency_preference as "USD" | "COP") || "USD"
    const now = new Date()
    const [startDate, setStartDate] = useState(format(startOfMonth(now), "yyyy-MM-dd"))
    const [endDate, setEndDate] = useState(format(endOfMonth(now), "yyyy-MM-dd"))
    const [currency, setCurrency] = useState<"USD" | "COP">(defaultCurrency)
    const [trendGrouping, setTrendGrouping] = useState<TrendGrouping>("day")
    const currencyInitialized = useRef(false)
    useEffect(() => {
        if (profile?.currency_preference && !currencyInitialized.current) {
            setCurrency(profile.currency_preference as "USD" | "COP")
            currencyInitialized.current = true
        }
    }, [profile?.currency_preference])

    const { transactions, loading } = useTransactions(user?.id, { startDate, endDate })
    const { stats } = useTransactionStats(user?.id, startDate, endDate)
    const { spending } = useCategorySpending(user?.id, startDate, endDate)

    // Trend data (group by day or week, user-selectable)
    const trendData = useMemo(() => {
        if (!transactions.length) return []

        if (trendGrouping === "day") {
            const intervals = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) })
            return intervals.map(day => {
                const dayStr = format(day, "yyyy-MM-dd")
                const dayTxs = transactions.filter(t => t.date === dayStr)
                return {
                    name: format(day, "dd MMM", { locale: es }),
                    ingresos: dayTxs.filter(t => t.type === "income").reduce((s, t) => s + (t.currency === currency ? t.amount : 0), 0),
                    gastos: dayTxs.filter(t => t.type === "expense").reduce((s, t) => s + (t.currency === currency ? t.amount : 0), 0),
                }
            })
        } else {
            // Group by week
            const weeks = eachWeekOfInterval({ start: new Date(startDate), end: new Date(endDate) }, { weekStartsOn: 1 })
            return weeks.map((week, i) => {
                const weekEnd = new Date(week)
                weekEnd.setDate(weekEnd.getDate() + 6)
                const weekTxs = transactions.filter(t => {
                    const d = parseLocalDate(t.date)
                    return d >= week && d <= weekEnd
                })
                return {
                    name: `Sem ${i + 1}`,
                    ingresos: weekTxs.filter(t => t.type === "income").reduce((s, t) => s + (t.currency === currency ? t.amount : 0), 0),
                    gastos: weekTxs.filter(t => t.type === "expense").reduce((s, t) => s + (t.currency === currency ? t.amount : 0), 0),
                }
            })
        }
    }, [transactions, startDate, endDate, currency, trendGrouping])

    // Category data with transaction counts
    const categoryData = useMemo(() => {
        // Count transactions per category from the transactions array
        const categoryCounts = new Map<string, number>()
        transactions.forEach(t => {
            if (t.type === "expense" && t.category && (t.currency === currency)) {
                const name = (t.category as any).name as string
                categoryCounts.set(name, (categoryCounts.get(name) || 0) + 1)
            }
        })

        return spending.map(s => ({
            name: s.name,
            value: currency === "USD" ? s.usd : s.cop,
            color: s.color || COLORS[0],
            count: categoryCounts.get(s.name) || 0,
        })).filter(s => s.value > 0).sort((a, b) => b.value - a.value)
    }, [spending, currency, transactions])

    // Spending summary: biggest expense + top merchants
    const spendingSummary = useMemo(() => {
        const expenses = transactions.filter(t => t.type === "expense" && t.currency === currency)

        // Biggest single expense
        const biggestExpense = expenses.length > 0
            ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
            : null

        // Top merchants by total spending
        const merchantMap = new Map<string, { total: number; count: number }>()
        expenses.forEach(t => {
            const merchant = ((t as any).merchant || "").trim()
            if (!merchant) return
            const existing = merchantMap.get(merchant) || { total: 0, count: 0 }
            existing.total += t.amount
            existing.count += 1
            merchantMap.set(merchant, existing)
        })
        const topMerchants = Array.from(merchantMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)

        return { biggestExpense, topMerchants }
    }, [transactions, currency])

    const totalIncome = currency === "USD" ? (stats?.income_usd ?? 0) : (stats?.income_cop ?? 0)
    const totalExpense = currency === "USD" ? (stats?.expense_usd ?? 0) : (stats?.expense_cop ?? 0)
    const netBalance = totalIncome - totalExpense

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Reportes</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Analiza tus finanzas en detalle
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-border">
                        <button
                            onClick={() => setCurrency("USD")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-l-lg transition-colors ${currency === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            USD
                        </button>
                        <button
                            onClick={() => setCurrency("COP")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-r-lg transition-colors ${currency === "COP" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            COP
                        </button>
                    </div>
                    <ExportCsv transactions={transactions} />
                </div>
            </div>

            <div className="mb-6">
                <DateRangeSelector
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                <Card className="border-border/60">
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Ingresos</p>
                        <p className="text-2xl font-bold text-[hsl(158,64%,42%)]">
                            {loading ? "..." : formatCurrency(totalIncome, currency)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border/60">
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Gastos</p>
                        <p className="text-2xl font-bold text-[hsl(var(--destructive))]">
                            {loading ? "..." : formatCurrency(totalExpense, currency)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border/60">
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Balance neto</p>
                        <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-[hsl(158,64%,42%)]" : "text-[hsl(var(--destructive))]"}`}>
                            {loading ? "..." : formatCurrency(netBalance, currency)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Trend chart */}
            <Card className="border-border/60 mb-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">Tendencia de ingresos y gastos</CardTitle>
                    <div className="flex rounded-lg border border-border">
                        <button
                            onClick={() => setTrendGrouping("day")}
                            className={`px-3 py-1 text-xs font-medium rounded-l-lg transition-colors ${trendGrouping === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            Días
                        </button>
                        <button
                            onClick={() => setTrendGrouping("week")}
                            className={`px-3 py-1 text-xs font-medium rounded-r-lg transition-colors ${trendGrouping === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            Semanas
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        </div>
                    ) : trendData.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No hay datos para el periodo seleccionado</p>
                        </div>
                    ) : (
                        <ChartContainer
                            config={{
                                ingresos: { label: "Ingresos", color: "hsl(158, 64%, 42%)" },
                                gastos: { label: "Gastos", color: "hsl(var(--destructive))" },
                            }}
                            className="h-[300px] w-full"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="fillIngresosR" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="fillGastosR" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="ingresos" stroke="hsl(158, 64%, 42%)" strokeWidth={2} fill="url(#fillIngresosR)" />
                                    <Area type="monotone" dataKey="gastos" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#fillGastosR)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Category breakdown */}
            <Card className="border-border/60 mb-6">
                <CardHeader>
                    <CardTitle className="text-base">Gastos por categoría</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        </div>
                    ) : categoryData.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No hay gastos en el periodo seleccionado</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <ChartContainer
                                config={{ value: { label: "Monto" } }}
                                className="h-[300px] w-full"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal={false} />
                                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                                        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" width={70} />
                                        <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {categoryData.map((entry, index) => (
                                                <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>

                            {/* Transaction count per category */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {categoryData.map(cat => (
                                    <div
                                        key={cat.name}
                                        className="flex items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2"
                                    >
                                        <div
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-muted-foreground truncate">{cat.name}</p>
                                            <p className="text-sm font-semibold">
                                                {cat.count} {cat.count === 1 ? "transacción" : "transacciones"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Spending summary */}
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="text-base">Resumen de gastos del periodo</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[120px] flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        </div>
                    ) : !spendingSummary.biggestExpense && spendingSummary.topMerchants.length === 0 ? (
                        <div className="h-[120px] flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No hay gastos en el periodo seleccionado</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Biggest expense */}
                            {spendingSummary.biggestExpense && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Receipt className="h-4 w-4" />
                                        Mayor gasto
                                    </div>
                                    <div className="rounded-lg border border-border/60 p-4">
                                        <p className="text-xl font-bold text-[hsl(var(--destructive))]">
                                            {formatCurrency(spendingSummary.biggestExpense.amount, currency)}
                                        </p>
                                        <p className="text-sm font-medium mt-1">
                                            {spendingSummary.biggestExpense.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                                            {(spendingSummary.biggestExpense as any).merchant && (
                                                <span>{(spendingSummary.biggestExpense as any).merchant}</span>
                                            )}
                                            {(spendingSummary.biggestExpense as any).merchant && <span>·</span>}
                                            <span>{format(parseLocalDate(spendingSummary.biggestExpense.date), "dd MMM yyyy", { locale: es })}</span>
                                            {spendingSummary.biggestExpense.category && (
                                                <>
                                                    <span>·</span>
                                                    <span>{(spendingSummary.biggestExpense.category as any).name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Top merchants */}
                            {spendingSummary.topMerchants.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Store className="h-4 w-4" />
                                        Comercios con más gastos
                                    </div>
                                    <div className="space-y-2">
                                        {spendingSummary.topMerchants.map((merchant, i) => (
                                            <div
                                                key={merchant.name}
                                                className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-2.5"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">
                                                        {i + 1}.
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{merchant.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {merchant.count} {merchant.count === 1 ? "transacción" : "transacciones"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-bold text-[hsl(var(--destructive))] shrink-0 ml-3">
                                                    {formatCurrency(merchant.total, currency)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}
