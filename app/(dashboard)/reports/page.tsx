import { Suspense } from "react"
import { ReportsContent } from "@/components/reports/reports-content"

export default function ReportsPage() {
    return (
        <Suspense fallback={<div className="h-[400px] rounded-xl bg-muted animate-pulse" />}>
            <ReportsContent />
        </Suspense>
    )
}
