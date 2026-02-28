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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, parseLocalDate } from "@/lib/format"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down"
import { Button } from "@/components/ui/button"
import type { ItemSummary } from "@/lib/services/items"

type SortKey = "name" | "purchaseCount" | "avgPrice" | "minPrice" | "maxPrice" | "totalSpent"
type SortDir = "asc" | "desc"

interface ItemsTableProps {
    items: ItemSummary[]
    selectedItems: Set<string>
    onToggleSelect: (name: string) => void
    activeItem: string | null
    onItemClick: (name: string) => void
}

export function ItemsTable({ items, selectedItems, onToggleSelect, activeItem, onItemClick }: ItemsTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>("purchaseCount")
    const [sortDir, setSortDir] = useState<SortDir>("desc")

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === "asc" ? "desc" : "asc")
        } else {
            setSortKey(key)
            setSortDir("desc")
        }
    }

    const sorted = [...items].sort((a, b) => {
        const mul = sortDir === "asc" ? 1 : -1
        if (sortKey === "name") return mul * a.name.localeCompare(b.name)
        return mul * (a[sortKey] - b[sortKey])
    })

    const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
        <Button variant="ghost" size="sm" className="h-auto p-0 font-medium hover:bg-transparent gap-1" onClick={() => toggleSort(field)}>
            {label}
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
        </Button>
    )

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No hay items registrados</p>
                <p className="text-xs text-muted-foreground mt-1">Los items aparecen cuando agregas detalles a tus transacciones</p>
            </div>
        )
    }

    // Mobile cards
    const renderMobileCards = () => (
        <div className="md:hidden space-y-2">
            {sorted.map((item) => (
                <div
                    key={item.name}
                    className={cn(
                        "rounded-lg border border-border bg-card p-3 cursor-pointer transition-colors",
                        activeItem === item.name && "ring-2 ring-primary/50"
                    )}
                    onClick={() => onItemClick(item.name)}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                            <Checkbox
                                checked={selectedItems.has(item.name)}
                                onCheckedChange={() => onToggleSelect(item.name)}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-0.5"
                            />
                            <div className="min-w-0">
                                <span className="font-medium text-sm">{item.name}</span>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                    <span>{item.purchaseCount} compra{item.purchaseCount !== 1 ? "s" : ""}</span>
                                    <span className="text-border">·</span>
                                    <span>Ultima: {format(parseLocalDate(item.lastDate), "dd MMM yy", { locale: es })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="font-semibold tabular-nums text-sm">
                                {formatCurrency(item.totalSpent, item.currency)}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                prom. {formatCurrency(item.avgPrice, item.currency)}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] border-0 bg-muted">
                            Min: {formatCurrency(item.minPrice, item.currency)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] border-0 bg-muted">
                            Max: {formatCurrency(item.maxPrice, item.currency)}
                        </Badge>
                    </div>
                </div>
            ))}
        </div>
    )

    // Desktop table
    const renderDesktopTable = () => (
        <div className="hidden md:block rounded-md border border-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead><SortHeader label="Item" field="name" /></TableHead>
                        <TableHead className="text-center"><SortHeader label="Compras" field="purchaseCount" /></TableHead>
                        <TableHead className="text-right"><SortHeader label="Precio prom." field="avgPrice" /></TableHead>
                        <TableHead className="text-right"><SortHeader label="Min" field="minPrice" /></TableHead>
                        <TableHead className="text-right"><SortHeader label="Max" field="maxPrice" /></TableHead>
                        <TableHead className="text-right"><SortHeader label="Total gastado" field="totalSpent" /></TableHead>
                        <TableHead className="text-right">Ultima compra</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted.map((item) => (
                        <TableRow
                            key={item.name}
                            className={cn(
                                "cursor-pointer",
                                activeItem === item.name && "bg-accent"
                            )}
                            onClick={() => onItemClick(item.name)}
                        >
                            <TableCell className="px-2">
                                <Checkbox
                                    checked={selectedItems.has(item.name)}
                                    onCheckedChange={() => onToggleSelect(item.name)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center tabular-nums">{item.purchaseCount}</TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(item.avgPrice, item.currency)}</TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(item.minPrice, item.currency)}</TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(item.maxPrice, item.currency)}</TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">{formatCurrency(item.totalSpent, item.currency)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                {format(parseLocalDate(item.lastDate), "dd MMM yyyy", { locale: es })}
                            </TableCell>
                        </TableRow>
                    ))}
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
