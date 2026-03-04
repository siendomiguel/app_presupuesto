"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TrendingUp from "lucide-react/dist/esm/icons/trending-up"
import TrendingDown from "lucide-react/dist/esm/icons/trending-down"
import Wallet from "lucide-react/dist/esm/icons/wallet"
import PiggyBank from "lucide-react/dist/esm/icons/piggy-bank"
import GripVertical from "lucide-react/dist/esm/icons/grip-vertical"
import Pencil from "lucide-react/dist/esm/icons/pencil"
import Check from "lucide-react/dist/esm/icons/check"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { useUser } from "@/hooks/use-user"
import { useTotalBalance } from "@/hooks/use-accounts"
import { useTransactionStats } from "@/hooks/use-transactions"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import type { LucideIcon } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const STORAGE_KEY = "fintrack_stat_cards_order"
const DEFAULT_ORDER = ["balance", "income", "expense", "savings"]

interface CurrencyAmounts {
  usd: number
  cop: number
}

interface StatCardData {
  id: string
  label: string
  amounts: CurrencyAmounts
  change: string
  trend: "up" | "down"
  icon: LucideIcon
  iconBg: string
  iconColor: string
}

function CurrencyLines({ amounts, loading, primaryCurrency }: { amounts: CurrencyAmounts; loading: boolean; primaryCurrency: "USD" | "COP" }) {
  if (loading) return <span className="text-2xl font-bold tracking-tight text-card-foreground">...</span>

  const secondary = primaryCurrency === "USD" ? "COP" : "USD"
  const primaryAmount = primaryCurrency === "USD" ? amounts.usd : amounts.cop
  const secondaryAmount = primaryCurrency === "USD" ? amounts.cop : amounts.usd
  const hasPrimary = primaryAmount !== 0
  const hasSecondary = secondaryAmount !== 0

  if (!hasPrimary && !hasSecondary) {
    return <span className="text-2xl font-bold tracking-tight text-card-foreground">{formatCurrency(0, primaryCurrency)}</span>
  }

  return (
    <div className="flex flex-col">
      {hasPrimary && (
        <span className="text-2xl font-bold tracking-tight text-card-foreground">
          {formatCurrency(primaryAmount, primaryCurrency)}
        </span>
      )}
      {hasSecondary && (
        <span className={cn(
          "font-bold tracking-tight text-card-foreground",
          hasPrimary ? "text-base text-muted-foreground" : "text-2xl"
        )}>
          {formatCurrency(secondaryAmount, secondary)}
        </span>
      )}
    </div>
  )
}

function SortableStatCard({
  stat,
  loading,
  primaryCurrency,
  editing,
}: {
  stat: StatCardData
  loading: boolean
  primaryCurrency: "USD" | "COP"
  editing: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stat.id, disabled: !editing })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-border/60",
        editing && "ring-2 ring-primary/20 ring-dashed",
        isDragging && "opacity-50 z-50 shadow-lg"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <CurrencyLines amounts={stat.amounts} loading={loading} primaryCurrency={primaryCurrency} />
          </div>
          <div className="flex items-center gap-2">
            {editing && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none p-1 rounded-md hover:bg-muted"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.iconBg)}>
              <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
            </div>
          </div>
        </div>
        {stat.label !== "Balance total" && (
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
        )}
      </CardContent>
    </Card>
  )
}

function getStoredOrder(): string[] {
  if (typeof window === "undefined") return DEFAULT_ORDER
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length === DEFAULT_ORDER.length && DEFAULT_ORDER.every(id => parsed.includes(id))) {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_ORDER
}

