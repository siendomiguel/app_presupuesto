"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { useAIInsights } from "@/hooks/use-ai-insights"
import { aggregateTransactionData } from "@/lib/services/ai-insights"
import { ScoreRing } from "@/components/ai-insights/score-ring"
import { formatCurrency } from "@/lib/format"
import Sparkles from "lucide-react/dist/esm/icons/sparkles"
import Repeat from "lucide-react/dist/esm/icons/repeat"
import Scale from "lucide-react/dist/esm/icons/scale"
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb"
import Target from "lucide-react/dist/esm/icons/target"
import Heart from "lucide-react/dist/esm/icons/heart"
import BookOpen from "lucide-react/dist/esm/icons/book-open"
import TrendingUp from "lucide-react/dist/esm/icons/trending-up"
import TrendingDown from "lucide-react/dist/esm/icons/trending-down"
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle"
import type { LucideIcon } from "lucide-react"

const SECTION_ICONS: Record<string, LucideIcon> = {
  "Gastos Recurrentes": Repeat,
  "Comparacion de Precios": Scale,
  "Oportunidades de Ahorro": Lightbulb,
  "Metas de Ahorro": Target,
  "Salud Financiera": Heart,
  "Recomendaciones Financieras": BookOpen,
}

const PERIOD_OPTIONS = [
  { label: "3 meses", value: 3 },
  { label: "6 meses", value: 6 },
  { label: "12 meses", value: 12 },
]

export function AIInsightsContent() {
  const { user, profile } = useUser()
  const defaultCurrency = (profile?.currency_preference as "USD" | "COP") || "USD"
  const [currency, setCurrency] = useState<"USD" | "COP">(defaultCurrency)
  const [months, setMonths] = useState(3)
  const { insights, loading, error, generate } = useAIInsights()

  const handleGenerate = async () => {
    if (!user?.id) return
    try {
      const data = await aggregateTransactionData(user.id, currency, months)
      await generate(data)
    } catch {
      // Error handled by hook
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IA Insights</h1>
          <p className="text-sm text-muted-foreground">
            Analisis inteligente de tus finanzas con recomendaciones personalizadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Currency toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["USD", "COP"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  currency === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {/* Period selector */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMonths(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  months === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={loading || !user?.id}
          size="lg"
          className="gap-2"
        >
          <Sparkles className="h-5 w-5" />
          {loading ? "Analizando tus transacciones..." : "Generar analisis"}
        </Button>
      </div>

      {/* Error state */}
      {error && !loading && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className={i === 0 ? "md:col-span-2" : ""}>
              <CardHeader>
                <div className="h-5 w-40 rounded bg-muted animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!insights && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Descubre patrones en tus finanzas</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            Haz clic en &quot;Generar analisis&quot; para obtener recomendaciones personalizadas
            basadas en tus transacciones de los ultimos {months} meses.
          </p>
        </div>
      )}

      {/* Results */}
      {insights && !loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Score + Summary card */}
          <Card className="md:col-span-2">
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <ScoreRing score={insights.score} />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    Puntuacion: {insights.score}/100 — {insights.scoreLabel}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{insights.summary}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Fortalezas</p>
                    {insights.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-sm">
                        <TrendingUp className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Areas de enfoque</p>
                    {insights.focusAreas.map((a, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-sm">
                        <TrendingDown className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section cards */}
          {insights.sections.map((section) => {
            const Icon = SECTION_ICONS[section.title] || Sparkles
            return (
              <Card key={section.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item, i) => (
                    <div key={i} className="border-b border-border pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.amount != null && (
                          <span className="text-sm font-semibold text-primary">
                            {formatCurrency(item.amount, currency)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
