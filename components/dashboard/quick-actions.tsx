"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Plus from "lucide-react/dist/esm/icons/plus"
import ArrowDownToLine from "lucide-react/dist/esm/icons/arrow-down-to-line"
import Repeat from "lucide-react/dist/esm/icons/repeat"
import FileText from "lucide-react/dist/esm/icons/file-text"

interface QuickActionsProps {
    onAddExpense?: () => void
    onAddIncome?: () => void
    onTransfer?: () => void
    onExport?: () => void
}

export function QuickActions({ onAddExpense, onAddIncome, onTransfer, onExport }: QuickActionsProps) {
    const actions = [
        { label: "Agregar gasto", icon: Plus, className: "bg-[hsl(0,72%,51%)] text-white hover:bg-[hsl(0,72%,45%)]", onClick: onAddExpense },
        { label: "Registrar ingreso", icon: ArrowDownToLine, className: "bg-[hsl(158,64%,42%)] text-white hover:bg-[hsl(158,64%,36%)]", onClick: onAddIncome },
        { label: "Transferencia", icon: Repeat, className: "", onClick: onTransfer },
        { label: "Exportar reporte", icon: FileText, className: "", onClick: onExport },
    ]

    return (
        <Card className="border-border/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-card-foreground">Acciones rapidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant={action.className ? undefined : "outline"}
                        className={`h-auto flex-col gap-2 py-4 text-xs font-medium ${action.className}`}
                        onClick={action.onClick}
                    >
                        <action.icon className="h-5 w-5" />
                        {action.label}
                    </Button>
                ))}
            </CardContent>
        </Card>
    )
}
