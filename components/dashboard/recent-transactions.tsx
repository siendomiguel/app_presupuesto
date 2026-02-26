"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart"
import Zap from "lucide-react/dist/esm/icons/zap"
import UtensilsCrossed from "lucide-react/dist/esm/icons/utensils-crossed"
import Car from "lucide-react/dist/esm/icons/car"
import Heart from "lucide-react/dist/esm/icons/heart"
import Gamepad2 from "lucide-react/dist/esm/icons/gamepad-2"
import Building2 from "lucide-react/dist/esm/icons/building-2"
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right"
import TrendingUp from "lucide-react/dist/esm/icons/trending-up"
import TrendingDown from "lucide-react/dist/esm/icons/trending-down"
import { useUser } from "@/hooks/use-user"
import { useTransactions } from "@/hooks/use-transactions"
import { formatCurrency, parseLocalDate } from "@/lib/format"
import { format, isToday, isYesterday } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

const iconMap: Record<string, any> = {
  "Alimentación": UtensilsCrossed,
  "Transporte": Car,
  "Servicios": Zap,
  "Entretenimiento": Gamepad2,
  "Salud": Heart,
  "Educación": Building2,
  "Vivienda": Building2,
  "Salario": Building2,
  "Otros Ingresos": TrendingUp,
}

const colorMap: Record<string, { bg: string; text: string }> = {
  "Alimentación": { bg: "bg-[hsl(158,64%,42%)]/10", text: "text-[hsl(158,64%,42%)]" },
  "Transporte": { bg: "bg-[hsl(199,89%,48%)]/10", text: "text-[hsl(199,89%,48%)]" },
  "Servicios": { bg: "bg-[hsl(43,96%,56%)]/10", text: "text-[hsl(43,96%,56%)]" },
  "Entretenimiento": { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]" },
  "Salud": { bg: "bg-[hsl(262,52%,56%)]/10", text: "text-[hsl(262,52%,56%)]" },
  "Educación": { bg: "bg-[hsl(199,89%,48%)]/10", text: "text-[hsl(199,89%,48%)]" },
  "Vivienda": { bg: "bg-[hsl(43,96%,56%)]/10", text: "text-[hsl(43,96%,56%)]" },
  "Salario": { bg: "bg-[hsl(158,64%,42%)]/10", text: "text-[hsl(158,64%,42%)]" },
  "Otros Ingresos": { bg: "bg-[hsl(199,89%,48%)]/10", text: "text-[hsl(199,89%,48%)]" },
}

export function RecentTransactions() {
  const { user } = useUser()
  const { transactions, loading } = useTransactions(user?.id)

  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr)
    if (isToday(date)) return "Hoy"
    if (isYesterday(date)) return "Ayer"
    return format(date, "MMM d", { locale: es })
  }


  const recentTransactions = transactions.slice(0, 7)

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">Transacciones recientes</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1" asChild>
          <Link href="/transactions">
            Ver todas
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Cargando transacciones...</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No hay transacciones recientes</p>
          </div>
        ) : (
          recentTransactions.map((tx) => {
            const categoryName = tx.category?.name || "Sin categoría"
            const Icon = iconMap[categoryName] || ShoppingCart
            const colors = colorMap[categoryName] || { bg: "bg-muted", text: "text-muted-foreground" }
            const isIncome = tx.type === 'income'
            const amount = isIncome ? tx.amount : -tx.amount

            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colors.bg)}>
                  <Icon className={cn("h-4 w-4", colors.text)} />
                </div>
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-sm font-medium text-card-foreground truncate">{tx.description}</span>
                  <span className="text-xs text-muted-foreground">{categoryName}</span>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isIncome ? "text-[hsl(158,64%,42%)]" : "text-card-foreground"
                    )}
                  >
                    {isIncome ? "+" : ""}{formatCurrency(Math.abs(amount), tx.currency)}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
