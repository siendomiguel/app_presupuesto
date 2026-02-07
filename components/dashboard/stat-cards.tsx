"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "Balance total",
    value: "$12,580.00",
    change: "+2.5%",
    trend: "up" as const,
    icon: Wallet,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    label: "Ingresos del mes",
    value: "$4,250.00",
    change: "+12.3%",
    trend: "up" as const,
    icon: TrendingUp,
    iconBg: "bg-[hsl(158,64%,42%)]/10",
    iconColor: "text-[hsl(158,64%,42%)]",
  },
  {
    label: "Gastos del mes",
    value: "$2,847.50",
    change: "+5.2%",
    trend: "down" as const,
    icon: TrendingDown,
    iconBg: "bg-[hsl(var(--destructive))]/10",
    iconColor: "text-[hsl(var(--destructive))]",
  },
  {
    label: "Ahorro del mes",
    value: "$1,402.50",
    change: "+18.7%",
    trend: "up" as const,
    icon: PiggyBank,
    iconBg: "bg-[hsl(199,89%,48%)]/10",
    iconColor: "text-[hsl(199,89%,48%)]",
  },
]

export function StatCards() {
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
