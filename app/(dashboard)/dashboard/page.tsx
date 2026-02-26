"use client"

import { Suspense, useState } from "react"
import { StatCards } from "@/components/dashboard/stat-cards"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CurrentMonth } from "@/components/dashboard/current-month"
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog"

export default function DashboardPage() {
    const [txDialogOpen, setTxDialogOpen] = useState(false)
    const [txDefaultType, setTxDefaultType] = useState<"income" | "expense" | "transfer">("expense")

    const openTxDialog = (type: "income" | "expense" | "transfer") => {
        setTxDefaultType(type)
        setTxDialogOpen(true)
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Resumen de tus finanzas personales - <Suspense><CurrentMonth /></Suspense>
                </p>
            </div>

            <Suspense fallback={<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length: 4}).map((_, i) => <div key={i} className="h-[120px] rounded-xl bg-muted animate-pulse" />)}</div>}>
                <StatCards />
            </Suspense>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Suspense fallback={<div className="h-[350px] rounded-xl bg-muted animate-pulse" />}>
                        <SpendingChart />
                    </Suspense>
                </div>
                <div className="flex flex-col gap-6">
                    <Suspense fallback={<div className="h-[300px] rounded-xl bg-muted animate-pulse" />}>
                        <CategoryBreakdown />
                    </Suspense>
                    <QuickActions
                        onAddExpense={() => openTxDialog("expense")}
                        onAddIncome={() => openTxDialog("income")}
                        onTransfer={() => openTxDialog("transfer")}
                    />
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Suspense fallback={<div className="h-[350px] rounded-xl bg-muted animate-pulse" />}>
                    <RecentTransactions />
                </Suspense>
                <Suspense fallback={<div className="h-[350px] rounded-xl bg-muted animate-pulse" />}>
                    <BudgetProgress />
                </Suspense>
            </div>

            <TransactionFormDialog
                open={txDialogOpen}
                onOpenChange={setTxDialogOpen}
                defaultType={txDefaultType}
            />
        </>
    )
}
