"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { transactionSchema, type TransactionFormValues } from "@/lib/validations/transaction"
import { transactionsService } from "@/lib/services/transactions"
import type { TransactionItem } from "@/lib/services/transactions"
import { useUser } from "@/hooks/use-user"
import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import { useBudgets } from "@/hooks/use-budgets"
import { toast } from "sonner"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/format"

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
import { CurrencyInput } from "@/components/ui/currency-input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Database } from "@/lib/supabase/database.types"
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down"
import Plus from "lucide-react/dist/esm/icons/plus"
import X from "lucide-react/dist/esm/icons/x"
import ListOrdered from "lucide-react/dist/esm/icons/list-ordered"

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
    items?: TransactionItem[]
}

interface TransactionFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction?: Transaction | null
    defaultType?: "income" | "expense" | "transfer"
    onSuccess?: () => void
}

export function TransactionFormDialog({
    open,
    onOpenChange,
    transaction,
    defaultType = "expense",
    onSuccess,
}: TransactionFormDialogProps) {
    const { user, profile } = useUser()
    const { accounts } = useAccounts(user?.id)
    const { categories } = useCategories(user?.id)
    const { budgets } = useBudgets(user?.id)
    const [itemsOpen, setItemsOpen] = useState(false)

    const isEditing = !!transaction
    const defaultCurrency = (profile?.currency_preference as "USD" | "COP") || "USD"

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: defaultType,
            amount: 0,
            currency: defaultCurrency,
            description: "",
            account_id: "",
            category_id: null,
            budget_id: null,
            date: "",
            merchant: null,
            notes: null,
            items: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    // Reset form values every time the dialog opens
    useEffect(() => {
        if (!open) return

        if (transaction) {
            form.reset({
                type: transaction.type,
                amount: transaction.amount,
                currency: transaction.currency,
                description: transaction.description,
                account_id: transaction.account_id,
                category_id: transaction.category_id,
                budget_id: transaction.budget_id,
                date: transaction.date,
                merchant: (transaction as any).merchant ?? null,
                notes: transaction.notes,
                items: transaction.items?.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                })) ?? [],
            })
            setItemsOpen(transaction.items ? transaction.items.length > 0 : false)
        } else {
            form.reset({
                type: defaultType,
                amount: 0,
                currency: defaultCurrency,
                description: "",
                account_id: "",
                category_id: null,
                budget_id: null,
                date: format(new Date(), "yyyy-MM-dd"),
                merchant: null,
                notes: null,
                items: [],
            })
            setItemsOpen(false)
        }
    }, [open, transaction])

    const selectedType = form.watch("type")
    const watchedItems = form.watch("items") ?? []
    const transactionAmount = form.watch("amount")
    const watchedCurrency = form.watch("currency")
    const filteredCategories = categories.filter(c => c.type === selectedType || selectedType === "transfer")

    const itemsTotal = watchedItems.reduce((sum, item) => {
        return sum + (item.quantity || 1) * (item.unit_price || 0)
    }, 0)

    const onSubmit = async (values: TransactionFormValues) => {
        if (!user) return

        const { items: formItems, ...transactionValues } = values
        const items = formItems && formItems.length > 0 ? formItems : undefined

        try {
            if (isEditing) {
                await transactionsService.updateTransaction(
                    transaction.id,
                    {
                        ...transactionValues,
                        category_id: transactionValues.category_id || null,
                        budget_id: transactionValues.budget_id || null,
                        merchant: transactionValues.merchant || null,
                        notes: transactionValues.notes || null,
                    } as any,
                    items ?? []
                )
                toast.success("Transaccion actualizada")
            } else {
                await transactionsService.createTransaction(
                    {
                        ...transactionValues,
                        user_id: user.id,
                        category_id: transactionValues.category_id || null,
                        budget_id: transactionValues.budget_id || null,
                        merchant: transactionValues.merchant || null,
                        notes: transactionValues.notes || null,
                    } as any,
                    items
                )
                toast.success("Transaccion creada")
            }
            onSuccess?.()
            onOpenChange(false)
            form.reset()
            setItemsOpen(false)
        } catch (error) {
            toast.error("Error al guardar la transaccion")
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar transaccion" : "Nueva transaccion"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="expense">Gasto</SelectItem>
                                            <SelectItem value="income">Ingreso</SelectItem>
                                            <SelectItem value="transfer">Transferencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto</FormLabel>
                                        <FormControl>
                                            <CurrencyInput value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Moneda</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="COP">COP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripcion</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="account_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cuenta</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona cuenta" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.map(account => (
                                                <SelectItem key={account.id} value={account.id}>
                                                    {account.name}
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
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin categoria" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {filteredCategories.map(cat => (
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

                        <FormField
                            control={form.control}
                            name="budget_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Presupuesto</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin presupuesto" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {budgets.map(budget => (
                                                <SelectItem key={budget.id} value={budget.id}>
                                                    {budget.name}
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
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="merchant"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comercio <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Burger King, Exito, Netflix" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Items / Desglose section */}
                        <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex w-full items-center justify-between px-2 py-2 text-sm font-medium hover:bg-muted/50"
                                >
                                    <span className="flex items-center gap-2">
                                        <ListOrdered className="h-4 w-4" />
                                        Desglose
                                        <span className="text-muted-foreground font-normal">(opcional)</span>
                                        {fields.length > 0 && (
                                            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                                {fields.length}
                                            </span>
                                        )}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${itemsOpen ? "rotate-180" : ""}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-3 pt-2">
                                {fields.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-[1fr_60px_90px_70px_32px] gap-2 text-xs text-muted-foreground px-1">
                                            <span>Nombre</span>
                                            <span>Cant.</span>
                                            <span>Precio</span>
                                            <span>Subtotal</span>
                                            <span></span>
                                        </div>
                                        {fields.map((field, index) => {
                                            const qty = watchedItems[index]?.quantity || 1
                                            const price = watchedItems[index]?.unit_price || 0
                                            const subtotal = qty * price
                                            return (
                                                <div key={field.id} className="grid grid-cols-[1fr_60px_90px_70px_32px] gap-2 items-center">
                                                    <Input
                                                        placeholder="Item"
                                                        {...form.register(`items.${index}.name`)}
                                                        className="h-8 text-sm"
                                                    />
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                        className="h-8 text-sm tabular-nums"
                                                    />
                                                    <CurrencyInput
                                                        value={price}
                                                        onChange={(v) => form.setValue(`items.${index}.unit_price`, v)}
                                                        className="h-8 text-sm"
                                                    />
                                                    <span className="text-xs tabular-nums text-muted-foreground text-right pr-1">
                                                        {formatCurrency(subtotal, watchedCurrency)}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-1.5"
                                    onClick={() => append({ name: "", quantity: 1, unit_price: 0 })}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Agregar item
                                </Button>

                                {fields.length > 0 && (
                                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2 px-1">
                                        <span>Total items: <span className="font-medium text-foreground">{formatCurrency(itemsTotal, watchedCurrency)}</span></span>
                                        <span>Monto transaccion: <span className="font-medium text-foreground">{formatCurrency(transactionAmount, watchedCurrency)}</span></span>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>

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
