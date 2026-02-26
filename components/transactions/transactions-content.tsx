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
import { transactionsService } from "@/lib/services/transactions"
import { Button } from "@/components/ui/button"
import Plus from "lucide-react/dist/esm/icons/plus"
import Upload from "lucide-react/dist/esm/icons/upload"
import { toast } from "sonner"
import { Database } from "@/lib/supabase/database.types"

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
    category?: Database['public']['Tables']['categories']['Row']
    account?: Database['public']['Tables']['accounts']['Row']
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
                    <Button variant="outline" onClick={() => setCsvImportOpen(true)} className="gap-1.5 flex-1 sm:flex-initial">
                        <Upload className="h-4 w-4" />
                        <span className="sm:inline">Importar CSV</span>
                    </Button>
                    <Button onClick={() => { setEditingTransaction(null); setFormOpen(true) }} className="gap-1.5 flex-1 sm:flex-initial">
                        <Plus className="h-4 w-4" />
                        <span className="sm:inline">Nueva transaccion</span>
                    </Button>
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
            />

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
        </>
    )
}
