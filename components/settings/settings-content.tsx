"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { CategoriesSettings } from "@/components/settings/categories-settings"
import { AccountsSettings } from "@/components/settings/accounts-settings"

const validTabs = ["profile", "categories", "accounts"]

export function SettingsContent() {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get("tab")
    const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : "profile"

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Ajustes</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Administra tu perfil, categorias y cuentas
                </p>
            </div>

            <Tabs defaultValue={defaultTab} key={defaultTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="accounts">Cuentas</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileSettings />
                </TabsContent>

                <TabsContent value="categories">
                    <CategoriesSettings />
                </TabsContent>

                <TabsContent value="accounts">
                    <AccountsSettings />
                </TabsContent>
            </Tabs>
        </>
    )
}
