"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import type { AggregatedFinancialData, AIInsightResponse } from '@/lib/services/ai-insights'

export function useAIInsights() {
  const [insights, setInsights] = useState<AIInsightResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (data: AggregatedFinancialData) => {
    setLoading(true)
    setError(null)
    setInsights(null)

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })

      const result = await response.json()

      if (!response.ok) {
        const msg = result.error || 'Error al generar analisis'
        setError(msg)
        toast.error(msg)
        return
      }

      setInsights(result)
    } catch {
      const msg = 'Error de conexion al generar analisis'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return { insights, loading, error, generate }
}
