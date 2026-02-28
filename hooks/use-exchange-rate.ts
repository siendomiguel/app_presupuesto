"use client"

import { useState, useEffect } from "react"
import { exchangeRateService } from "@/lib/services/exchange-rate"
import { useUser } from "@/hooks/use-user"

export function useExchangeRate() {
    const { profile } = useUser()
    const [apiRate, setApiRate] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    const useAuto = (profile as any)?.use_auto_exchange_rate !== false
    const manualRate = (profile as any)?.manual_exchange_rate as number | null

    useEffect(() => {
        exchangeRateService.fetchRate()
            .then(setApiRate)
            .finally(() => setLoading(false))
    }, [])

    const rate = useAuto || !manualRate ? apiRate : manualRate
    const source: "api" | "manual" = useAuto || !manualRate ? "api" : "manual"

    return { rate, source, loading, apiRate }
}
