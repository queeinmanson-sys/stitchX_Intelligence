"use client"

export function IntelligencePlatform({ activeTab }: { activeTab: TabType }) {
  
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

export function IntelligencePlatform() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchInsights(mode: TabType) {
    setLoading(true)

    const url = `${BACKEND_URL}/insights?mode=${mode}&t=${Date.now()}`
    console.log("Fetching insights:", url)

    try {
      const response = await fetch(url, { cache: "no-store" })
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error("Insights fetch failed:", error)
    } finally {
      setLoading(false)
    }
  }

  function changeTab(mode: TabType) {
    setActiveTab(mode)
    fetchInsights(mode)
  }

  useEffect(() => {
    fetchInsights("live")
  }, [])

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
      <p className="text-xs text-gray-500 mb-2">Updated just now</p>

      <p className="text-white mb-4">Current tab: {activeTab}</p>

      <div className="flex gap-2 mb-8">
        <button
          type="button"
          onClick={() => changeTab("live")}
          className={`px-4 py-2 rounded ${
            activeTab === "live" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
          }`}
        >
          Live Race
        </button>

        <button
          type="button"
          onClick={() => changeTab("fan")}
          className={`px-4 py-2 rounded ${
            activeTab === "fan" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
          }`}
        >
          Fan Zone
        </button>

        <button
          type="button"
          onClick={() => changeTab("officials")}
          className={`px-4 py-2 rounded ${
            activeTab === "officials" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
          }`}
        >
          UCI Officials
        </button>
      </div>

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
