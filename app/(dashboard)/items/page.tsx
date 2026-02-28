import { Suspense } from "react"
import { ItemsContent } from "@/components/items/items-content"

export default function ItemsPage() {
    return (
        <Suspense fallback={<div className="h-[400px] rounded-xl bg-muted animate-pulse" />}>
            <ItemsContent />
        </Suspense>
    )
}
