'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

type TabType = 'live' | 'fan' | 'officials'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stitchxradio-production.up.railway.app'

interface InsightData {
  label: string
  accent: string
  line1: string
  line2: string
}

interface InsightsResponse {
  raceDynamics: InsightData
  riderFocus: InsightData
  equipmentStatus: InsightData
  liveAlert: InsightData
}

interface IntelligencePlatformProps {
  /** Optional controlled tab. If omitted the component manages its own tab state. */
  tab?: TabType
  onTabChange?: (tab: TabType) => void
  /** Hide the tab switcher (useful when the parent renders its own tabs). */
  showTabs?: boolean
}

export function IntelligencePlatform({
  tab,
  onTabChange,
  showTabs = true,
}: IntelligencePlatformProps = {}) {
  const [internalTab, setInternalTab] = useState<TabType>('live')
  const activeTab = tab ?? internalTab

  const setActiveTab = (next: TabType) => {
    if (onTabChange) onTabChange(next)
    if (tab === undefined) setInternalTab(next)
  }

  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [, setTick] = useState(0)

  const fetchInsights = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/insights`)
      if (response.ok) {
        const data: InsightsResponse = await response.json()
        setInsights(data)
        setLastUpdated(new Date())
      }
    } catch {
      // keep previous data on error
    }
  }, [])

  useEffect(() => {
    fetchInsights()
    const interval = setInterval(fetchInsights, 5000)
    return () => clearInterval(interval)
  }, [fetchInsights])

  // Re-render every second so "Last updated Xs ago" stays fresh
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

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Intelligence Platform</h2>
          <p className="text-xs text-muted-foreground">Real-time cycling race intelligence</p>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Updated {getTimeAgo()}
          </span>
        )}
      </div>

      {showTabs && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <TabButton active={activeTab === 'live'} onClick={() => setActiveTab('live')}>
            Live Race
          </TabButton>
          <TabButton active={activeTab === 'fan'} onClick={() => setActiveTab('fan')}>
            Fan Zone
          </TabButton>
          <TabButton active={activeTab === 'officials'} onClick={() => setActiveTab('officials')}>
            UCI Officials
          </TabButton>
        </div>
      )}

      <div className="space-y-5">
        {activeTab === 'live' && (
          <>
            <InsightBlock
              accent="yellow"
              label={insights?.raceDynamics.label ?? 'RACE DYNAMICS'}
              line1={insights?.raceDynamics.line1 ?? 'Loading…'}
              line2={insights?.raceDynamics.line2 ?? ''}
            />
            <InsightBlock
              accent="blue"
              label={insights?.riderFocus.label ?? 'RIDER FOCUS'}
              line1={insights?.riderFocus.line1 ?? 'Loading…'}
              line2={insights?.riderFocus.line2 ?? ''}
            />
            <InsightBlock
              accent="red"
              label={insights?.liveAlert.label ?? 'LIVE ALERT'}
              line1={insights?.liveAlert.line1 ?? 'Loading…'}
              line2={insights?.liveAlert.line2 ?? ''}
            />
          </>
        )}

        {activeTab === 'fan' && (
          <>
            <InsightBlock
              accent="yellow"
              label="RACE STORY"
              line1="Breakaway still holding strong"
              line2="Fans watching the chase build behind"
            />
            <InsightBlock
              accent="blue"
              label="RIDER SPOTLIGHT"
              line1="GC leader remains calm in the peloton"
              line2="Key contenders saving energy for the climb"
            />
            <InsightBlock
              accent="red"
              label="HYPE ALERT"
              line1="Attack window approaching"
              line2="Expect fireworks in the final 15 km"
            />
          </>
        )}

        {activeTab === 'officials' && (
          <>
            <InsightBlock
              accent="green"
              label={insights?.equipmentStatus.label ?? 'INSPECTION STATUS'}
              line1={insights?.equipmentStatus.line1 ?? 'All scanned bikes compliant'}
              line2={insights?.equipmentStatus.line2 ?? 'No UCI inspection alerts'}
            />
            <InsightBlock
              accent="blue"
              label="RIDER CHECK"
              line1="Selected rider cleared for stage"
              line2="No mechanical or safety holds"
            />
            <InsightBlock
              accent="yellow"
              label="OFFICIAL ALERTS"
              line1="No active compliance violations"
              line2="Monitoring equipment and race control"
            />
          </>
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card border-border text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
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
      <p className={cn('text-[10px] font-bold tracking-widest mb-1', ACCENT[accent] ?? 'text-primary')}>
        {label}
      </p>
      <p className="text-base text-foreground">{line1}</p>
      {line2 && <p className="text-sm text-muted-foreground mt-0.5">{line2}</p>}
    </div>
  )
}
