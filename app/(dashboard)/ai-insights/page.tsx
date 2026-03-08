import { Suspense } from "react"
import { AIInsightsContent } from "@/components/ai-insights/ai-insights-content"

export default function AIInsightsPage() {
    return (
        <Suspense fallback={<div className="h-[400px] rounded-xl bg-muted animate-pulse" />}>
            <AIInsightsContent />
        </Suspense>
    )
}
