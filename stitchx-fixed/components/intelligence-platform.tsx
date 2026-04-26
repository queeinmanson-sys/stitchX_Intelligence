"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

export type TabType = "live" | "fan" | "officials"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://stitchxintelligence-production.up.railway.app"

interface InsightData {
  label: string
  accent: string
  line1: string
  line2: string
}

// Backend may return any shape with InsightData blocks; we render them all.
type InsightsResponse = Record<string, InsightData>

interface IntelligencePlatformProps {
  /** Controlled tab from parent dashboard. */
  tab?: TabType
  activeTab?: TabType
  /** Hide the inner tab switcher. Default: hide if a tab prop is provided. */
  showTabs?: boolean
}

export function IntelligencePlatform(props: IntelligencePlatformProps = {}) {
  // Accept either `tab` or `activeTab` so we work with either parent shape.
  const controlledTab = props.tab ?? props.activeTab
  const showTabs = props.showTabs ?? controlledTab === undefined

  const [internalTab, setInternalTab] = useState<TabType>("live")
  const activeTab = controlledTab ?? internalTab

  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, setTick] = useState(0)

  // Guard against stale fetches overwriting newer ones when the tab changes fast
  const latestModeRef = useRef<TabType>(activeTab)

  const fetchInsights = useCallback(async (mode: TabType) => {
    latestModeRef.current = mode
    try {
      const response = await fetch(`${BACKEND_URL}/insights?mode=${mode}`, {
        cache: "no-store",
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data: InsightsResponse = await response.json()
      if (latestModeRef.current === mode) {
        setInsights(data)
        setLastUpdated(new Date())
        setError(null)
      }
    } catch (err) {
      if (latestModeRef.current === mode) {
        setError(err instanceof Error ? err.message : "Fetch failed")
      }
    }
  }, [])

  // Re-fetch on tab change, then poll every 5s
  useEffect(() => {
    setInsights(null)
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
    if (!lastUpdated) return ""
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
    if (seconds < 5) return "just now"
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
            {" \u00b7 "}Real-time cycling race intelligence
          </p>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Updated {getTimeAgo()}
          </span>
        )}
      </div>

      {showTabs && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <InnerTab active={activeTab === "live"} onClick={() => setInternalTab("live")}>
            Live Race
          </InnerTab>
          <InnerTab active={activeTab === "fan"} onClick={() => setInternalTab("fan")}>
            Fan Zone
          </InnerTab>
          <InnerTab
            active={activeTab === "officials"}
            onClick={() => setInternalTab("officials")}
          >
            UCI Officials
          </InnerTab>
        </div>
      )}

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
  yellow: "text-yellow-400",
  blue: "text-blue-400",
  red: "text-red-400",
  green: "text-green-400",
}

function InnerTab({
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
        "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
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
          "text-[10px] font-bold tracking-widest mb-1",
          ACCENT[accent] ?? "text-primary"
        )}
      >
        {label}
      </p>
      <p className="text-base text-foreground">{line1}</p>
      {line2 && <p className="text-sm text-muted-foreground mt-0.5">{line2}</p>}
    </div>
  )
}
