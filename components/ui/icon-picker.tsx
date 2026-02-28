"use client"

import { useState } from "react"
import { ICON_REGISTRY, ICON_MAP } from "@/lib/icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Search from "lucide-react/dist/esm/icons/search"
import CircleDot from "lucide-react/dist/esm/icons/circle-dot"
import X from "lucide-react/dist/esm/icons/x"

interface IconPickerProps {
    value: string | null | undefined
    onChange: (value: string | null) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")

    const filtered = search.trim()
        ? ICON_REGISTRY.filter(entry => {
            const q = search.toLowerCase()
            return (
                entry.name.includes(q) ||
                entry.label.toLowerCase().includes(q) ||
                entry.keywords.some(k => k.includes(q))
            )
        })
        : ICON_REGISTRY

    const SelectedIcon = value ? ICON_MAP[value] : null

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                    {SelectedIcon ? (
                        <>
                            <SelectedIcon className="h-4 w-4" />
                            <span className="text-sm">{ICON_REGISTRY.find(e => e.name === value)?.label ?? value}</span>
                        </>
                    ) : (
                        <>
                            <CircleDot className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Seleccionar icono</span>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[290px] p-3" align="start">
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar icono..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 h-9 text-sm"
                    />
                </div>
                <ScrollArea className="h-[240px]">
                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No se encontraron iconos</p>
                    ) : (
                        <div className="grid grid-cols-6 gap-1">
                            {filtered.map(entry => {
                                const Icon = entry.component
                                const isSelected = value === entry.name
                                return (
                                    <button
                                        key={entry.name}
                                        type="button"
                                        title={entry.label}
                                        className={cn(
                                            "h-9 w-9 rounded-md flex items-center justify-center transition-colors",
                                            "hover:bg-accent",
                                            isSelected && "bg-primary/10 ring-1 ring-primary",
                                        )}
                                        onClick={() => {
                                            onChange(entry.name)
                                            setOpen(false)
                                            setSearch("")
                                        }}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
                {value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 gap-1.5 text-muted-foreground"
                        onClick={() => {
                            onChange(null)
                            setOpen(false)
                            setSearch("")
                        }}
                    >
                        <X className="h-3.5 w-3.5" />
                        Quitar icono
                    </Button>
                )}
            </PopoverContent>
        </Popover>
    )
}
