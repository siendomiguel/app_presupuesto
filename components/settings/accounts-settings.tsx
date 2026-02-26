"use client"

import { useState } from "react"
import { useUser } from "@/hooks/use-user"
import { useAccounts } from "@/hooks/use-accounts"
import { accountsService } from "@/lib/services/accounts"
import { AccountFormDialog } from "@/components/forms/account-form-dialog"
import { DeleteConfirmationDialog } from "@/components/forms/delete-confirmation-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Plus from "lucide-react/dist/esm/icons/plus"
import Pencil from "lucide-react/dist/esm/icons/pencil"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"
import { formatCurrency } from "@/lib/format"
import { toast } from "sonner"
import { Database } from "@/lib/supabase/database.types"

type Account = Database['public']['Tables']['accounts']['Row']

const typeLabels: Record<string, string> = {
    bank: "Banco",
    cash: "Efectivo",
    credit_card: "Tarjeta de credito",
    savings: "Ahorros",
}

export function AccountsSettings() {
    const { user } = useUser()
    const { accounts, loading, refetch } = useAccounts(user?.id)

    const [formOpen, setFormOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await accountsService.deleteAccount(deleteTarget.id)
            toast.success("Cuenta eliminada")
            refetch()
        } catch {
            toast.error("Error al eliminar la cuenta. Puede tener transacciones asociadas.")
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    return (
        <>
            <Card className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Cuentas</CardTitle>
                    <Button size="sm" onClick={() => { setEditingAccount(null); setFormOpen(true) }} className="gap-1">
                        <Plus className="h-4 w-4" />
                        Nueva
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[100px] rounded-xl bg-muted animate-pulse" />
                    ) : accounts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay cuentas registradas</p>
                    ) : (
                        <div className="space-y-2">
                            {accounts.map(account => (
                                <div key={account.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{account.name}</span>
                                            <Badge variant="outline" className="text-xs">{typeLabels[account.type]}</Badge>
                                        </div>
                                        <div className="flex gap-3 mt-1">
                                            {account.balance_usd !== 0 && (
                                                <span className={`text-xs ${account.balance_usd < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                                    {formatCurrency(account.balance_usd, "USD")}
                                                </span>
                                            )}
                                            {account.balance_cop !== 0 && (
                                                <span className={`text-xs ${account.balance_cop < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                                    {formatCurrency(account.balance_cop, "COP")}
                                                </span>
                                            )}
                                            {account.balance_usd === 0 && account.balance_cop === 0 && (
                                                <span className="text-xs text-muted-foreground">Sin saldo</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8"
                                            onClick={() => { setEditingAccount(account); setFormOpen(true) }}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                                            onClick={() => setDeleteTarget(account)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AccountFormDialog
                open={formOpen}
                onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingAccount(null) }}
                account={editingAccount}
                onSuccess={refetch}
            />

            <DeleteConfirmationDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                title="Eliminar cuenta"
                description="Esta accion no se puede deshacer. Se eliminara la cuenta y todas sus transacciones."
                onConfirm={handleDelete}
                loading={deleting}
            />
        </>
    )
}
