import { transactionsService } from "@/lib/services/transactions"
import { Database } from "@/lib/supabase/database.types"

type Account = Database['public']['Tables']['accounts']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export interface ColumnMapping {
    date: number | null
    description: number | null
    type: number | null
    amount: number | null
    currency: number | null
    category: number | null
    account: number | null
    merchant: number | null
    notes: number | null
}

export interface DefaultValues {
    type: "income" | "expense" | "transfer" | ""
    currency: "USD" | "COP" | ""
    account_id: string
}

export interface ImportResult {
    imported: number
    errors: { row: number; message: string }[]
}

/** Known header aliases → field mapping */
const HEADER_ALIASES: Record<string, keyof ColumnMapping> = {
    // Date
    fecha: "date",
    date: "date",
    // Description
    descripcion: "description",
    description: "description",
    // Type
    tipo: "type",
    type: "type",
    // Amount
    monto: "amount",
    amount: "amount",
    "precio unid.": "amount",
    "precio unid": "amount",
    precio: "amount",
    valor: "amount",
    "total compra": "amount",
    // Currency
    moneda: "currency",
    currency: "currency",
    // Category
    categoria: "category",
    category: "category",
    concepto: "category",
    // Account
    cuenta: "account",
    account: "account",
    "metodo de pago": "account",
    // Merchant
    comercio: "merchant",
    merchant: "merchant",
    establecimiento: "merchant",
    tienda: "merchant",
    "compra en": "merchant",
    lugar: "merchant",
    // Notes
    notas: "notes",
    notes: "notes",
}

/** Auto-detect column mapping from CSV headers */
export function detectColumnMapping(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {
        date: null,
        description: null,
        type: null,
        amount: null,
        currency: null,
        category: null,
        account: null,
        merchant: null,
        notes: null,
    }

    headers.forEach((header, index) => {
        const normalized = header.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const field = HEADER_ALIASES[normalized]
        if (field && mapping[field] === null) {
            mapping[field] = index
        }
    })

    return mapping
}

/** Parse a date string in YYYY-MM-DD, DD/MM/YYYY, or D/M/YYYY format to YYYY-MM-DD */
function parseDate(value: string): string | null {
    const trimmed = value.trim()

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed
    }

    // D/M/YYYY or DD/MM/YYYY (flexible)
    const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (match) {
        const day = match[1].padStart(2, "0")
        const month = match[2].padStart(2, "0")
        return `${match[3]}-${month}-${day}`
    }

    return null
}

/** Parse amount string, stripping currency symbols, thousand separators */
function parseAmount(value: string): number | null {
    let cleaned = value.trim()
    // Strip currency symbols and spaces
    cleaned = cleaned.replace(/[$€£¥]/g, "").trim()

    // If has both . and , -> determine which is decimal separator
    if (cleaned.includes(".") && cleaned.includes(",")) {
        const lastDot = cleaned.lastIndexOf(".")
        const lastComma = cleaned.lastIndexOf(",")
        if (lastComma > lastDot) {
            // comma is decimal: 1.000,50 → 1000.50
            cleaned = cleaned.replace(/\./g, "").replace(",", ".")
        } else {
            // dot is decimal: 1,000.50 → 1000.50
            cleaned = cleaned.replace(/,/g, "")
        }
    } else if (cleaned.includes(",")) {
        // Could be decimal comma (3,50) or thousand separator (1,000)
        // If exactly 2 digits after comma, treat as decimal
        if (/,\d{2}$/.test(cleaned) && !/,\d{3}$/.test(cleaned)) {
            cleaned = cleaned.replace(",", ".")
        } else {
            // Thousand separator: 1,000 → 1000
            cleaned = cleaned.replace(/,/g, "")
        }
    } else if (cleaned.includes(".")) {
        // Could be decimal dot (3.50) or thousand separator (1.000)
        // If exactly 3 digits after last dot and no other dots, could be thousand sep
        // But if there are multiple dots (1.000.000) → definitely thousand seps
        const dots = cleaned.split(".")
        if (dots.length > 2) {
            // Multiple dots = thousand separators: 1.000.000 → 1000000
            cleaned = cleaned.replace(/\./g, "")
        }
        // Single dot: keep as decimal (standard parseFloat behavior)
    }

    const num = parseFloat(cleaned)
    return isNaN(num) ? null : Math.abs(num)
}

/** Parse type value accepting Spanish and English */
function parseType(value: string): "income" | "expense" | "transfer" | null {
    const v = value.trim().toLowerCase()
    if (v === "income" || v === "ingreso") return "income"
    if (v === "expense" || v === "gasto") return "expense"
    if (v === "transfer" || v === "transferencia") return "transfer"
    return null
}

/** Parse currency value */
function parseCurrency(value: string): "USD" | "COP" | null {
    const v = value.trim().toUpperCase()
    if (v === "USD" || v === "COP") return v
    return null
}

