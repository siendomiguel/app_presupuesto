"use client"

import { useState, useEffect } from "react"

export function CurrentMonth() {
    const [label, setLabel] = useState("")

    useEffect(() => {
        setLabel(new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }))
    }, [])

    return <>{label}</>
}
