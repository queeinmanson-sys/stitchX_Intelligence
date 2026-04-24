"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { IntelligencePlatform } from "@/components/intelligence-platform"
import { RadioPlayer } from "@/components/radio-player"
import { UCIPane } from "@/components/uci-pane"
import { LogOut } from "lucide-react"

type TabType = "live" | "fan" | "officials"

interface RaceControlDashboardProps {
   user?: User | null
}

function secondsToClock(sec: number): string {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0")
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0")
  const s = String(sec % 60).padStart(2, "0")
  return `${h}:${m}:${s}`
}

function TopTab({
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
      className={`rounded-full border px-5 py-2 text-sm transition ${
        active
          ? "border-slate-500 bg-slate-800 text-white"
          : "border-slate-800 bg-transparent text-slate-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  )
}

export default function RaceControlDashboard({ user }: RaceControlDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("live")
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((value) => value + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <main className="min-h-screen bg-[#03080d] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4">
        <header className="flex items-center justify-between rounded-3xl border border-slate-800 bg-[#071019] px-6 py-4">
          <div>
            <h1 className="text-3xl font-bold">
              Stitch<span className="text-yellow-400">X</span>
            </h1>
            <p className="tracking-[0.25em] text-slate-400 uppercase">
              Race Intelligence
            </p>
          </div>

          <nav className="flex gap-2">
            <TopTab active={activeTab === "live"} onClick={() => setActiveTab("live")}>
              Live Race
            </TopTab>
            <TopTab active={activeTab === "fan"} onClick={() => setActiveTab("fan")}>
              Fan Zone
            </TopTab>
            <TopTab
              active={activeTab === "officials"}
              onClick={() => setActiveTab("officials")}
            >
              UCI Officials
            </TopTab>
          </nav>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-800 px-4 py-2 text-sm text-slate-300">
              {user?.email || "Official"}
            </span>

            <span className="rounded-full border border-slate-800 px-4 py-2 text-sm text-yellow-400">
              {secondsToClock(elapsed)}
            </span>

            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-slate-800 p-2 text-slate-400 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-800 bg-[#071019] p-6">
            {activeTab === "officials" ? (
              <UCIPane />
            ) : (
              <IntelligencePlatform activeTab={activeTab} />
            )}
          </div>

          <aside className="rounded-3xl border border-slate-800 bg-[#071019] p-6">
            <RadioPlayer />
          </aside>
        </section>
      </div>
    </main>
  )
}
