"use client"

import { cn } from "@/lib/utils"
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard"
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down"
import Target from "lucide-react/dist/esm/icons/target"
import PieChart from "lucide-react/dist/esm/icons/pie-chart"
import Settings from "lucide-react/dist/esm/icons/settings"
import CreditCard from "lucide-react/dist/esm/icons/credit-card"
import LogOut from "lucide-react/dist/esm/icons/log-out"
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left"
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Transacciones", icon: ArrowUpDown, href: "/transactions" },
  { label: "Presupuestos", icon: Target, href: "/budgets" },
  { label: "Reportes", icon: PieChart, href: "/reports" },
  { label: "Tarjetas", icon: CreditCard, href: "/cards" },
  { label: "Ajustes", icon: Settings, href: "/settings" },
]

export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/sign-in")
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 relative",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className={cn("flex items-center gap-2 px-5 h-16 border-b border-border", collapsed && "justify-center px-2")}>
        {collapsed ? (
          <Image src="/Logo.png" alt="Fintrack" width={36} height={36} className="shrink-0" />
        ) : (
          <Image src="/Logo texto.png" alt="Fintrack - Tu presupuesto bajo control" width={180} height={40} className="shrink-0 object-contain" />
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-border bg-card shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        <span className="sr-only">{collapsed ? "Expandir" : "Colapsar"} barra lateral</span>
      </Button>

      <nav className="flex-1 py-4 px-3">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Cerrar sesion</span>}
        </button>
      </div>
    </aside>
  )
}
