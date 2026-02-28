"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal"
import Pencil from "lucide-react/dist/esm/icons/pencil"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right"
import ListOrdered from "lucide-react/dist/esm/icons/list-ordered"
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

interface TransactionTableProps {
    transactions: Transaction[]
    loading: boolean
    onEdit: (transaction: Transaction) => void
    onDelete: (transaction: Transaction) => void
}

export function TransactionTable({ transactions, loading, onEdit, onDelete }: TransactionTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">Cargando transacciones...</p>
            </div>
        )
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No hay transacciones</p>
                <p className="text-xs text-muted-foreground mt-1">Crea tu primera transaccion para empezar</p>
            </div>
        )
    }

    const renderMobileCards = () => (
        <div className="md:hidden space-y-2">
            {transactions.map((tx) => {
                const isIncome = tx.type === "income"
                const hasItems = tx.items && tx.items.length > 0
                const isExpanded = expandedRows.has(tx.id)
                return (
                    <div
                        key={tx.id}
                        className={cn(
                            "rounded-lg border border-border bg-card p-3",
                            hasItems && "cursor-pointer"
                        )}
                        onClick={hasItems ? () => toggleRow(tx.id) : undefined}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    {hasItems && (
                                        <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                                    )}
                                    <span className="font-medium truncate">{tx.description}</span>
                                    {hasItems && (
                                        <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground shrink-0">
                                            <ListOrdered className="h-3 w-3" />
                                            {tx.items!.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                    <span>{format(parseLocalDate(tx.date), "dd MMM yyyy", { locale: es })}</span>
                                    {tx.category?.name && (
                                        <>
                                            <span className="text-border">·</span>
                                            <span className="truncate">{tx.category.name}</span>
                                        </>
                                    )}
                                    {tx.account?.name && (
                                        <>
                                            <span className="text-border">·</span>
                                            <span className="truncate">{tx.account.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <div className="text-right">
                                    <div className={cn(
                                        "font-semibold tabular-nums text-sm",
                                        isIncome ? "text-[hsl(158,64%,42%)]" : "text-foreground"
                                    )}>
                                        {isIncome ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
                                    </div>
                                    <Badge variant="outline" className={cn("text-[10px] mt-0.5", typeColors[tx.type])}>
                                        {typeLabels[tx.type]}
                                    </Badge>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(tx)} className="gap-2">
                                            <Pencil className="h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete(tx)} className="gap-2 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        {hasItems && isExpanded && (
                            <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                                {tx.items!.map((item) => (
                                    <div key={item.id} className="flex justify-between text-xs py-0.5">
                                        <span className="text-muted-foreground">
                                            {item.name} <span className="text-muted-foreground/60">×{item.quantity}</span>
                                        </span>
                                        <span className="tabular-nums font-medium">{formatCurrency(item.quantity * item.unit_price, tx.currency)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-xs pt-1 border-t border-border/50 font-semibold">
                                    <span className="text-muted-foreground">Total items</span>
                                    <span className="tabular-nums">
                                        {formatCurrency(tx.items!.reduce((s, i) => s + i.quantity * i.unit_price, 0), tx.currency)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )

    const renderDesktopTable = () => (
        <div className="hidden md:block rounded-md border border-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30px]"></TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripcion</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Cuenta</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => {
                        const isIncome = tx.type === "income"
                        const hasItems = tx.items && tx.items.length > 0
                        const isExpanded = expandedRows.has(tx.id)
                        return (
                            <>
                                <TableRow key={tx.id} className={hasItems ? "cursor-pointer" : undefined} onClick={hasItems ? () => toggleRow(tx.id) : undefined}>
                                    <TableCell className="px-2">
                                        {hasItems && (
                                            <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(parseLocalDate(tx.date), "dd MMM yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <span className="flex items-center gap-1.5">
                                            {tx.description}
                                            {hasItems && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                                    <ListOrdered className="h-3 w-3" />
                                                    {tx.items!.length}
                                                </span>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {tx.category?.name ?? "\u2014"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {tx.account?.name ?? "\u2014"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("text-xs", typeColors[tx.type])}>
                                            {typeLabels[tx.type]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right font-semibold tabular-nums",
                                        isIncome ? "text-[hsl(158,64%,42%)]" : "text-foreground"
                                    )}>
                                        {isIncome ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(tx)} className="gap-2">
                                                    <Pencil className="h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(tx)} className="gap-2 text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                {hasItems && isExpanded && (
                                    <TableRow key={`${tx.id}-items`} className="bg-muted/30 hover:bg-muted/30">
                                        <TableCell colSpan={8} className="py-2 px-4">
                                            <div className="ml-6 space-y-1">
                                                <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium pb-1 border-b border-border/50">
                                                    <span>Item</span>
                                                    <span className="text-right">Cant.</span>
                                                    <span className="text-right">Precio</span>
                                                    <span className="text-right">Subtotal</span>
                                                </div>
                                                {tx.items!.map((item) => (
                                                    <div key={item.id} className="grid grid-cols-[1fr_60px_90px_90px] gap-2 text-sm py-0.5">
                                                        <span>{item.name}</span>
                                                        <span className="text-right tabular-nums text-muted-foreground">{item.quantity}</span>
                                                        <span className="text-right tabular-nums text-muted-foreground">{formatCurrency(item.unit_price, tx.currency)}</span>
                                                        <span className="text-right tabular-nums font-medium">{formatCurrency(item.quantity * item.unit_price, tx.currency)}</span>
                                                    </div>
                                                ))}
                                                <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 text-sm pt-1 border-t border-border/50">
                                                    <span className="font-medium text-muted-foreground">Total items</span>
                                                    <span></span>
                                                    <span></span>
                                                    <span className="text-right tabular-nums font-semibold">
                                                        {formatCurrency(tx.items!.reduce((s, i) => s + i.quantity * i.unit_price, 0), tx.currency)}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )

    return (
        <>
            {renderMobileCards()}
            {renderDesktopTable()}
        </>
    )
}
