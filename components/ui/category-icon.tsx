import { ICON_MAP } from "@/lib/icons"
import type { LucideIcon } from "lucide-react"

interface CategoryIconProps {
    name: string | null | undefined
    className?: string
    fallback?: LucideIcon
}

export function CategoryIcon({ name, className = "h-4 w-4", fallback: Fallback }: CategoryIconProps) {
    const Icon = name ? ICON_MAP[name] : null
    if (Icon) return <Icon className={className} />
    if (Fallback) return <Fallback className={className} />
    return null
}