export function StatCards() {
  const { user, profile } = useUser()
  const primaryCurrency: "USD" | "COP" = (profile?.currency_preference as "USD" | "COP") || "USD"

  const [cardOrder, setCardOrder] = useState<string[]>(DEFAULT_ORDER)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setCardOrder(getStoredOrder())
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setCardOrder(prev => {
        const oldIndex = prev.indexOf(active.id as string)
        const newIndex = prev.indexOf(over.id as string)
        const newOrder = arrayMove(prev, oldIndex, newIndex)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder))
        return newOrder
      })
    }
  }, [])

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

  // Separate amounts per currency
  const incomeAmounts: CurrencyAmounts = {
    usd: currentStats?.income_usd || 0,
    cop: currentStats?.income_cop || 0,
  }
  const expenseAmounts: CurrencyAmounts = {
    usd: currentStats?.expense_usd || 0,
    cop: currentStats?.expense_cop || 0,
  }
  const savingsAmounts: CurrencyAmounts = {
    usd: incomeAmounts.usd - expenseAmounts.usd,
    cop: incomeAmounts.cop - expenseAmounts.cop,
  }

  // Previous month amounts per currency for change calculation
  const prevIncomeUsd = prevStats?.income_usd || 0
  const prevIncomeCop = prevStats?.income_cop || 0
  const prevExpenseUsd = prevStats?.expense_usd || 0
  const prevExpenseCop = prevStats?.expense_cop || 0
  const prevSavingsUsd = prevIncomeUsd - prevExpenseUsd
  const prevSavingsCop = prevIncomeCop - prevExpenseCop

  // Calculate percentage change using the user's preferred currency
  function calcChange(currentUsd: number, currentCop: number, prevUsd: number, prevCop: number): number {
    const curr = primaryCurrency === 'USD' ? currentUsd : currentCop
    const prev = primaryCurrency === 'USD' ? prevUsd : prevCop
    if (prev === 0 && curr === 0) return 0
    if (prev === 0) return curr > 0 ? 100 : curr < 0 ? -100 : 0
    return ((curr - prev) / Math.abs(prev)) * 100
  }

  const balanceChange = calcChange(balance.usd, balance.cop, balance.usd, balance.cop)
  const incomeChange = calcChange(incomeAmounts.usd, incomeAmounts.cop, prevIncomeUsd, prevIncomeCop)
  const expenseChange = calcChange(expenseAmounts.usd, expenseAmounts.cop, prevExpenseUsd, prevExpenseCop)
  const savingsChange = calcChange(savingsAmounts.usd, savingsAmounts.cop, prevSavingsUsd, prevSavingsCop)

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  const loading = balanceLoading || currentStatsLoading

  const statsMap: Record<string, StatCardData> = {
    balance: {
      id: "balance",
      label: "Balance total",
      amounts: balance,
      change: formatChange(balanceChange),
      trend: "up",
      icon: Wallet,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    income: {
      id: "income",
      label: "Ingresos del mes",
      amounts: incomeAmounts,
      change: formatChange(incomeChange),
      trend: incomeChange >= 0 ? "up" : "down",
      icon: TrendingUp,
      iconBg: "bg-[hsl(158,64%,42%)]/10",
      iconColor: "text-[hsl(158,64%,42%)]",
    },
    expense: {
      id: "expense",
      label: "Gastos del mes",
      amounts: expenseAmounts,
      change: formatChange(expenseChange),
      trend: expenseChange >= 0 ? "down" : "up",
      icon: TrendingDown,
      iconBg: "bg-[hsl(var(--destructive))]/10",
      iconColor: "text-[hsl(var(--destructive))]",
    },
    savings: {
      id: "savings",
      label: "Ahorro del mes",
      amounts: savingsAmounts,
      change: formatChange(savingsChange),
      trend: savingsChange >= 0 ? "up" : "down",
      icon: PiggyBank,
      iconBg: "bg-[hsl(199,89%,48%)]/10",
      iconColor: "text-[hsl(199,89%,48%)]",
    },
  }

  const orderedStats = cardOrder.map(id => statsMap[id])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          variant={editing ? "default" : "ghost"}
          size="sm"
          onClick={() => setEditing(!editing)}
          className="gap-1.5 text-xs"
        >
          {editing ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Listo
            </>
          ) : (
            <>
              <Pencil className="h-3.5 w-3.5" />
              Editar disposición
            </>
          )}
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cardOrder} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {orderedStats.map((stat) => (
              <SortableStatCard
                key={stat.id}
                stat={stat}
                loading={loading}
                primaryCurrency={primaryCurrency}
                editing={editing}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
