"use client"

import { useMemo, useState } from "react"
import { useUser } from "@/hooks/use-user"
import { useItemsSummary, useItemPriceHistory } from "@/hooks/use-items"
import { ItemsTable } from "@/components/items/items-table"
import { ItemPriceChart } from "@/components/items/item-price-chart"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Search from "lucide-react/dist/esm/icons/search"
import GitCompareArrows from "lucide-react/dist/esm/icons/git-compare-arrows"
import X from "lucide-react/dist/esm/icons/x"
import { formatCurrency, parseLocalDate } from "@/lib/format"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { ItemPriceEntry } from "@/lib/services/items"

export function ItemsContent() {
    const { user } = useUser()
    const { items, loading } = useItemsSummary(user?.id)

    // Search
    const [search, setSearch] = useState("")

    // Selection for comparison
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [compareMode, setCompareMode] = useState(false)

    // Active item (clicked for detail)
    const [activeItem, setActiveItem] = useState<string | null>(null)

    // Fetch price history for active item
    const { history: activeHistory, loading: historyLoading } = useItemPriceHistory(user?.id, activeItem)

    // Fetch price histories for comparison items
    const compareNames = compareMode ? Array.from(selectedItems) : []
    const { history: compare1 } = useItemPriceHistory(user?.id, compareNames[0] ?? null)
    const { history: compare2 } = useItemPriceHistory(user?.id, compareNames[1] ?? null)
    const { history: compare3 } = useItemPriceHistory(user?.id, compareNames[2] ?? null)
    const { history: compare4 } = useItemPriceHistory(user?.id, compareNames[3] ?? null)
    const { history: compare5 } = useItemPriceHistory(user?.id, compareNames[4] ?? null)

    // Filter items by search
    const filteredItems = useMemo(() => {
        if (!search) return items
        const lower = search.toLowerCase()
        return items.filter(item => item.name.toLowerCase().includes(lower))
    }, [items, search])

    const toggleSelect = (name: string) => {
        setSelectedItems(prev => {
            const next = new Set(prev)
            if (next.has(name)) {
                next.delete(name)
            } else if (next.size < 5) {
                next.add(name)
            }
            return next
        })
    }

    const handleItemClick = (name: string) => {
        setActiveItem(prev => prev === name ? null : name)
        if (compareMode) return
    }

    const startCompare = () => {
        setCompareMode(true)
        setActiveItem(null)
    }

    const exitCompare = () => {
        setCompareMode(false)
        setSelectedItems(new Set())
    }

    // Build chart data
    const chartData = useMemo(() => {
        const map = new Map<string, ItemPriceEntry[]>()

        if (compareMode && selectedItems.size > 0) {
            const histories = [compare1, compare2, compare3, compare4, compare5]
            compareNames.forEach((name, i) => {
                if (histories[i]?.length) map.set(name, histories[i])
            })
        } else if (activeItem && activeHistory.length > 0) {
            map.set(activeItem, activeHistory)
        }

        return map
    }, [compareMode, selectedItems, compareNames, activeItem, activeHistory, compare1, compare2, compare3, compare4, compare5])

    const activeCurrency = activeItem
        ? items.find(i => i.name === activeItem)?.currency ?? "USD"
        : compareNames.length > 0
            ? items.find(i => i.name === compareNames[0])?.currency ?? "USD"
            : "USD"

    return (
        <>
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Items</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Busca, analiza y compara los precios de tus items
                    </p>
                </div>
                <div className="flex gap-2">
                    {!compareMode ? (
                        <Button
                            variant="outline"
                            onClick={startCompare}
                            className="gap-1.5 flex-1 sm:flex-initial"
                            disabled={items.length < 2}
                        >
                            <GitCompareArrows className="h-4 w-4" />
                            <span>Comparar</span>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={exitCompare}
                            className="gap-1.5 flex-1 sm:flex-initial"
                        >
                            <X className="h-4 w-4" />
                            <span>Salir de comparacion</span>
                        </Button>
                    )}
                </div>
            </div>

            {compareMode && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Seleccionados:</span>
                    {selectedItems.size === 0 ? (
                        <span className="text-sm text-muted-foreground/60">Selecciona items de la tabla para comparar (max 5)</span>
                    ) : (
                        Array.from(selectedItems).map(name => (
                            <Badge key={name} variant="secondary" className="gap-1">
                                {name}
                                <button onClick={() => toggleSelect(name)} className="ml-0.5 hover:text-destructive">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))
                    )}
                </div>
            )}

            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar item..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Price chart */}
            {chartData.size > 0 && (
                <div className="mb-6">
                    <ItemPriceChart data={chartData} currency={activeCurrency} />
                </div>
            )}

            {/* Active item detail (purchase history list) */}
            {activeItem && !compareMode && activeHistory.length > 0 && (
                <div className="mb-6 rounded-lg border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold mb-3">Historial de compras — {activeItem}</h3>
                    <div className="space-y-1.5">
                        {activeHistory.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-muted-foreground text-xs shrink-0">
                                        {format(parseLocalDate(entry.date), "dd MMM yy", { locale: es })}
                                    </span>
                                    <span className="truncate text-muted-foreground">{entry.transactionDescription}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs text-muted-foreground">×{entry.quantity}</span>
                                    <span className="tabular-nums font-medium">{formatCurrency(entry.unitPrice, entry.currency)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Items table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">Cargando items...</p>
                </div>
            ) : (
                <ItemsTable
                    items={filteredItems}
                    selectedItems={selectedItems}
                    onToggleSelect={toggleSelect}
                    activeItem={activeItem}
                    onItemClick={handleItemClick}
                />
            )}
        </>
    )
}
