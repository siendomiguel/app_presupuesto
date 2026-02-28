"use client"

import { useState } from "react"
import Bell from "lucide-react/dist/esm/icons/bell"
import Search from "lucide-react/dist/esm/icons/search"
import Menu from "lucide-react/dist/esm/icons/menu"
import Plus from "lucide-react/dist/esm/icons/plus"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard"
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down"
import Target from "lucide-react/dist/esm/icons/target"
import PieChart from "lucide-react/dist/esm/icons/pie-chart"
import Settings from "lucide-react/dist/esm/icons/settings"
import CreditCard from "lucide-react/dist/esm/icons/credit-card"
import Package from "lucide-react/dist/esm/icons/package"
import BellOff from "lucide-react/dist/esm/icons/bell-off"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog"

const mobileNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Transacciones", icon: ArrowUpDown, href: "/transactions" },
  { label: "Items", icon: Package, href: "/items" },
  { label: "Presupuestos", icon: Target, href: "/budgets" },
  { label: "Reportes", icon: PieChart, href: "/reports" },
  { label: "Tarjetas", icon: CreditCard, href: "/cards" },
  { label: "Ajustes", icon: Settings, href: "/settings" },
]

interface DashboardHeaderProps {
  menuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
}

export function DashboardHeader({ menuOpen: menuOpenProp, onMenuOpenChange }: DashboardHeaderProps = {}) {
  const { user } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Transaction dialog state
  const [txDialogOpen, setTxDialogOpen] = useState(false)

  // Mobile menu state (use prop if provided, otherwise local state)
  const [menuOpenLocal, setMenuOpenLocal] = useState(false)
  const menuOpen = menuOpenProp ?? menuOpenLocal
  const setMenuOpen = onMenuOpenChange ?? setMenuOpenLocal

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifDismissed, setNotifDismissed] = useState(false)

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U"

  const displayName = user?.user_metadata?.full_name || user?.email || "Usuario"
  const displayEmail = user?.email || ""

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/sign-in")
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const handleNewExpense = () => {
    setTxDialogOpen(true)
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0">
              <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
              <div className="flex items-center gap-2 px-4 h-16 border-b border-border">
                <Image src="/Logo texto.png" alt="Fintrack - Tu presupuesto bajo control" width={160} height={36} className="object-contain" />
              </div>
              <nav className="py-4 px-3">
                <ul className="flex flex-col gap-1">
                  {mobileNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar transacciones..."
              className="w-[280px] pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="hidden sm:flex gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleNewExpense}
          >
            <Plus className="h-4 w-4" />
            Nuevo gasto
          </Button>
          <Button size="icon" variant="ghost" className="sm:hidden" onClick={handleNewExpense}>
            <Plus className="h-5 w-5" />
            <span className="sr-only">Nuevo gasto</span>
          </Button>

          <Popover open={notifOpen} onOpenChange={(open) => { setNotifOpen(open); if (open) setNotifDismissed(true) }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {!notifDismissed && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--destructive))]" />
                )}
                <span className="sr-only">Notificaciones</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Notificaciones</p>
              </div>
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <BellOff className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                <p className="text-xs text-muted-foreground mt-0.5">Te avisaremos cuando haya algo nuevo</p>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{displayName}</span>
                  <span className="text-xs text-muted-foreground">{displayEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Configuracion</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Cerrar sesion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <TransactionFormDialog
        open={txDialogOpen}
        onOpenChange={setTxDialogOpen}
        defaultType="expense"
      />
    </>
  )
}
