"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Search from "lucide-react/dist/esm/icons/search"
import X from "lucide-react/dist/esm/icons/x"
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days"
import { Database } from "@/lib/supabase/database.types"
import { startOfMonth, endOfMonth, format } from "date-fns"

type Category = Database['public']['Tables']['categories']['Row']

interface TransactionFiltersProps {
    search: string
    onSearchChange: (value: string) => void
    type: string
    onTypeChange: (value: string) => void
    categoryId: string
    onCategoryIdChange: (value: string) => void
    currency: string
    onCurrencyChange: (value: string) => void
    startDate: string
    onStartDateChange: (value: string) => void
    endDate: string
    onEndDateChange: (value: string) => void
    categories: Category[]
    onClear: () => void
}

export function TransactionFilters({
    search,
    onSearchChange,
    type,
    onTypeChange,
    categoryId,
    onCategoryIdChange,
    currency,
    onCurrencyChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    categories,
    onClear,
}: TransactionFiltersProps) {
    const hasFilters = search || type !== "all" || categoryId !== "all" || currency !== "all" || startDate || endDate

    const now = new Date()
    const monthStart = format(startOfMonth(now), "yyyy-MM-dd")
    const monthEnd = format(endOfMonth(now), "yyyy-MM-dd")
    const isCurrentMonth = startDate === monthStart && endDate === monthEnd

    const handleCurrentMonth = () => {
        onStartDateChange(monthStart)
        onEndDateChange(monthEnd)
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Search bar - full width */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por descripcion..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Selects row - wrap on mobile */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <Select value={type} onValueChange={onTypeChange}>
                    <SelectTrigger className="sm:w-[140px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="expense">Gastos</SelectItem>
                        <SelectItem value="income">Ingresos</SelectItem>
                        <SelectItem value="transfer">Transferencias</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={categoryId} onValueChange={onCategoryIdChange}>
                    <SelectTrigger className="sm:w-[160px]">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={currency} onValueChange={onCurrencyChange}>
                    <SelectTrigger className="sm:w-[110px]">
                        <SelectValue placeholder="Moneda" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Date range row */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:flex sm:gap-3 sm:items-center">
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="sm:w-[150px]"
                    placeholder="Desde"
                />
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="sm:w-[150px]"
                    placeholder="Hasta"
                />
                <Button
                    variant={isCurrentMonth ? "default" : "outline"}
                    size="sm"
                    onClick={handleCurrentMonth}
                    className="gap-1.5 whitespace-nowrap"
                >
                    <CalendarDays className="h-4 w-4" />
                    <span className="hidden sm:inline">Mes actual</span>
                    <span className="sm:hidden">Mes</span>
                </Button>
            </div>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 self-start">
                    <X className="h-4 w-4" />
                    Limpiar filtros
                </Button>
            )}
        </div>
    )
}
