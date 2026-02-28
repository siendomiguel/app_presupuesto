"use client"

import { useCallback, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { useSwipeGesture } from "@/hooks/use-swipe-gesture"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false)

    useSwipeGesture({
        onSwipeRight: useCallback(() => setMenuOpen(true), []),
        onSwipeLeft: useCallback(() => setMenuOpen(false), []),
    })

    return (
        <div className="flex h-screen overflow-hidden">
            <SidebarNav />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
