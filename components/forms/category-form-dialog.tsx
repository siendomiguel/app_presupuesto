"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category"
import { categoriesService } from "@/lib/services/categories"
import { useUser } from "@/hooks/use-user"
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
import { IconPicker } from "@/components/ui/icon-picker"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Database } from "@/lib/supabase/database.types"

type Category = Database['public']['Tables']['categories']['Row']

const COLORS = [
    { label: "Verde", value: "#2cb67d" },
    { label: "Azul", value: "#0ea5e9" },
    { label: "Rojo", value: "#ef4444" },
    { label: "Amarillo", value: "#eab308" },
    { label: "Morado", value: "#8b5cf6" },
    { label: "Naranja", value: "#f97316" },
    { label: "Rosa", value: "#ec4899" },
    { label: "Gris", value: "#6b7280" },
]

interface CategoryFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: Category | null
    onSuccess?: () => void
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryFormDialogProps) {
    const { user } = useUser()
    const isEditing = !!category

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: category
            ? {
                name: category.name,
                type: category.type,
                icon: category.icon,
                color: category.color,
            }
            : {
                name: "",
                type: "expense",
                icon: null,
                color: "#2cb67d",
            },
    })

    const onSubmit = async (values: CategoryFormValues) => {
        if (!user) return

        try {
            if (isEditing) {
                await categoriesService.updateCategory(category.id, {
                    ...values,
                    icon: values.icon || null,
                    color: values.color || null,
                })
                toast.success("Categoria actualizada")
            } else {
                await categoriesService.createCategory({
                    ...values,
                    user_id: user.id,
                    icon: values.icon || null,
                    color: values.color || null,
                })
                toast.success("Categoria creada")
            }
            onSuccess?.()
            onOpenChange(false)
            form.reset()
        } catch (error) {
            toast.error("Error al guardar la categoria")
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar categoria" : "Nueva categoria"}</DialogTitle>
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
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="expense">Gasto</SelectItem>
                                            <SelectItem value="income">Ingreso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona color" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {COLORS.map(c => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.value }} />
                                                        {c.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icono (opcional)</FormLabel>
                                    <FormControl>
                                        <IconPicker value={field.value} onChange={field.onChange} />
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
            </DialogContent>
        </Dialog>
    )
}
