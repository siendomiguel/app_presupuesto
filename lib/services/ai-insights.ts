// @ts-nocheck — supabase-js type mismatch with generated Database types
import { createClient } from '@/lib/supabase/client'

export interface CategorySpending {
  category: string
  total: number
  count: number
  avgPerTransaction: number
}

export interface MerchantSpending {
  merchant: string
  total: number
  count: number
  categories: string[]
}

export interface MonthlyBreakdown {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface RecurringExpense {
  description: string
  avgAmount: number
  frequency: number
  category: string
}

export interface ItemPriceComparison {
  item: string
  prices: { merchant: string; price: number; date: string }[]
}

export interface AggregatedFinancialData {
  period: { months: number; startDate: string; endDate: string }
  currency: 'USD' | 'COP'
  summary: { totalIncome: number; totalExpenses: number; balance: number; transactionCount: number }
  byCategory: CategorySpending[]
  byMerchant: MerchantSpending[]
  monthlyTrend: MonthlyBreakdown[]
  recurringExpenses: RecurringExpense[]
  itemComparisons: ItemPriceComparison[]
}

export interface AIInsightSection {
  title: string
  items: { label: string; detail: string; amount?: number }[]
}

export interface AIInsightResponse {
  score: number
  scoreLabel: string
  strengths: string[]
  focusAreas: string[]
  sections: AIInsightSection[]
  summary: string
}

export async function aggregateTransactionData(
  userId: string,
  currency: 'USD' | 'COP',
  months: number
): Promise<AggregatedFinancialData> {
  const supabase = createClient()
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      *,
      category:categories(name),
      items:transaction_items(name, unit_price, quantity)
    `)
    .eq('user_id', userId)
    .eq('currency', currency)
    .gte('date', startStr)
    .lte('date', endStr)
    .order('date', { ascending: false })

  if (error) throw error
  if (!transactions) return emptyData(currency, months, startStr, endStr)

  let totalIncome = 0
  let totalExpenses = 0
  const categoryMap = new Map<string, { total: number; count: number }>()
  const merchantMap = new Map<string, { total: number; count: number; categories: Set<string> }>()
  const monthlyMap = new Map<string, { income: number; expenses: number }>()
  const descriptionCount = new Map<string, { count: number; totalAmount: number; category: string }>()
  const itemPrices = new Map<string, { merchant: string; price: number; date: string }[]>()

  for (const tx of transactions) {
    const amount = Number(tx.amount)
    const catName = tx.category?.name || 'Sin categoria'
    const monthKey = tx.date.substring(0, 7)
    const desc = tx.description?.trim().toLowerCase() || ''

    if (tx.type === 'income') {
      totalIncome += amount
      const m = monthlyMap.get(monthKey) || { income: 0, expenses: 0 }
      m.income += amount
      monthlyMap.set(monthKey, m)
    } else if (tx.type === 'expense') {
      totalExpenses += amount
      const m = monthlyMap.get(monthKey) || { income: 0, expenses: 0 }
      m.expenses += amount
      monthlyMap.set(monthKey, m)

      // By category
      const cat = categoryMap.get(catName) || { total: 0, count: 0 }
      cat.total += amount
      cat.count++
      categoryMap.set(catName, cat)

      // By merchant (use description as merchant proxy)
      if (desc) {
        const merch = merchantMap.get(desc) || { total: 0, count: 0, categories: new Set() }
        merch.total += amount
        merch.count++
        merch.categories.add(catName)
        merchantMap.set(desc, merch)

        // Recurring detection
        const rec = descriptionCount.get(desc) || { count: 0, totalAmount: 0, category: catName }
        rec.count++
        rec.totalAmount += amount
        descriptionCount.set(desc, rec)
      }

      // Item price comparisons
      if (tx.items && tx.items.length > 0) {
        for (const item of tx.items) {
          const itemName = item.name?.trim().toLowerCase()
          if (!itemName) continue
          const prices = itemPrices.get(itemName) || []
          prices.push({
            merchant: desc || 'desconocido',
            price: Number(item.unit_price),
            date: tx.date,
          })
          itemPrices.set(itemName, prices)
        }
      }
    }
  }

  const byCategory: CategorySpending[] = Array.from(categoryMap.entries())
    .map(([category, { total, count }]) => ({
      category,
      total: Math.round(total * 100) / 100,
      count,
      avgPerTransaction: Math.round((total / count) * 100) / 100,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15)

  const byMerchant: MerchantSpending[] = Array.from(merchantMap.entries())
    .map(([merchant, { total, count, categories }]) => ({
      merchant,
      total: Math.round(total * 100) / 100,
      count,
      categories: Array.from(categories),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15)

  const monthlyTrend: MonthlyBreakdown[] = Array.from(monthlyMap.entries())
    .map(([month, { income, expenses }]) => ({
      month,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      balance: Math.round((income - expenses) * 100) / 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const recurringExpenses: RecurringExpense[] = Array.from(descriptionCount.entries())
    .filter(([, v]) => v.count >= 3)
    .map(([description, { count, totalAmount, category }]) => ({
      description,
      avgAmount: Math.round((totalAmount / count) * 100) / 100,
      frequency: count,
      category,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)

  const itemComparisons: ItemPriceComparison[] = Array.from(itemPrices.entries())
    .filter(([, prices]) => {
      const uniqueMerchants = new Set(prices.map(p => p.merchant))
      return uniqueMerchants.size >= 2
    })
    .map(([item, prices]) => ({ item, prices: prices.slice(0, 10) }))
    .slice(0, 10)

  return {
    period: { months, startDate: startStr, endDate: endStr },
    currency,
    summary: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      balance: Math.round((totalIncome - totalExpenses) * 100) / 100,
      transactionCount: transactions.length,
    },
    byCategory,
    byMerchant,
    monthlyTrend,
    recurringExpenses,
    itemComparisons,
  }
}

function emptyData(currency: 'USD' | 'COP', months: number, startDate: string, endDate: string): AggregatedFinancialData {
  return {
    period: { months, startDate, endDate },
    currency,
    summary: { totalIncome: 0, totalExpenses: 0, balance: 0, transactionCount: 0 },
    byCategory: [],
    byMerchant: [],
    monthlyTrend: [],
    recurringExpenses: [],
    itemComparisons: [],
  }
}
