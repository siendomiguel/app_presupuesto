import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AggregatedFinancialData, AIInsightResponse } from '@/lib/services/ai-insights'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const SYSTEM_PROMPT = `Eres un asesor financiero personal experto. Analiza los datos financieros del usuario y genera recomendaciones en espanol.

IMPORTANTE: Responde UNICAMENTE con un JSON valido (sin markdown, sin backticks). El JSON debe tener esta estructura exacta:

{
  "score": <numero 1-100>,
  "scoreLabel": "<etiqueta: Critico/Bajo/Regular/Bueno/Excelente>",
  "strengths": ["<fortaleza 1>", "<fortaleza 2>", ...],
  "focusAreas": ["<area de mejora 1>", "<area de mejora 2>", ...],
  "sections": [
    {
      "title": "Gastos Recurrentes",
      "items": [{"label": "<nombre>", "detail": "<descripcion>", "amount": <numero opcional>}]
    },
    {
      "title": "Comparacion de Precios",
      "items": [{"label": "<producto>", "detail": "<comparacion entre comercios>"}]
    },
    {
      "title": "Oportunidades de Ahorro",
      "items": [{"label": "<oportunidad>", "detail": "<como ahorrar>", "amount": <ahorro estimado>}]
    },
    {
      "title": "Metas de Ahorro",
      "items": [{"label": "<meta sugerida>", "detail": "<como lograrla>", "amount": <monto sugerido>}]
    },
    {
      "title": "Salud Financiera",
      "items": [{"label": "<aspecto>", "detail": "<evaluacion>"}]
    },
    {
      "title": "Recomendaciones Financieras",
      "items": [{"label": "<regla o principio>", "detail": "<explicacion y como aplica al usuario>", "amount": <monto referencia opcional>}]
    }
  ],
  "summary": "<resumen ejecutivo de 2-3 oraciones>"
}

Reglas:
- Si no hay suficientes datos para una seccion, incluye al menos 1 item con una recomendacion general
- Los montos deben ser numeros, no strings
- Se conciso pero util en cada recomendacion
- La puntuacion (score) debe basarse en: ratio ingreso/gasto, diversificacion, gastos recurrentes controlados, tendencia mensual

Reglas financieras que DEBES evaluar en "Recomendaciones Financieras":
- Regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro/deudas. Evalua si el usuario cumple estos porcentajes
- Vivienda no debe superar el 30% de los ingresos. Si lo excede, recomendar buscar mas fuentes de ingreso o reducir gastos de vivienda
- Fondo de emergencia: deberia tener ahorrado 3-6 meses de gastos mensuales
- Transporte no debe superar el 15% de los ingresos
- Alimentacion idealmente entre 10-15% de los ingresos
- Suscripciones y entretenimiento no deben superar el 10%
- Si los gastos superan el 90% de los ingresos, alertar que esta en zona de riesgo
- Recomendar diversificar fuentes de ingreso si depende de una sola
- Evaluar si hay gastos hormiga (pequenos gastos frecuentes que suman mucho)
- Solo incluye las reglas que sean relevantes segun los datos del usuario (no repitas todas si no aplican)

- Responde SOLO el JSON, sin texto adicional`

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key de IA no configurada. Agrega OPENROUTER_API_KEY en las variables de entorno.' },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body: { data: AggregatedFinancialData } = await request.json()
    const { data } = body

    if (!data || !data.summary) {
      return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
    }

    if (data.summary.transactionCount < 5) {
      return NextResponse.json(
        { error: 'Necesitas al menos 5 transacciones para generar un analisis. Sigue registrando tus movimientos.' },
        { status: 422 }
      )
    }

    const userMessage = `Analiza estos datos financieros (moneda: ${data.currency}):

RESUMEN: Ingresos: ${data.summary.totalIncome}, Gastos: ${data.summary.totalExpenses}, Balance: ${data.summary.balance}, Transacciones: ${data.summary.transactionCount}, Periodo: ${data.period.months} meses

GASTOS POR CATEGORIA:
${data.byCategory.map(c => `- ${c.category}: ${c.total} (${c.count} transacciones, promedio ${c.avgPerTransaction})`).join('\n')}

COMERCIOS PRINCIPALES:
${data.byMerchant.map(m => `- ${m.merchant}: ${m.total} (${m.count} veces)`).join('\n')}

TENDENCIA MENSUAL:
${data.monthlyTrend.map(m => `- ${m.month}: Ingresos ${m.income}, Gastos ${m.expenses}, Balance ${m.balance}`).join('\n')}

GASTOS RECURRENTES:
${data.recurringExpenses.length > 0 ? data.recurringExpenses.map(r => `- ${r.description}: promedio ${r.avgAmount}, ${r.frequency} veces (${r.category})`).join('\n') : 'No se detectaron gastos recurrentes claros'}

COMPARACION DE PRECIOS DE ITEMS:
${data.itemComparisons.length > 0 ? data.itemComparisons.map(i => `- ${i.item}: ${i.prices.map(p => `${p.merchant} $${p.price}`).join(', ')}`).join('\n') : 'No hay suficientes datos de items para comparar'}`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000',
        'X-Title': 'Fintrack AI Insights',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free',
        max_tokens: 4096,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('OpenRouter error:', response.status, errBody)
      if (response.status === 429) {
        return NextResponse.json({ error: 'Limite de solicitudes alcanzado. Intenta de nuevo en unos minutos.' }, { status: 429 })
      }
      return NextResponse.json({ error: 'Error al comunicarse con el servicio de IA.' }, { status: 502 })
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'La IA no genero una respuesta.' }, { status: 502 })
    }

    // Parse JSON, handling possible markdown wrapping
    let cleaned = content.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    let insights: AIInsightResponse
    try {
      insights = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse AI response:', cleaned.substring(0, 500))
      return NextResponse.json({ error: 'La respuesta de IA no tuvo el formato esperado. Intenta de nuevo.' }, { status: 502 })
    }

    return NextResponse.json(insights)
  } catch (err) {
    console.error('AI insights error:', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
