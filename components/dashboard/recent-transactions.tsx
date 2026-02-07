"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ShoppingCart,
  Zap,
  UtensilsCrossed,
  Car,
  Heart,
  Gamepad2,
  Building2,
  ArrowRight,
} from "lucide-react"

const transactions = [
  {
    id: 1,
    description: "Supermercado Central",
    category: "Alimentacion",
    amount: -85.40,
    date: "Hoy",
    icon: ShoppingCart,
    iconBg: "bg-[hsl(158,64%,42%)]/10",
    iconColor: "text-[hsl(158,64%,42%)]",
  },
  {
    id: 2,
    description: "Nomina Empresa",
    category: "Ingreso",
    amount: 4250.00,
    date: "Hoy",
    icon: Building2,
    iconBg: "bg-[hsl(199,89%,48%)]/10",
    iconColor: "text-[hsl(199,89%,48%)]",
  },
  {
    id: 3,
    description: "Electricidad",
    category: "Servicios",
    amount: -125.80,
    date: "Ayer",
    icon: Zap,
    iconBg: "bg-[hsl(43,96%,56%)]/10",
    iconColor: "text-[hsl(43,96%,56%)]",
  },
  {
    id: 4,
    description: "Restaurante El Buen Sabor",
    category: "Alimentacion",
    amount: -42.50,
    date: "Ayer",
    icon: UtensilsCrossed,
    iconBg: "bg-[hsl(158,64%,42%)]/10",
    iconColor: "text-[hsl(158,64%,42%)]",
  },
  {
    id: 5,
    description: "Gasolina",
    category: "Transporte",
    amount: -60.00,
    date: "Feb 3",
    icon: Car,
    iconBg: "bg-[hsl(199,89%,48%)]/10",
    iconColor: "text-[hsl(199,89%,48%)]",
  },
  {
    id: 6,
    description: "Farmacia SaludTotal",
    category: "Salud",
    amount: -28.90,
    date: "Feb 2",
    icon: Heart,
    iconBg: "bg-[hsl(262,52%,56%)]/10",
    iconColor: "text-[hsl(262,52%,56%)]",
  },
  {
    id: 7,
    description: "Netflix",
    category: "Entretenimiento",
    amount: -15.99,
    date: "Feb 1",
    icon: Gamepad2,
    iconBg: "bg-[hsl(var(--destructive))]/10",
    iconColor: "text-[hsl(var(--destructive))]",
  },
]

export function RecentTransactions() {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">Transacciones recientes</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1">
          Ver todas
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tx.iconBg)}>
              <tx.icon className={cn("h-4 w-4", tx.iconColor)} />
            </div>
            <div className="flex flex-1 flex-col min-w-0">
              <span className="text-sm font-medium text-card-foreground truncate">{tx.description}</span>
              <span className="text-xs text-muted-foreground">{tx.category}</span>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  tx.amount > 0 ? "text-[hsl(158,64%,42%)]" : "text-card-foreground"
                )}
              >
                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">{tx.date}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
