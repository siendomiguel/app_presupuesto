"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format } from "date-fns"

interface DateRangeSelectorProps {
    startDate: string
    endDate: string
    onStartDateChange: (value: string) => void
    onEndDateChange: (value: string) => void
}

const presets = [
    {
        label: "Este mes",
        getRange: () => {
            const now = new Date()
            return {
                start: format(startOfMonth(now), "yyyy-MM-dd"),
                end: format(endOfMonth(now), "yyyy-MM-dd"),
            }
        },
    },
    {
        label: "Mes anterior",
        getRange: () => {
            const prev = subMonths(new Date(), 1)
            return {
                start: format(startOfMonth(prev), "yyyy-MM-dd"),
                end: format(endOfMonth(prev), "yyyy-MM-dd"),
            }
        },
    },
    {
        label: "3 meses",
        getRange: () => {
            const now = new Date()
            return {
                start: format(startOfMonth(subMonths(now, 2)), "yyyy-MM-dd"),
                end: format(endOfMonth(now), "yyyy-MM-dd"),
            }
        },
    },
    {
        label: "Este ano",
        getRange: () => {
            const now = new Date()
            return {
                start: format(startOfYear(now), "yyyy-MM-dd"),
                end: format(endOfYear(now), "yyyy-MM-dd"),
            }
        },
    },
]

export function DateRangeSelector({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: DateRangeSelectorProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {presets.map((preset) => {
                const range = preset.getRange()
                const isActive = startDate === range.start && endDate === range.end
                return (
                    <Button
                        key={preset.label}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={cn("text-xs", !isActive && "text-muted-foreground")}
                        onClick={() => {
                            onStartDateChange(range.start)
                            onEndDateChange(range.end)
                        }}
                    >
                        {preset.label}
                    </Button>
                )
            })}
            <div className="flex items-center gap-2 ml-auto">
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-[140px] h-8 text-xs"
                />
                <span className="text-xs text-muted-foreground">a</span>
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-[140px] h-8 text-xs"
                />
            </div>
        </div>
    )
}
