"use client"

import { useState } from "react"
import { useUser } from "@/hooks/use-user"
import { useShoppingLists } from "@/hooks/use-shopping-lists"
import { shoppingListsService } from "@/lib/services/shopping-lists"
import { ShoppingListFormDialog } from "@/components/forms/shopping-list-form-dialog"
import { ShoppingListDetail } from "@/components/shopping-lists/shopping-list-detail"
import { DeleteConfirmationDialog } from "@/components/forms/delete-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Plus from "lucide-react/dist/esm/icons/plus"
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart"
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical"
import Pencil from "lucide-react/dist/esm/icons/pencil"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"
import Copy from "lucide-react/dist/esm/icons/copy"
import { toast } from "sonner"
import type { ShoppingListWithCounts } from "@/lib/services/shopping-lists"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ShoppingListsContent() {
    const { user } = useUser()
    const { lists, loading, refetch } = useShoppingLists(user?.id)

    const [selectedListId, setSelectedListId] = useState<string | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [editingList, setEditingList] = useState<ShoppingListWithCounts | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ShoppingListWithCounts | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleEdit = (list: ShoppingListWithCounts, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingList(list)
        setFormOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await shoppingListsService.deleteShoppingList(deleteTarget.id)
            toast.success("Lista eliminada")
            refetch()
        } catch {
            toast.error("Error al eliminar la lista")
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    const handleDuplicate = async (list: ShoppingListWithCounts, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!user) return
        try {
            await shoppingListsService.duplicateShoppingList(list.id, user.id)
            toast.success("Lista duplicada")
            refetch()
        } catch {
            toast.error("Error al duplicar la lista")
        }
    }

    const handleFormSuccess = () => {
        refetch()
        setEditingList(null)
    }

    if (selectedListId) {
        return (
            <ShoppingListDetail
                listId={selectedListId}
                onBack={() => {
                    setSelectedListId(null)
                    refetch()
                }}
            />
        )
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Lista de compras</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Organiza tus compras con listas y controla tu presupuesto
                    </p>
                </div>
                <Button onClick={() => { setEditingList(null); setFormOpen(true) }} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Nueva lista
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-[140px] rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : lists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No hay listas de compras</p>
                    <p className="text-xs text-muted-foreground mt-1">Crea tu primera lista para organizar tus compras</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lists.map((list) => {
                        const progress = list.total_items > 0
                            ? Math.round((list.checked_items / list.total_items) * 100)
                            : 0

                        return (
                            <Card
                                key={list.id}
                                className="cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => setSelectedListId(list.id)}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <ShoppingCart className="h-5 w-5 text-primary shrink-0" />
                                            <h3 className="font-semibold text-sm truncate">{list.name}</h3>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => handleEdit(list, e)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleDuplicate(list, e)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Duplicar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(list) }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{list.checked_items}/{list.total_items} items</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                        {list.estimated_total > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Total estimado: <span className="font-medium text-foreground">${list.estimated_total.toFixed(2)}</span>
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            <ShoppingListFormDialog
                open={formOpen}
                onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingList(null) }}
                list={editingList}
                onSuccess={handleFormSuccess}
            />

            <DeleteConfirmationDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                title="Eliminar lista"
                description="Esta accion no se puede deshacer. Se eliminara la lista y todos sus items."
                onConfirm={handleDelete}
                loading={deleting}
            />
        </>
    )
}
