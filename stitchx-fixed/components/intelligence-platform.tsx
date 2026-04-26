'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

export type TabType = 'live' | 'fan' | 'officials'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stitchxintelligence-production.up.railway.app'

interface InsightData {
  label: string
  accent: string
  line1: string
  line2: string
}

// Backend may return any shape with a few InsightData blocks.
// We render whichever blocks exist, in the order the backend gives them.
type InsightsResponse = Record<string, InsightData>

interface IntelligencePlatformProps {
  activeTab: TabType
}

export function IntelligencePlatform({ activeTab }: IntelligencePlatformProps) {
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, setTick] = useState(0)

  // Track the latest mode so a stale fetch can't overwrite a newer one
  const latestModeRef = useRef<TabType>(activeTab)

  const fetchInsights = useCallback(async (mode: TabType) => {
    latestModeRef.current = mode
    try {
      const res = await fetch(`${BACKEND_URL}/insights?mode=${mode}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: InsightsResponse = await res.json()
      // Only commit if the user hasn't switched tabs since this request started
      if (latestModeRef.current === mode) {
        setInsights(data)
        setLastUpdated(new Date())
        setError(null)
      }
    } catch (e) {
      if (latestModeRef.current === mode) {
        setError(e instanceof Error ? e.message : 'Fetch failed')
      }
    }
  }, [])

  // Re-fetch whenever the tab changes, then poll every 5s
  useEffect(() => {
    setInsights(null) // clear stale content while the new tab loads
    fetchInsights(activeTab)
    const id = setInterval(() => fetchInsights(activeTab), 5000)
    return () => clearInterval(id)
  }, [activeTab, fetchInsights])

  // Tick once a second so "Updated Xs ago" stays fresh
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const getTimeAgo = () => {
    if (!lastUpdated) return ''
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
    if (seconds < 5) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    return `${Math.floor(seconds / 60)}m ago`
  }

  const blocks: InsightData[] = insights ? Object.values(insights) : []

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Intelligence Platform</h2>
          <p className="text-xs text-muted-foreground">
            Mode: <span className="font-semibold text-foreground">{activeTab}</span>
            {' · '}Real-time cycling race intelligence
          </p>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Updated {getTimeAgo()}
          </span>
        )}
      </div>

      {error && !insights && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2 mb-4">
          Backend unreachable: {error}
        </div>
      )}

      <div className="space-y-5">
        {blocks.length === 0 && !error && (
          <div className="text-sm text-muted-foreground">Loading {activeTab} insights…</div>
        )}
        {blocks.map((block, i) => (
          <InsightBlock
            key={`${activeTab}-${i}-${block.label}`}
            accent={block.accent}
            label={block.label}
            line1={block.line1}
            line2={block.line2}
          />
        ))}
      </div>
    </div>
  )
}

const ACCENT: Record<string, string> = {
  yellow: 'text-yellow-400',
  blue: 'text-blue-400',
  red: 'text-red-400',
  green: 'text-green-400',
}

function InsightBlock({
  accent,
  label,
  line1,
  line2,
}: {
  accent: string
  label: string
  line1: string
  line2: string
}) {
  return (
    <div>
      <p
        className={cn(
          'text-[10px] font-bold tracking-widest mb-1',
          ACCENT[accent] ?? 'text-primary'
        )}
      >
        {label}
      </p>
      <p className="text-base text-foreground">{line1}</p>
      {line2 && <p className="text-sm text-muted-foreground mt-0.5">{line2}</p>}
    </div>
  )
}
