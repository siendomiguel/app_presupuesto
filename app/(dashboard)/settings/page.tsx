import { Suspense } from "react"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="h-[400px] rounded-xl bg-muted animate-pulse" />}>
            <SettingsContent />
        </Suspense>
    )
}
