'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useInspection } from '@/components/inspection-context'
import { useToast } from '@/components/stitchx-toast'
import { BIKES } from '@/lib/data'
import { cn } from '@/lib/utils'

export function ScanScreen() {
  const { selectBike, setScreen } = useInspection()
  const toast = useToast()
  
  const [tagInput, setTagInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBikes = BIKES.filter(bike => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      bike.rider.toLowerCase().includes(q) ||
      bike.team.toLowerCase().includes(q) ||
      bike.bib.toLowerCase().includes(q) ||
      bike.tagId.toLowerCase().includes(q)
    )
  })

  const handleLoadTag = () => {
    const tagToLoad = tagInput.trim() || BIKES[0].tagId
    const bike = BIKES.find(b => 
      b.tagId.toLowerCase() === tagToLoad.toLowerCase()
    )
    if (bike) {
      selectBike(bike)
      toast(`Loaded ${bike.rider}`)
    } else {
      toast('Bike not found')
    }
  }

  const handleNFCScan = () => {
    // Simulate NFC scan with first bike
    selectBike(BIKES[0])
    toast(`Simulated NFC scan - loaded ${BIKES[0].rider}`)
  }

  const handleSelectBike = (bike: typeof BIKES[0]) => {
    selectBike(bike)
    toast(`Loaded ${bike.rider}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">Official Access</h3>
          <p className="text-sm text-muted-foreground">Scan or load a bike record</p>
        </div>
      </div>

      {/* NFC Scanner Simulation */}
      <div
        onClick={handleNFCScan}
        className="border border-dashed border-muted-foreground/50 bg-gradient-radial from-stitchx-blue/10 to-transparent rounded-3xl p-8 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-primary/50 transition-colors"
      >
        <div className="text-5xl mb-3">📡</div>
        <div className="text-xl font-bold">Ready to scan</div>
        <div className="text-sm text-muted-foreground">Tap to simulate NFC read</div>
      </div>

      {/* Manual entry */}
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="block text-xs text-muted-foreground uppercase tracking-wider">Manual tag entry</span>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="044B536AD71F90"
            className="w-full bg-secondary border border-border text-foreground px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="space-y-2">
          <span className="block text-xs text-muted-foreground uppercase tracking-wider">Search rider</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rider or team"
            className="w-full bg-secondary border border-border text-foreground px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleLoadTag}
          variant="outline"
          className="border-border"
        >
          Load Tag
        </Button>
        <Button
          onClick={() => setScreen('event')}
          variant="outline"
          className="border-border"
        >
          Back to Event
        </Button>
      </div>

      {/* Lookup results */}
      <div className="space-y-2">
        {filteredBikes.map(bike => (
          <button
            key={bike.tagId}
            onClick={() => handleSelectBike(bike)}
            className={cn(
              'w-full text-left p-3 border rounded-2xl transition-colors',
              'bg-secondary border-border hover:border-muted-foreground/50',
              bike.status === 'Flagged' && 'border-l-4 border-l-stitchx-red'
            )}
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <strong className="text-foreground">{bike.rider}</strong>
                <span className="text-muted-foreground ml-2">#{bike.bib}</span>
              </div>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full',
                bike.status === 'Active' ? 'bg-stitchx-green/20 text-stitchx-green' : 'bg-stitchx-red/20 text-stitchx-red'
              )}>
                {bike.status}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {bike.bikeBrand} {bike.frameModel} · {bike.team}
            </div>
          </button>
        ))}
        {filteredBikes.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            No matches found
          </div>
        )}
      </div>
    </div>
  )
}
