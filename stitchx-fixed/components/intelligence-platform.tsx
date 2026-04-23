"use client"

import { useState, useEffect, useCallback } from "react"

type TabType = "live" | "fan" | "officials"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://stitchxradio-production.up.railway.app"

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

export function IntelligencePlatform() {
  const [activeTab, setActiveTab] = useState<TabType>("live")
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchInsights = useCallback(async (mode: TabType) => {
    try {
      const response = await fetch(`${BACKEND_URL}/insights?mode=${activeTab}`)`, {
        cache: "no-store",
      })
      if (!response.ok) throw new Error("Failed to fetch insights")
      const data: InsightsResponse = await response.json()
      setInsights(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Insights fetch failed:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
  fetchInsights(activeTab)
}, [activeTab])

    const interval = setInterval(() => {
      fetchInsights(activeTab)
    }, 5000)

    return () => clearInterval(interval)
  }, [activeTab, fetchInsights])

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
      <h2 className="text-2xl font-bold text-white mb-2">Intelligence Platform</h2>
      <p className="text-sm text-gray-400 mb-1">Real-time cycling race intelligence</p>
      <p className="text-xs text-gray-500 mb-6">
        {lastUpdated ? "Updated just now" : "Loading..."}
      </p>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab("live")}
          className={`px-4 py-2 rounded ${activeTab === "live" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}
        >
          Live Race
        </button>
        <button
          onClick={() => setActiveTab("fan")}
          className={`px-4 py-2 rounded ${activeTab === "fan" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}
        >
          Fan Zone
        </button>
        <button
          onClick={() => setActiveTab("officials")}
          className={`px-4 py-2 rounded ${activeTab === "officials" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}
        >
          UCI Officials
        </button>
      </div>

      <div className="space-y-8">
        {loading && <p className="text-gray-400">Loading insights...</p>}

        {!loading &&
          blocks.map((block) => (
            <div key={`${activeTab}-${block.label}`}>
              <p className="text-xs font-bold mb-1 uppercase text-yellow-400">{block.label}</p>
              <p className="text-2xl text-white">{block.line1}</p>
              <p className="text-gray-400">{block.line2}</p>
            </div>
          ))}
      </div>
    </div>
  )
}
