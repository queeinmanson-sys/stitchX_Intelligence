'use client'

import { Button } from '@/components/ui/button'
import { useInspection } from '@/components/inspection-context'
import { useToast } from '@/components/stitchx-toast'
import { exportSingleInspectionJSON, exportInspectionsCSV } from '@/lib/inspection-store'
import { cn } from '@/lib/utils'

export function SaveScreen() {
  const { currentBike, inspectionDraft, currentEvent, saveCurrentInspection, resetInspection } = useInspection()
  const toast = useToast()

  if (!currentBike || !inspectionDraft) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No inspection to save
      </div>
    )
  }

  const handleSave = () => {
    const success = saveCurrentInspection()
    if (success) {
      toast('Inspection saved locally')
      // Auto-export CSV as backup
      exportInspectionsCSV()
    } else {
      toast('Failed to save inspection')
    }
  }

  const handleExportJSON = () => {
    exportSingleInspectionJSON(
      currentBike,
      {
        checks: inspectionDraft.checks,
        notes: inspectionDraft.notes,
        overall_result: inspectionDraft.overall_result
      },
      currentEvent
    )
    toast('JSON exported')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleNextScan = () => {
    resetInspection()
    toast('Ready for next scan')
  }

  const resultColorClass = 
    inspectionDraft.overall_result === 'PASS' ? 'text-stitchx-green' :
    inspectionDraft.overall_result === 'WARNING' ? 'text-stitchx-gold' : 'text-stitchx-red'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">Inspection Summary</h3>
          <p className="text-sm text-muted-foreground">Save or export the inspection</p>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-secondary border border-border rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Rider:</span>
          <span className="font-medium">{currentBike.rider}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Bib:</span>
          <span className="font-medium">#{currentBike.bib}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Bike:</span>
          <span className="font-medium">{currentBike.bikeBrand} {currentBike.frameModel}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Team:</span>
          <span className="font-medium">{currentBike.team}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Overall Result:</span>
          <span className={cn('font-bold text-lg', resultColorClass)}>
            {inspectionDraft.overall_result}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Photo:</span>
          <span className="font-medium">
            {inspectionDraft.photoAdded ? 'Added' : 'Not added'}
          </span>
        </div>
        {inspectionDraft.notes && (
          <div className="pt-2 border-t border-border/50">
            <span className="text-muted-foreground block mb-1">Notes:</span>
            <p className="text-sm">{inspectionDraft.notes}</p>
          </div>
        )}
      </div>

      {/* Check results summary */}
      <div className="bg-secondary border border-border rounded-2xl p-4">
        <h4 className="font-semibold mb-3">Check Results</h4>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-stitchx-green/10">
            <div className="text-xl font-bold text-stitchx-green">
              {inspectionDraft.checks.filter(c => c.result === 'PASS').length}
            </div>
            <div className="text-xs text-muted-foreground">Pass</div>
          </div>
          <div className="p-2 rounded-lg bg-stitchx-gold/10">
            <div className="text-xl font-bold text-stitchx-gold">
              {inspectionDraft.checks.filter(c => c.result === 'WARNING').length}
            </div>
            <div className="text-xs text-muted-foreground">Warning</div>
          </div>
          <div className="p-2 rounded-lg bg-stitchx-red/10">
            <div className="text-xl font-bold text-stitchx-red">
              {inspectionDraft.checks.filter(c => c.result === 'FAIL').length}
            </div>
            <div className="text-xs text-muted-foreground">Fail</div>
          </div>
          <div className="p-2 rounded-lg bg-stitchx-blue/10">
            <div className="text-xl font-bold text-stitchx-blue">
              {inspectionDraft.checks.filter(c => c.result === 'SKIP').length}
            </div>
            <div className="text-xs text-muted-foreground">Skip</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleNextScan}
          variant="outline"
          className="border-border"
        >
          Next Scan
        </Button>
        <Button
          onClick={handleSave}
          className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground font-bold px-6"
        >
          Save Inspection
        </Button>
        <Button
          onClick={handleExportJSON}
          variant="outline"
          className="border-border"
        >
          Export JSON
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-border"
        >
          Print PDF
        </Button>
      </div>
    </div>
  )
}
