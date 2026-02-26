"use client"

import { useState } from "react"
import { useUser } from "@/hooks/use-user"
import { useProfile } from "@/hooks/use-profile"
import { profilesService } from "@/lib/services/profiles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export function ProfileSettings() {
    const { user, profile: contextProfile, refetchProfile } = useUser()
    const { profile, loading, refetch } = useProfile(user?.id)
    const [saving, setSaving] = useState(false)
    const [fullName, setFullName] = useState("")
    const [currencyPref, setCurrencyPref] = useState<"USD" | "COP">(
        (contextProfile?.currency_preference as "USD" | "COP") || "USD"
    )
    const [initialized, setInitialized] = useState(false)

    if (profile && !initialized) {
        setFullName(profile.full_name ?? "")
        setCurrencyPref(profile.currency_preference)
        setInitialized(true)
    }

    const handleSave = async () => {
        if (!user) return
        setSaving(true)
        try {
            await profilesService.updateProfile(user.id, {
                full_name: fullName || null,
                currency_preference: currencyPref,
            })
            toast.success("Perfil actualizado")
            refetch()
            refetchProfile()
        } catch {
            toast.error("Error al actualizar el perfil")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="h-[200px] rounded-xl bg-muted animate-pulse" />
    }

    return (
        <Card className="border-border/60">
            <CardHeader>
                <CardTitle className="text-base">Informacion personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email ?? ""} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Moneda preferida</Label>
                    <Select value={currencyPref} onValueChange={(v) => setCurrencyPref(v as "USD" | "COP")}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD - Dolar</SelectItem>
                            <SelectItem value="COP">COP - Peso colombiano</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
            </CardContent>
        </Card>
    )
}
