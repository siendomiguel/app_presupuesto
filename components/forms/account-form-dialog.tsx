"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { accountSchema, type AccountFormValues } from "@/lib/validations/account"
import { accountsService } from "@/lib/services/accounts"
import { useUser } from "@/hooks/use-user"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import { CurrencyInput } from "@/components/ui/currency-input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Database } from "@/lib/supabase/database.types"

type Account = Database['public']['Tables']['accounts']['Row']

interface AccountFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    account?: Account | null
    onSuccess?: () => void
}

export function AccountFormDialog({
    open,
    onOpenChange,
    account,
    onSuccess,
}: AccountFormDialogProps) {
    const { user } = useUser()
    const isEditing = !!account

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: account
            ? {
                name: account.name,
                type: account.type,
                balance_usd: account.balance_usd,
                balance_cop: account.balance_cop,
            }
            : {
                name: "",
                type: "bank",
                balance_usd: 0,
                balance_cop: 0,
            },
    })

    const onSubmit = async (values: AccountFormValues) => {
        if (!user) return

        try {
            if (isEditing) {
                await accountsService.updateAccount(account.id, values)
                toast.success("Cuenta actualizada")
            } else {
                await accountsService.createAccount({
                    ...values,
                    user_id: user.id,
                })
                toast.success("Cuenta creada")
            }
            onSuccess?.()
            onOpenChange(false)
            form.reset()
        } catch (error) {
            toast.error("Error al guardar la cuenta")
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar cuenta" : "Nueva cuenta"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "El balance se actualiza con cada transaccion. Usa ajustar saldo para corregir diferencias."
                            : "Ingresa el saldo actual de la cuenta."}
                    </DialogDescription>
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
                                            <SelectItem value="bank">Banco</SelectItem>
                                            <SelectItem value="cash">Efectivo</SelectItem>
                                            <SelectItem value="credit_card">Tarjeta de credito</SelectItem>
                                            <SelectItem value="savings">Ahorros</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="balance_usd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isEditing ? "Ajustar saldo USD" : "Saldo inicial USD"}</FormLabel>
                                        <FormControl>
                                            <CurrencyInput value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="balance_cop"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isEditing ? "Ajustar saldo COP" : "Saldo inicial COP"}</FormLabel>
                                        <FormControl>
                                            <CurrencyInput value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
