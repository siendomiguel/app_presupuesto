"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, parseLocalDate } from "@/lib/format"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { transactionsService } from "@/lib/services/transactions"
import { toast } from "sonner"
import { Database } from "@/lib/supabase/database.types"
import type { TransactionItem } from "@/lib/services/transactions"

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
    category?: Database['public']['Tables']['categories']['Row']
    account?: Database['public']['Tables']['accounts']['Row']
    items?: TransactionItem[]
}

interface MergeTransactionsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transactions: Transaction[]
    userId: string
    onSuccess: () => void
}

export function MergeTransactionsDialog({
    open,
    onOpenChange,
    transactions,
    userId,
    onSuccess,
}: MergeTransactionsDialogProps) {
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)

    if (transactions.length < 2) return null

    const first = transactions[0]
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const items = transactions.map(tx => ({
        name: tx.description,
        quantity: 1,
        unit_price: tx.amount,
    }))

    const handleMerge = async () => {
        setLoading(true)
        try {
            // 1. Create merged transaction
            await transactionsService.createTransaction(
                {
                    user_id: userId,
                    type: first.type,
                    amount: totalAmount,
                    currency: first.currency,
                    description: description || `Agrupacion de ${transactions.length} transacciones`,
                    account_id: first.account_id,
                    category_id: first.category_id,
                    budget_id: first.budget_id,
                    date: first.date,
                } as any,
                items
            )

            // 2. Delete original transactions
            for (const tx of transactions) {
                await transactionsService.deleteTransaction(tx.id)
            }

            toast.success(`${transactions.length} transacciones agrupadas correctamente`)
            onOpenChange(false)
            onSuccess()
        } catch {
            toast.error("Error al agrupar las transacciones")
        } finally {
            setLoading(false)
        }
    }

    const typeLabels: Record<string, string> = {
        income: "Ingreso",
        expense: "Gasto",
        transfer: "Transferencia",
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Agrupar transacciones</DialogTitle>
                    <DialogDescription>
                        Se creara una nueva transaccion con {transactions.length} items y se eliminaran las originales.
                    </DialogDescription>
                </DialogHeader>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-muted-foreground">Fecha</span>
                        <p className="font-medium">{format(parseLocalDate(first.date), "dd MMM yyyy", { locale: es })}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Tipo</span>
                        <p className="font-medium">{typeLabels[first.type]}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Categoria</span>
                        <p className="font-medium">{first.category?.name ?? "Sin categoria"}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Cuenta</span>
                        <p className="font-medium">{first.account?.name ?? "—"}</p>
                    </div>
                </div>

                <Separator />

                {/* Description input */}
                <div className="space-y-2">
                    <Label htmlFor="merge-description">Descripcion de la transaccion agrupada</Label>
                    <Input
                        id="merge-description"
                        placeholder={`Agrupacion de ${transactions.length} transacciones`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <Separator />

                {/* Items preview */}
                <div className="space-y-2">
                    <p className="text-sm font-medium">Items resultantes</p>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-1.5 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            <span>Item</span>
                            <span className="text-right">Monto</span>
                        </div>
                        {items.map((item, i) => (
                            <div key={i} className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-sm border-t border-border/50">
                                <span className="truncate">{item.name}</span>
                                <span className="tabular-nums font-medium text-right">{formatCurrency(item.unit_price, first.currency)}</span>
                            </div>
                        ))}
                        <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-sm border-t border-border bg-muted/30 font-semibold">
                            <span>Total</span>
                            <span className="tabular-nums text-right">{formatCurrency(totalAmount, first.currency)}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleMerge} disabled={loading}>
                        {loading ? "Agrupando..." : `Agrupar ${transactions.length} transacciones`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
