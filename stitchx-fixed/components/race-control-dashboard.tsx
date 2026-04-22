'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useInspection } from '@/components/inspection-context'
import { UCIPane } from '@/components/uci-pane'
import { IntelligencePlatform } from '@/components/intelligence-platform'
import { RadioPlayer } from '@/components/radio-player'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INITIAL_STAGE_STATE } from '@/lib/data'

type TabType = 'live' | 'fan' | 'officials'

interface RaceControlDashboardProps {
  user: User
}

function secondsToClock(sec: number): string {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0')
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function RaceControlDashboard({ user }: RaceControlDashboardProps) {
  const { currentProfile } = useInspection()
  const [activeTab, setActiveTab] = useState<TabType>('officials')
  const [elapsed, setElapsed] = useState(INITIAL_STAGE_STATE.elapsed)

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const sessionBadge = currentProfile?.full_name || user.email || 'Official'
  const clock = secondsToClock(elapsed)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* Topbar */}
      <header className="flex items-center justify-between gap-4 bg-card/95 border border-border rounded-[22px] px-4 py-3 shadow-lg flex-wrap">
        <div>
          <div className="text-2xl font-extrabold tracking-tight">
            Stitch<em className="text-primary not-italic">X</em>
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            {activeTab === 'live'
              ? 'Race Intelligence'
              : activeTab === 'fan'
                ? 'Fan Zone'
                : 'UCI Officials'}
          </div>
        </div>

        <nav className="flex gap-2 flex-wrap">
          <TopTab active={activeTab === 'live'} onClick={() => setActiveTab('live')}>
            Live Race
          </TopTab>
          <TopTab active={activeTab === 'fan'} onClick={() => setActiveTab('fan')}>
            Fan Zone
          </TopTab>
          <TopTab active={activeTab === 'officials'} onClick={() => setActiveTab('officials')}>
            UCI Officials
          </TopTab>
        </nav>

        <div className="flex gap-2 items-center flex-wrap">
          <div className="px-3 py-2 rounded-full bg-card border border-border text-xs text-muted-foreground">
            {sessionBadge}
          </div>
          <div className="px-3 py-2 rounded-full bg-card border border-border text-xs text-muted-foreground">
            Race Control
          </div>
          <div className="px-3 py-2 rounded-full bg-card border border-border text-xs text-primary font-medium">
            {clock}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-9"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Body */}
      <main>
        {activeTab === 'officials' ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
            <UCIPane />
            <aside className="space-y-4">
              <IntelligencePlatform tab="officials" showTabs={false} />
              <RadioPlayer />
            </aside>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
            <IntelligencePlatform tab={activeTab} showTabs={false} />
            <aside>
              <RadioPlayer />
            </aside>
          </div>
        )}
      </main>
    </div>
  )
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
      className={cn(
        'px-4 py-2.5 rounded-full font-semibold text-sm border transition-colors',
        active
          ? 'bg-gradient-to-b from-secondary to-card border-border text-foreground'
          : 'bg-card border-border text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}
