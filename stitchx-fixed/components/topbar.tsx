'use client'

import { cn } from '@/lib/utils'

interface TopbarProps {
  activeTab: string
  sessionBadge: string
  clock: string
}

export function Topbar({ activeTab, sessionBadge, clock }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 bg-card/95 border border-border rounded-[22px] px-4 py-3 shadow-lg">
      {/* Brand */}
      <div className="cursor-pointer">
        <div className="text-2xl font-extrabold tracking-tight">
          Stitch<em className="text-primary not-italic">X</em>
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-widest">
          {activeTab === 'race' ? 'Race Intelligence' : 
           activeTab === 'fan' ? 'Fan Zone' : 
           activeTab === 'uci' ? 'UCI Officials' : 'Admin'}
        </div>
      </div>

      {/* Tabs - currently only showing UCI Officials */}
      <nav className="flex gap-2 flex-wrap">
        <button
          className={cn(
            'px-4 py-2.5 rounded-full font-semibold text-sm border transition-colors',
            activeTab === 'uci'
              ? 'bg-gradient-to-b from-secondary to-card border-border text-foreground'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          )}
        >
          UCI Officials
        </button>
      </nav>

      {/* Right badges */}
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
      </div>
    </header>
  )
}
