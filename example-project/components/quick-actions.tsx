"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  ArrowDownToLine,
  Repeat,
  FileText,
} from "lucide-react"

const actions = [
  {
    label: "Agregar gasto",
    icon: Plus,
    variant: "default" as const,
  },
  {
    label: "Registrar ingreso",
    icon: ArrowDownToLine,
    variant: "outline" as const,
  },
  {
    label: "Transferencia",
    icon: Repeat,
    variant: "outline" as const,
  },
  {
    label: "Exportar reporte",
    icon: FileText,
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">Acciones rapidas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-auto flex-col gap-2 py-4 text-xs font-medium"
          >
            <action.icon className="h-5 w-5" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
