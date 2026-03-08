"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { shoppingListSchema, type ShoppingListFormValues } from "@/lib/validations/shopping-list"
import { shoppingListsService } from "@/lib/services/shopping-lists"
import { useUser } from "@/hooks/use-user"
import { toast } from "sonner"

import {
    FloatingPanel,
    FloatingPanelContent,
    FloatingPanelHeader,
    FloatingPanelTitle,
} from "@/components/ui/floating-panel"
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

interface ShoppingListFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    list?: { id: string; name: string } | null
    onSuccess?: () => void
}

export function ShoppingListFormDialog({
    open,
    onOpenChange,
    list,
    onSuccess,
}: ShoppingListFormDialogProps) {
    const { user } = useUser()
    const isEditing = !!list

    const form = useForm<ShoppingListFormValues>({
        resolver: zodResolver(shoppingListSchema),
        defaultValues: {
            name: list?.name ?? "",
        },
    })

    const onSubmit = async (values: ShoppingListFormValues) => {
        if (!user) return

        try {
            if (isEditing) {
                await shoppingListsService.updateShoppingList(list.id, values)
                toast.success("Lista actualizada")
            } else {
                await shoppingListsService.createShoppingList({
                    user_id: user.id,
                    name: values.name,
                })
                toast.success("Lista creada")
            }
            onSuccess?.()
            onOpenChange(false)
            form.reset()
        } catch (error) {
            toast.error("Error al guardar la lista")
            console.error(error)
        }
    }

    return (
        <FloatingPanel open={open} onOpenChange={onOpenChange}>
            <FloatingPanelContent size="sm">
                <FloatingPanelHeader>
                    <FloatingPanelTitle>{isEditing ? "Editar lista" : "Nueva lista de compras"}</FloatingPanelTitle>
                </FloatingPanelHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Supermercado semanal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </FloatingPanelContent>
        </FloatingPanel>
    )
}
