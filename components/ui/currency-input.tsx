"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
    value: number
    onChange: (value: number) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

function formatDisplay(value: number): string {
    if (value === 0) return ""
    return value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })
}

function parseInput(raw: string): number {
    // Remove thousand separators (commas), keep decimal dot
    const cleaned = raw.replace(/,/g, "")
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
}

export function CurrencyInput({
    value,
    onChange,
    placeholder = "0.00",
    className,
    disabled,
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState(() =>
        value ? formatDisplay(value) : ""
    )
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Sync display when value changes externally (e.g. form reset)
    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(value ? formatDisplay(value) : "")
        }
    }, [value, isFocused])

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value

            // Allow empty field
            if (raw === "") {
                setDisplayValue("")
                onChange(0)
                return
            }

            // Only allow digits, commas, dots, and minus
            if (!/^[\d,.\-]*$/.test(raw)) return

            // Prevent multiple dots
            const dotCount = (raw.match(/\./g) || []).length
            if (dotCount > 1) return

            // Limit decimal places to 2
            const dotIndex = raw.indexOf(".")
            if (dotIndex !== -1 && raw.length - dotIndex > 3) return

            setDisplayValue(raw)
            onChange(parseInput(raw))
        },
        [onChange]
    )

    const handleFocus = useCallback(() => {
        setIsFocused(true)
        // Show raw number without formatting for easier editing
        if (value) {
            const raw = value.toString()
            setDisplayValue(raw)
            // Select all text on focus
            setTimeout(() => inputRef.current?.select(), 0)
        }
    }, [value])

    const handleBlur = useCallback(() => {
        setIsFocused(false)
        // Format on blur
        const parsed = parseInput(displayValue)
        onChange(parsed)
        setDisplayValue(parsed ? formatDisplay(parsed) : "")
    }, [displayValue, onChange])

    return (
        <Input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("tabular-nums", className)}
        />
    )
}
