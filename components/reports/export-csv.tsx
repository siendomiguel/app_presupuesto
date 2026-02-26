"use client"

import { Button } from "@/components/ui/button"
import FileDown from "lucide-react/dist/esm/icons/file-down"
import { Database } from "@/lib/supabase/database.types"

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
    category?: Database['public']['Tables']['categories']['Row']
    account?: Database['public']['Tables']['accounts']['Row']
}

interface ExportCsvProps {
    transactions: Transaction[]
}

export function ExportCsv({ transactions }: ExportCsvProps) {
    const handleExport = () => {
        const headers = ["Fecha", "Descripcion", "Comercio", "Tipo", "Monto", "Moneda", "Categoria", "Cuenta", "Notas"]
        const rows = transactions.map(tx => [
            tx.date,
            `"${tx.description.replace(/"/g, '""')}"`,
            `"${((tx as any).merchant ?? "").replace(/"/g, '""')}"`,
            tx.type,
            tx.amount.toString(),
            tx.currency,
            tx.category?.name ?? "",
            tx.account?.name ?? "",
            `"${(tx.notes ?? "").replace(/"/g, '""')}"`,
        ])

        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `fintrack-transacciones-${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5" disabled={transactions.length === 0}>
            <FileDown className="h-4 w-4" />
            Exportar CSV
        </Button>
    )
}
