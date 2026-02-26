/**
 * Parse CSV text into headers and rows.
 * Handles quoted values, commas/semicolons inside quotes, and escaped quotes ("").
 * Auto-detects separator (, or ;).
 */
export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
    const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim()

    // Detect separator from the first line
    const firstLine = lines.split("\n")[0]
    const separator = firstLine.includes(";") && !firstLine.includes(",") ? ";" : ","

    const allRows = parseCSVRows(lines, separator)
    if (allRows.length === 0) return { headers: [], rows: [] }

    const headers = allRows[0].map(h => h.trim())
    const rows = allRows.slice(1).filter(row => row.some(cell => cell.trim() !== ""))

    return { headers, rows }
}

function parseCSVRows(text: string, separator: string): string[][] {
    const rows: string[][] = []
    let current = ""
    let inQuotes = false
    let row: string[] = []

    for (let i = 0; i < text.length; i++) {
        const char = text[i]

        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    current += '"'
                    i++ // skip escaped quote
                } else {
                    inQuotes = false
                }
            } else {
                current += char
            }
        } else {
            if (char === '"') {
                inQuotes = true
            } else if (char === separator) {
                row.push(current)
                current = ""
            } else if (char === "\n") {
                row.push(current)
                current = ""
                rows.push(row)
                row = []
            } else {
                current += char
            }
        }
    }

    // Push last field/row
    row.push(current)
    if (row.some(cell => cell.trim() !== "")) {
        rows.push(row)
    }

    return rows
}
