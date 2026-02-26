import { Suspense } from "react"
import { TransactionsContent } from "@/components/transactions/transactions-content"

export default function TransactionsPage() {
    return (
        <Suspense fallback={<div className="h-[400px] rounded-xl bg-muted animate-pulse" />}>
            <TransactionsContent />
        </Suspense>
    )
}
