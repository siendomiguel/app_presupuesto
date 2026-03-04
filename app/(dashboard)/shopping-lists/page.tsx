"use client"

import { Suspense } from "react"
import { ShoppingListsContent } from "@/components/shopping-lists/shopping-lists-content"

export default function ShoppingListsPage() {
    return (
        <Suspense fallback={<div className="h-[400px] animate-pulse rounded-xl bg-muted" />}>
            <ShoppingListsContent />
        </Suspense>
    )
}
