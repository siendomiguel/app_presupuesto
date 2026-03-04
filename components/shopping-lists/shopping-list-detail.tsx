"use client"

import { useState, useMemo } from "react"
import { useShoppingListDetail } from "@/hooks/use-shopping-lists"
import { shoppingListsService, type ShoppingListItem } from "@/lib/services/shopping-lists"
import { ShoppingListItemFormDialog } from "@/components/forms/shopping-list-item-form-dialog"
import { DeleteConfirmationDialog } from "@/components/forms/delete-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left"
import Plus from "lucide-react/dist/esm/icons/plus"
import Pencil from "lucide-react/dist/esm/icons/pencil"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ShoppingListDetailProps {
    listId: string
    onBack: () => void
}

interface GroupedItems {
    categoryName: string
    categoryColor: string | null
    items: ShoppingListItem[]
}

export function ShoppingListDetail({ listId, onBack }: ShoppingListDetailProps) {
    const { list, items, loading, refetch } = useShoppingListDetail(listId)

    const [itemFormOpen, setItemFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ShoppingListItem | null>(null)
    const [deleting, setDeleting] = useState(false)

    const grouped = useMemo(() => {
        const groups: Record<string, GroupedItems> = {}
        const uncategorized: ShoppingListItem[] = []

        for (const item of items) {
            if (item.category) {
                const key = item.category.id
                if (!groups[key]) {
                    groups[key] = {
                        categoryName: item.category.name,
                        categoryColor: item.category.color,
                        items: [],
                    }
                }
                groups[key].items.push(item)
            } else {
                uncategorized.push(item)
            }
        }

        // Sort items within groups: unchecked first, then checked
        const sortItems = (items: ShoppingListItem[]) =>
            [...items].sort((a, b) => Number(a.checked) - Number(b.checked))

        const result: GroupedItems[] = Object.values(groups).map(g => ({
            ...g,
            items: sortItems(g.items),
        }))

        // Sort groups alphabetically
        result.sort((a, b) => a.categoryName.localeCompare(b.categoryName))

        // Add uncategorized at the end
        if (uncategorized.length > 0) {
            result.push({
                categoryName: "Sin categoria",
                categoryColor: null,
                items: sortItems(uncategorized),
            })
        }

        return result
    }, [items])

    const checkedCount = items.filter(i => i.checked).length
    const totalCount = items.length
    const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

    const estimatedTotal = items.reduce((sum, i) => {
        return sum + (i.quantity * (i.unit_price ?? 0))
    }, 0)

    const handleToggle = async (item: ShoppingListItem) => {
        try {
            await shoppingListsService.toggleItemChecked(item.id, !item.checked)
            refetch()
        } catch {
            toast.error("Error al actualizar el item")
        }
    }

    const handleDeleteItem = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await shoppingListsService.deleteItem(deleteTarget.id)
            toast.success("Item eliminado")
            refetch()
        } catch {
            toast.error("Error al eliminar el item")
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    if (loading) {
        return <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
    }

    if (!list) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">Lista no encontrada</p>
                <Button variant="link" onClick={onBack}>Volver</Button>
            </div>
        )
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{list.name}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {checkedCount}/{totalCount} items completados
                            {estimatedTotal > 0 && (
                                <> · Total estimado: <span className="font-medium text-foreground">${estimatedTotal.toFixed(2)}</span></>
                            )}
                        </p>
                    </div>
                </div>
                <Button onClick={() => { setEditingItem(null); setItemFormOpen(true) }} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Agregar item
                </Button>
            </div>

            {totalCount > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progreso</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                </div>
            )}

            {totalCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-sm text-muted-foreground">No hay items en esta lista</p>
                    <p className="text-xs text-muted-foreground mt-1">Agrega items para empezar</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map((group) => (
                        <div key={group.categoryName}>
                            <div className="flex items-center gap-2 mb-3">
                                {group.categoryColor && (
                                    <div
                                        className="h-3 w-3 rounded-full shrink-0"
                                        style={{ backgroundColor: group.categoryColor }}
                                    />
                                )}
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    {group.categoryName}
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    ({group.items.filter(i => i.checked).length}/{group.items.length})
                                </span>
                            </div>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                                            item.checked
                                                ? "bg-muted/50 border-border/50"
                                                : "bg-card border-border hover:border-primary/30"
                                        )}
                                    >
                                        <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => handleToggle(item)}
                                            className="shrink-0"
                                        />
                                        <div className={cn("flex-1 min-w-0", item.checked && "line-through text-muted-foreground")}>
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={cn("text-xs text-muted-foreground", item.checked && "line-through")}>
                                                x{item.quantity}
                                            </span>
                                            {item.unit_price != null && item.unit_price > 0 && (
                                                <span className={cn("text-xs font-medium", item.checked && "line-through text-muted-foreground")}>
                                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                                </span>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => { setEditingItem(item); setItemFormOpen(true) }}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(item)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ShoppingListItemFormDialog
                open={itemFormOpen}
                onOpenChange={(open) => { setItemFormOpen(open); if (!open) setEditingItem(null) }}
                listId={listId}
                item={editingItem}
                onSuccess={() => { refetch(); setEditingItem(null) }}
            />

            <DeleteConfirmationDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                title="Eliminar item"
                description="Se eliminara este item de la lista."
                onConfirm={handleDeleteItem}
                loading={deleting}
            />
        </>
    )
}
