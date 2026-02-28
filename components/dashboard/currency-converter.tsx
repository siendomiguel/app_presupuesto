"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useExchangeRate } from "@/hooks/use-exchange-rate"
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down"

export function CurrencyConverter() {
    const { rate, source, loading } = useExchangeRate()
    const [usdValue, setUsdValue] = useState("")
    const [copValue, setCopValue] = useState("")
    const [direction, setDirection] = useState<"usd-cop" | "cop-usd">("usd-cop")

    const handleUsdChange = (val: string) => {
        setUsdValue(val)
        if (rate && val) {
            const num = parseFloat(val)
            if (!isNaN(num)) setCopValue((num * rate).toFixed(0))
            else setCopValue("")
        } else {
            setCopValue("")
        }
    }

    const handleCopChange = (val: string) => {
        setCopValue(val)
        if (rate && val) {
            const num = parseFloat(val)
            if (!isNaN(num)) setUsdValue((num / rate).toFixed(2))
            else setUsdValue("")
        } else {
            setUsdValue("")
        }
    }

    const toggleDirection = () => {
        setDirection(d => d === "usd-cop" ? "cop-usd" : "usd-cop")
    }

    if (loading) {
        return (
            <Card className="border-border/60">
                <CardContent className="flex items-center justify-center h-[120px]">
                    <p className="text-sm text-muted-foreground">Cargando tasa...</p>
                </CardContent>
            </Card>
        )
    }

    const topCurrency = direction === "usd-cop" ? "USD" : "COP"
    const bottomCurrency = direction === "usd-cop" ? "COP" : "USD"
    const topValue = direction === "usd-cop" ? usdValue : copValue
    const bottomValue = direction === "usd-cop" ? copValue : usdValue
    const topHandler = direction === "usd-cop" ? handleUsdChange : handleCopChange
    const bottomHandler = direction === "usd-cop" ? handleCopChange : handleUsdChange

    return (
        <Card className="border-border/60">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-card-foreground">Conversor</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                        {source === "api" ? "API" : "Manual"}
                    </Badge>
                </div>
                {rate && (
                    <p className="text-xs text-muted-foreground">1 USD = {rate.toLocaleString('es-CO')} COP</p>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                {!rate ? (
                    <p className="text-sm text-muted-foreground">No se pudo obtener la tasa de cambio</p>
                ) : (
                    <>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">{topCurrency}</span>
                            <Input
                                type="number"
                                placeholder="0"
                                value={topValue}
                                onChange={(e) => topHandler(e.target.value)}
                                className="pl-12 tabular-nums"
                            />
                        </div>
                        <div className="flex justify-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleDirection}>
                                <ArrowUpDown className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">{bottomCurrency}</span>
                            <Input
                                type="number"
                                placeholder="0"
                                value={bottomValue}
                                onChange={(e) => bottomHandler(e.target.value)}
                                className="pl-12 tabular-nums"
                            />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
