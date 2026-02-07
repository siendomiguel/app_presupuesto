import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCards } from "@/components/stat-cards"
import { SpendingChart } from "@/components/spending-chart"
import { BudgetProgress } from "@/components/budget-progress"
import { RecentTransactions } from "@/components/recent-transactions"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { QuickActions } from "@/components/quick-actions"

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Resumen de tus finanzas personales - Febrero 2026
              </p>
            </div>

            <StatCards />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SpendingChart />
              </div>
              <div className="flex flex-col gap-6">
                <CategoryBreakdown />
                <QuickActions />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RecentTransactions />
              <BudgetProgress />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
