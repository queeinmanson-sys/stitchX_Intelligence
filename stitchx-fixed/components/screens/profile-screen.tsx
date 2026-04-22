'use client'

import { Button } from '@/components/ui/button'
import { useInspection } from '@/components/inspection-context'
import { cn } from '@/lib/utils'

export function ProfileScreen() {
  const { currentBike, setScreen } = useInspection()

  if (!currentBike) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No bike selected
      </div>
    )
  }

  const details = [
    { label: 'Rider', value: currentBike.rider },
    { label: 'Bib', value: currentBike.bib },
    { label: 'Team', value: currentBike.team },
    { label: 'Bike', value: `${currentBike.bikeBrand} ${currentBike.frameModel}` },
    { label: 'Frame serial', value: currentBike.frameSerial },
    { label: 'Transponder', value: currentBike.transponder },
    { label: 'Wheels', value: currentBike.wheels },
    { label: 'Status', value: currentBike.status }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">Bike Profile</h3>
          <p className="text-sm text-muted-foreground">Confirm rider and bike details</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-secondary border border-border rounded-2xl p-4">
        <div className="grid grid-cols-2 gap-4">
          {details.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-2 py-2 border-b border-border/50 last:border-b-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className={cn(
                'font-medium text-right',
                label === 'Status' && value === 'Flagged' && 'text-stitchx-red',
                label === 'Status' && value === 'Active' && 'text-stitchx-green'
              )}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setScreen('scan')}
          variant="outline"
          className="border-border"
        >
          Back
        </Button>
        <Button
          onClick={() => setScreen('check')}
          className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground font-bold px-6"
        >
          Start Compliance Check
        </Button>
      </div>
    </div>
  )
}
