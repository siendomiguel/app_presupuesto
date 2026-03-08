"use client"

import { useEffect, useState } from "react"

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

function getScoreColor(score: number): string {
  if (score >= 80) return "hsl(158, 64%, 42%)"
  if (score >= 60) return "hsl(43, 96%, 56%)"
  if (score >= 40) return "hsl(25, 95%, 53%)"
  return "hsl(var(--destructive))"
}

export function ScoreRing({ score, size = 120, strokeWidth = 10 }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (animatedScore / 100) * circumference
  const color = getScoreColor(score)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{animatedScore}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  )
}
