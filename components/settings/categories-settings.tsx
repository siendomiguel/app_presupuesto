"use client"

import { useState } from "react"
import { useUser } from "@/hooks/use-user"
import { useCategories } from "@/hooks/use-categories"
import { categoriesService } from "@/lib/services/categories"
import { CategoryFormDialog } from "@/components/forms/category-form-dialog"
import { DeleteConfirmationDialog } from "@/components/forms/delete-confirmation-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Plus from "lucide-react/dist/esm/icons/plus"
import Pencil from "lucide-react/dist/esm/icons/pencil"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"
import { CategoryIcon } from "@/components/ui/category-icon"
import { toast } from "sonner"
import { Database } from "@/lib/supabase/database.types"

type Category = Database['public']['Tables']['categories']['Row']

export function CategoriesSettings() {
    const { user } = useUser()
    const { categories, loading, refetch } = useCategories(user?.id)

    const [formOpen, setFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await categoriesService.deleteCategory(deleteTarget.id)
            toast.success("Categoria eliminada")
            refetch()
        } catch {
            toast.error("Error al eliminar la categoria")
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    const expenseCategories = categories.filter(c => c.type === "expense")
    const incomeCategories = categories.filter(c => c.type === "income")

    return (
        <>
            <Card className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Categorias</CardTitle>
                    <Button size="sm" onClick={() => { setEditingCategory(null); setFormOpen(true) }} className="gap-1">
                        <Plus className="h-4 w-4" />
                        Nueva
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[100px] rounded-xl bg-muted animate-pulse" />
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Gastos</h3>
                                <div className="space-y-2">
                                    {expenseCategories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                {cat.color && (
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                                )}
                                                <CategoryIcon name={cat.icon} className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{cat.name}</span>
                                                {cat.is_default && <Badge variant="outline" className="text-xs">Default</Badge>}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                                    onClick={() => { setEditingCategory(cat); setFormOpen(true) }}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                                                    onClick={() => setDeleteTarget(cat)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {expenseCategories.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No hay categorias de gasto</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Ingresos</h3>
                                <div className="space-y-2">
                                    {incomeCategories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                {cat.color && (
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                                )}
                                                <CategoryIcon name={cat.icon} className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{cat.name}</span>
                                                {cat.is_default && <Badge variant="outline" className="text-xs">Default</Badge>}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                                    onClick={() => { setEditingCategory(cat); setFormOpen(true) }}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                                                    onClick={() => setDeleteTarget(cat)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {incomeCategories.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No hay categorias de ingreso</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CategoryFormDialog
                open={formOpen}
                onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingCategory(null) }}
                category={editingCategory}
                onSuccess={refetch}
            />

            <DeleteConfirmationDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                title="Eliminar categoria"
                description="Se eliminara la categoria. Las transacciones asociadas no se eliminaran pero perderan su categoria."
                onConfirm={handleDelete}
                loading={deleting}
            />
        </>
    )
}
