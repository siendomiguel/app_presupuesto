"use client"

import { useEffect, useRef } from "react"

interface SwipeGestureOptions {
  onSwipeRight?: () => void
  onSwipeLeft?: () => void
  threshold?: number
  edgeSize?: number
}

export function useSwipeGesture({
  onSwipeRight,
  onSwipeLeft,
  threshold = 80,
  edgeSize = 30,
}: SwipeGestureOptions) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchStartedFromEdge = useRef(false)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStart.current = { x: touch.clientX, y: touch.clientY }
      touchStartedFromEdge.current = touch.clientX <= edgeSize
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y

      // Only trigger if horizontal swipe is dominant (not vertical scroll)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= threshold) {
        if (deltaX > 0 && touchStartedFromEdge.current && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      touchStart.current = null
      touchStartedFromEdge.current = false
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [onSwipeRight, onSwipeLeft, threshold, edgeSize])
}
