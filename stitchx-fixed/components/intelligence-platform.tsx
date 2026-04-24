"use client"

import { useEffect, useState } from "react"

type TabType = "live" | "fan" | "officials"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://stitchxintelligence-production.up.railway.app"

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

export function IntelligencePlatform({ activeTab }: { activeTab: TabType }) {
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchInsights(mode: TabType) {
    setLoading(true)

    try {
      const response = await fetch(
        `${BACKEND_URL}/insights?mode=${mode}&t=${Date.now()}`,
        { cache: "no-store" }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch insights")
      }

      const data: InsightsResponse = await response.json()
      setInsights(data)
    } catch (error) {
      console.error("Insights fetch failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights(activeTab)
  }, [activeTab])

  const blocks = insights
    ? [
        insights.raceDynamics,
        insights.riderFocus,
        insights.equipmentStatus,
        insights.liveAlert,
      ]
    : []

  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-2xl font-bold text-white mb-2">
        Intelligence Platform
      </h2>
      <p className="text-sm text-gray-400 mb-1">
        Real-time cycling race intelligence
      </p>
      <p className="text-xs text-gray-500 mb-6">Mode: {activeTab}</p>

      <div className="space-y-8">
        {loading && <p className="text-gray-400">Loading insights...</p>}

        {!loading &&
          blocks.map((block) => (
            <div key={`${activeTab}-${block.label}`}>
              <p className="text-xs font-bold mb-1 uppercase text-yellow-400">
                {block.label}
              </p>
              <p className="text-2xl text-white">{block.line1}</p>
              <p className="text-gray-400">{block.line2}</p>
            </div>
          ))}
      </div>
    </div>
  )
}
