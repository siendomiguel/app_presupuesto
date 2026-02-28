const CACHE_KEY = 'fintrack_exchange_rate'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

interface CachedRate {
    rate: number
    timestamp: number
}

export class ExchangeRateService {
    async fetchRate(): Promise<number | null> {
        // Check localStorage cache first
        try {
            const cached = localStorage.getItem(CACHE_KEY)
            if (cached) {
                const parsed: CachedRate = JSON.parse(cached)
                if (Date.now() - parsed.timestamp < CACHE_TTL) {
                    return parsed.rate
                }
            }
        } catch {}

        // Fetch from API
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/USD')
            if (!res.ok) return null
            const data = await res.json()
            const rate = data?.rates?.COP
            if (typeof rate !== 'number') return null

            // Cache result
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }))
            } catch {}

            return rate
        } catch {
            return null
        }
    }
}

export const exchangeRateService = new ExchangeRateService()
