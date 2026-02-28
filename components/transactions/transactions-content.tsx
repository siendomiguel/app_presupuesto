"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { useTransactions } from "@/hooks/use-transactions"
import { useCategories } from "@/hooks/use-categories"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog"
import { DeleteConfirmationDialog } from "@/components/forms/delete-confirmation-dialog"
import { CSVImportDialog } from "@/components/forms/csv-import-dialog"
import { MergeTransactionsDialog } from "@/components/forms/merge-transactions-dialog"
import { transactionsService } from "@/lib/services/transactions"
import { Button } from "@/components/ui/button"
import Plus from "lucide-react/dist/esm/icons/plus"
import Upload from "lucide-react/dist/esm/icons/upload"
import ListChecks from "lucide-react/dist/esm/icons/list-checks"
import Merge from "lucide-react/dist/esm/icons/merge"
import X from "lucide-react/dist/esm/icons/x"
import { toast } from "sonner"
import { Database } from "@/lib/supabase/database.types"
import type { TransactionItem } from "@/lib/services/transactions"

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
    category?: Database['public']['Tables']['categories']['Row']
    account?: Database['public']['Tables']['accounts']['Row']
    items?: TransactionItem[]
}

export function TransactionsContent() {
    const { user } = useUser()
    const searchParams = useSearchParams()

    // Filter state — initialize search from URL query param
    const [search, setSearch] = useState(searchParams.get("search") ?? "")

    // Sync when URL search param changes (e.g. navigating from header search)
    useEffect(() => {
        const q = searchParams.get("search")
        if (q) setSearch(q)
    }, [searchParams])
    const [filterType, setFilterType] = useState("all")
    const [filterCategoryId, setFilterCategoryId] = useState("all")
    const [filterCurrency, setFilterCurrency] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const filters = useMemo(() => ({
        type: filterType !== "all" ? filterType as "income" | "expense" | "transfer" : undefined,
        categoryId: filterCategoryId !== "all" ? filterCategoryId : undefined,
        currency: filterCurrency !== "all" ? filterCurrency as "USD" | "COP" : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    }), [filterType, filterCategoryId, filterCurrency, startDate, endDate])

    const { transactions, loading, refetch } = useTransactions(user?.id, filters)
    const { categories } = useCategories(user?.id)

    // Search filter (client-side on description)
    const filteredTransactions = useMemo(() => {
        if (!search) return transactions
        const lower = search.toLowerCase()
        return transactions.filter(tx =>
            tx.description.toLowerCase().includes(lower)
        )
    }, [transactions, search])

    // Dialog state
    const [formOpen, setFormOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [csvImportOpen, setCsvImportOpen] = useState(false)

    // Selection / merge state
    const [selectionMode, setSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [mergeDialogOpen, setMergeDialogOpen] = useState(false)

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const exitSelectionMode = () => {
        setSelectionMode(false)
        setSelectedIds(new Set())
    }

    const selectedTransactions = useMemo(() =>
        filteredTransactions.filter(tx => selectedIds.has(tx.id)),
        [filteredTransactions, selectedIds]
    )

    const handleMergeAttempt = () => {
        if (selectedTransactions.length < 2) {
            toast.error("Selecciona al menos 2 transacciones para agrupar")
            return
        }

        const first = selectedTransactions[0]

        // Validate same date
        const dates = new Set(selectedTransactions.map(tx => tx.date))
        if (dates.size > 1) {
            toast.error("Las transacciones deben tener la misma fecha para agruparlas")
            return
        }

        // Validate same category
        const categories = new Set(selectedTransactions.map(tx => tx.category_id ?? "null"))
        if (categories.size > 1) {
            toast.error("Las transacciones deben tener la misma categoria para agruparlas")
            return
        }

        // Validate same account
        const accounts = new Set(selectedTransactions.map(tx => tx.account_id))
        if (accounts.size > 1) {
            toast.error("Las transacciones deben tener la misma cuenta para agruparlas")
            return
        }

        // Validate same type
        const types = new Set(selectedTransactions.map(tx => tx.type))
        if (types.size > 1) {
            toast.error("Las transacciones deben ser del mismo tipo para agruparlas")
            return
        }

        setMergeDialogOpen(true)
    }

    const handleMergeSuccess = () => {
        refetch()
        exitSelectionMode()
    }

    const handleEdit = (tx: Transaction) => {
        setEditingTransaction(tx)
        setFormOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await transactionsService.deleteTransaction(deleteTarget.id)
            toast.success("Transaccion eliminada")
            refetch()
        } catch {
            toast.error("Error al eliminar la transaccion")
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    const handleFormSuccess = () => {
        refetch()
        setEditingTransaction(null)
    }

    const clearFilters = () => {
        setSearch("")
        setFilterType("all")
        setFilterCategoryId("all")
        setFilterCurrency("all")
        setStartDate("")
        setEndDate("")
    }

    return (
        <>
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Transacciones</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona tus ingresos, gastos y transferencias
                    </p>
                </div>
                <div className="flex gap-2">
                    {!selectionMode ? (
                        <>
                            <Button variant="outline" onClick={() => setSelectionMode(true)} className="gap-1.5 flex-1 sm:flex-initial">
                                <ListChecks className="h-4 w-4" />
                                <span>Seleccionar</span>
                            </Button>
                            <Button variant="outline" onClick={() => setCsvImportOpen(true)} className="gap-1.5 flex-1 sm:flex-initial">
                                <Upload className="h-4 w-4" />
                                <span className="hidden sm:inline">Importar CSV</span>
                            </Button>
                            <Button onClick={() => { setEditingTransaction(null); setFormOpen(true) }} className="gap-1.5 flex-1 sm:flex-initial">
                                <Plus className="h-4 w-4" />
                                <span className="sm:inline">Nueva</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={exitSelectionMode} className="gap-1.5 flex-1 sm:flex-initial">
                                <X className="h-4 w-4" />
                                <span>Cancelar</span>
                            </Button>
                            <Button
                                onClick={handleMergeAttempt}
                                disabled={selectedIds.size < 2}
                                className="gap-1.5 flex-1 sm:flex-initial"
                            >
                                <Merge className="h-4 w-4" />
                                <span>Agrupar{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <TransactionFilters
                    search={search}
                    onSearchChange={setSearch}
                    type={filterType}
                    onTypeChange={setFilterType}
                    categoryId={filterCategoryId}
                    onCategoryIdChange={setFilterCategoryId}
                    currency={filterCurrency}
                    onCurrencyChange={setFilterCurrency}
                    startDate={startDate}
                    onStartDateChange={setStartDate}
                    endDate={endDate}
                    onEndDateChange={setEndDate}
                    categories={categories}
                    onClear={clearFilters}
                />
            </div>

            <TransactionTable
                transactions={filteredTransactions}
                loading={loading}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
            />

            {/* Floating selection bar on mobile */}
            {selectionMode && selectedIds.size > 0 && (
                <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 shadow-lg">
                        <span className="text-sm font-medium">{selectedIds.size} seleccionada{selectedIds.size !== 1 ? "s" : ""}</span>
                        <Button size="sm" onClick={handleMergeAttempt} disabled={selectedIds.size < 2} className="gap-1.5">
                            <Merge className="h-4 w-4" />
                            Agrupar
                        </Button>
                    </div>
                </div>
            )}

            <TransactionFormDialog
                open={formOpen}
                onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingTransaction(null) }}
                transaction={editingTransaction}
                onSuccess={handleFormSuccess}
            />

            <DeleteConfirmationDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                title="Eliminar transaccion"
                description="Esta accion no se puede deshacer. Se revertira el efecto en el balance de la cuenta."
                onConfirm={handleDelete}
                loading={deleting}
            />

            <CSVImportDialog
                open={csvImportOpen}
                onOpenChange={setCsvImportOpen}
                onSuccess={refetch}
            />

            {user && (
                <MergeTransactionsDialog
                    open={mergeDialogOpen}
                    onOpenChange={setMergeDialogOpen}
                    transactions={selectedTransactions}
                    userId={user.id}
                    onSuccess={handleMergeSuccess}
                />
            )}
        </>
    )
}
