"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Pencil from "lucide-react/dist/esm/icons/pencil"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"
import { formatCurrency, parseLocalDate } from "@/lib/format"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Database } from "@/lib/supabase/database.types"
import type { TransactionItem } from "@/lib/services/transactions"

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
    category?: Database['public']['Tables']['categories']['Row']
    account?: Database['public']['Tables']['accounts']['Row']
    items?: TransactionItem[]
}

const typeLabels: Record<string, string> = {
    income: "Ingreso",
    expense: "Gasto",
    transfer: "Transferencia",
}

const typeColors: Record<string, string> = {
    income: "bg-[hsl(158,64%,42%)]/10 text-[hsl(158,64%,42%)] border-0",
    expense: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-0",
    transfer: "bg-[hsl(199,89%,48%)]/10 text-[hsl(199,89%,48%)] border-0",
}

interface TransactionDetailSheetProps {
    transaction: Transaction | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit: (transaction: Transaction) => void
    onDelete: (transaction: Transaction) => void
}

export function TransactionDetailSheet({
    transaction,
    open,
    onOpenChange,
    onEdit,
    onDelete,
}: TransactionDetailSheetProps) {
    if (!transaction) return null

    const tx = transaction
    const isIncome = tx.type === "income"
    const hasItems = tx.items && tx.items.length > 0

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
                <SheetHeader className="px-5 pt-5 pb-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <SheetTitle className="text-lg leading-tight">{tx.description}</SheetTitle>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Badge variant="outline" className={cn("text-xs", typeColors[tx.type])}>
                                    {typeLabels[tx.type]}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {format(parseLocalDate(tx.date), "EEEE, dd 'de' MMMM yyyy", { locale: es })}
                                </span>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {/* Amount */}
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Monto</p>
                        <p className={cn(
                            "text-2xl font-bold tabular-nums",
                            isIncome ? "text-[hsl(158,64%,42%)]" : "text-foreground"
                        )}>
                            {isIncome ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tx.currency}</p>
                    </div>

                    {/* Details grid */}
                    <div className="space-y-3">
                        <DetailRow label="Categoria" value={tx.category?.name ?? "Sin categoria"} />
                        <DetailRow label="Cuenta" value={tx.account?.name ?? "—"} />
                        <DetailRow label="Fecha" value={format(parseLocalDate(tx.date), "dd MMM yyyy", { locale: es })} />
                        {tx.notes && <DetailRow label="Notas" value={tx.notes} />}
                        <DetailRow label="Creado" value={format(new Date(tx.created_at), "dd MMM yyyy, HH:mm", { locale: es })} />
                        {tx.updated_at !== tx.created_at && (
                            <DetailRow label="Actualizado" value={format(new Date(tx.updated_at), "dd MMM yyyy, HH:mm", { locale: es })} />
                        )}
                    </div>

                    {/* Items */}
                    {hasItems && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-sm font-semibold mb-2">Items ({tx.items!.length})</p>
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <div className="grid grid-cols-[1fr_50px_auto_auto] gap-2 px-3 py-1.5 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                        <span>Item</span>
                                        <span className="text-right">Cant.</span>
                                        <span className="text-right">Precio</span>
                                        <span className="text-right">Subtotal</span>
                                    </div>
                                    {tx.items!.map((item) => (
                                        <div key={item.id} className="grid grid-cols-[1fr_50px_auto_auto] gap-2 px-3 py-2 text-sm border-t border-border/50">
                                            <span className="truncate">{item.name}</span>
                                            <span className="text-right tabular-nums text-muted-foreground">{item.quantity}</span>
                                            <span className="text-right tabular-nums text-muted-foreground">{formatCurrency(item.unit_price, tx.currency)}</span>
                                            <span className="text-right tabular-nums font-medium">{formatCurrency(item.quantity * item.unit_price, tx.currency)}</span>
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 border-t border-border bg-muted/30 font-semibold text-sm">
                                        <span>Total</span>
                                        <span className="tabular-nums text-right">
                                            {formatCurrency(tx.items!.reduce((s, i) => s + i.quantity * i.unit_price, 0), tx.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer actions */}
                <div className="border-t border-border px-5 py-3 flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 gap-1.5"
                        onClick={() => { onOpenChange(false); onEdit(tx) }}
                    >
                        <Pencil className="h-4 w-4" />
                        Editar
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { onOpenChange(false); onDelete(tx) }}
                    >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="text-sm font-medium text-right">{value}</span>
        </div>
    )
}
