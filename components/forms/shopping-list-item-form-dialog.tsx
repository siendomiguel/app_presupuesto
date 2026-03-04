"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { shoppingListItemSchema, type ShoppingListItemFormValues } from "@/lib/validations/shopping-list"
import { shoppingListsService, type ShoppingListItem } from "@/lib/services/shopping-lists"
import { useUser } from "@/hooks/use-user"
import { useCategories } from "@/hooks/use-categories"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const NO_CATEGORY = "__none__"

interface ShoppingListItemFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    listId: string
    item?: ShoppingListItem | null
    onSuccess?: () => void
}

export function ShoppingListItemFormDialog({
    open,
    onOpenChange,
    listId,
    item,
    onSuccess,
}: ShoppingListItemFormDialogProps) {
    const { user } = useUser()
    const { categories } = useCategories(user?.id, "expense")
    const isEditing = !!item

    const form = useForm<ShoppingListItemFormValues>({
        resolver: zodResolver(shoppingListItemSchema),
        defaultValues: item
            ? {
                name: item.name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                category_id: item.category_id,
            }
            : {
                name: "",
                quantity: 1,
                unit_price: null,
                category_id: null,
            },
    })

    const onSubmit = async (values: ShoppingListItemFormValues) => {
        try {
            const payload = {
                name: values.name,
                quantity: values.quantity,
                unit_price: values.unit_price ?? null,
                category_id: values.category_id || null,
            }

            if (isEditing) {
                await shoppingListsService.updateItem(item.id, payload)
                toast.success("Item actualizado")
            } else {
                await shoppingListsService.addItem({
                    ...payload,
                    list_id: listId,
                })
                toast.success("Item agregado")
            }
            onSuccess?.()
            onOpenChange(false)
            form.reset()
        } catch (error) {
            toast.error("Error al guardar el item")
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar item" : "Agregar item"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Leche" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cantidad</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio unit. (opcional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={field.value ?? ""}
                                                onChange={e => {
                                                    const val = e.target.value
                                                    field.onChange(val === "" ? null : parseFloat(val))
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria (opcional)</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val === NO_CATEGORY ? null : val)}
                                        defaultValue={field.value ?? NO_CATEGORY}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin categoria" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={NO_CATEGORY}>Sin categoria</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Agregar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