/** Extract unique category names from CSV that don't exist in user's categories */
export function findUnknownCategories(
    rows: string[][],
    mapping: ColumnMapping,
    categories: Category[],
): string[] {
    if (mapping.category === null) return []

    const categorySet = new Set(categories.map(c => c.name.toLowerCase()))
    const unknownSet = new Set<string>()

    rows.forEach(row => {
        const name = mapping.category !== null && mapping.category < row.length
            ? row[mapping.category].trim()
            : ""
        if (name && !categorySet.has(name.toLowerCase())) {
            unknownSet.add(name)
        }
    })

    return Array.from(unknownSet).sort()
}

/** Process CSV rows into validated transaction data.
 *  categoryOverrides maps unknown category names (lowercase) → resolved category IDs */
export function processCSVRows(
    rows: string[][],
    mapping: ColumnMapping,
    defaults: DefaultValues,
    accounts: Account[],
    categories: Category[],
    userId: string,
    categoryOverrides?: Map<string, string>,
): { valid: Array<Record<string, unknown>>; errors: ImportResult["errors"] } {
    const valid: Array<Record<string, unknown>> = []
    const errors: ImportResult["errors"] = []

    const getField = (row: string[], col: number | null) =>
        col !== null && col < row.length ? row[col].trim() : ""

    const accountMap = new Map(accounts.map(a => [a.name.toLowerCase(), a.id]))
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))

    rows.forEach((row, i) => {
        const rowNum = i + 2 // +1 for header, +1 for 1-based

        // Date
        const dateRaw = getField(row, mapping.date)
        const date = parseDate(dateRaw)
        if (!date) {
            errors.push({ row: rowNum, message: `Fecha invalida: "${dateRaw}"` })
            return
        }

        // Description
        const description = getField(row, mapping.description)
        if (!description) {
            errors.push({ row: rowNum, message: "Descripcion vacia" })
            return
        }

        // Type — from column or default
        let type: "income" | "expense" | "transfer" | null = null
        if (mapping.type !== null) {
            const typeRaw = getField(row, mapping.type)
            type = parseType(typeRaw)
        }
        if (!type && defaults.type) {
            type = defaults.type
        }
        if (!type) {
            errors.push({ row: rowNum, message: `Tipo invalido. Usa: income/expense/transfer` })
            return
        }

        // Amount
        const amountRaw = getField(row, mapping.amount)
        const amount = parseAmount(amountRaw)
        if (amount === null || amount <= 0) {
            errors.push({ row: rowNum, message: `Monto invalido: "${amountRaw}"` })
            return
        }

        // Currency — from column or default
        let currency: "USD" | "COP" | null = null
        if (mapping.currency !== null) {
            const currencyRaw = getField(row, mapping.currency)
            currency = parseCurrency(currencyRaw)
        }
        if (!currency && defaults.currency) {
            currency = defaults.currency
        }
        if (!currency) {
            errors.push({ row: rowNum, message: `Moneda invalida. Usa: USD o COP` })
            return
        }

        // Account — from column or default
        let accountId: string | undefined
        if (mapping.account !== null) {
            const accountName = getField(row, mapping.account)
            accountId = accountMap.get(accountName.toLowerCase())
            if (!accountId) {
                errors.push({ row: rowNum, message: `Cuenta no encontrada: "${accountName}"` })
                return
            }
        }
        if (!accountId && defaults.account_id) {
            accountId = defaults.account_id
        }
        if (!accountId) {
            errors.push({ row: rowNum, message: "Cuenta no asignada" })
            return
        }

        // Category (optional) — check overrides first, then existing categories
        const categoryName = getField(row, mapping.category)
        let categoryId: string | null = null
        if (categoryName) {
            const lower = categoryName.toLowerCase()
            categoryId = categoryMap.get(lower)
                ?? categoryOverrides?.get(lower)
                ?? null
            if (!categoryId) {
                errors.push({ row: rowNum, message: `Categoria no encontrada: "${categoryName}"` })
                return
            }
        }

        // Merchant (optional)
        const merchant = getField(row, mapping.merchant) || null

        // Notes (optional)
        const notes = getField(row, mapping.notes) || null

        valid.push({
            user_id: userId,
            date,
            description,
            type,
            amount,
            currency,
            account_id: accountId,
            category_id: categoryId,
            merchant,
            notes,
        })
    })

    return { valid, errors }
}

/** Import validated transactions sequentially to ensure balance updates are correct */
export async function importTransactions(
    validRows: Array<Record<string, unknown>>,
    onProgress?: (current: number, total: number) => void,
): Promise<ImportResult> {
    const errors: ImportResult["errors"] = []
    let imported = 0

    for (let i = 0; i < validRows.length; i++) {
        try {
            await transactionsService.createTransaction(validRows[i] as any)
            imported++
        } catch (err) {
            errors.push({
                row: i + 1,
                message: err instanceof Error ? err.message : "Error desconocido",
            })
        }
        onProgress?.(i + 1, validRows.length)
    }

    return { imported, errors }
}
