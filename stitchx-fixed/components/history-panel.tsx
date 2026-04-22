'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { getLocalInspections, exportInspectionsCSV, exportInspectionsJSON } from '@/lib/inspection-store'
import type { SavedInspection } from '@/lib/types'
import { cn } from '@/lib/utils'

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso || ''
  }
}

export function HistoryPanel() {
  const [inspections, setInspections] = useState<SavedInspection[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterResult, setFilterResult] = useState<string>('ALL')

  const loadInspections = useCallback(() => {
    setInspections(getLocalInspections())
  }, [])

  useEffect(() => {
    loadInspections()
    // Refresh every 2 seconds to catch new saves
    const interval = setInterval(loadInspections, 2000)
    return () => clearInterval(interval)
  }, [loadInspections])

  const filteredInspections = inspections.filter(row => {
    const matchesFilter = filterResult === 'ALL' || row.overall_result === filterResult
    if (!matchesFilter) return false
    
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const hay = [row.rider, row.team, row.bib, row.bike_tag].join(' ').toLowerCase()
    return hay.includes(q)
  })

  const handleExportCSV = () => {
    exportInspectionsCSV()
  }

  const handleExportJSON = () => {
    exportInspectionsJSON()
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-4 shadow-lg space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">Recent Inspections</h3>
          <span className="text-xs text-muted-foreground">{filteredInspections.length} records</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tag, rider, team"
          className="flex-1 bg-secondary border border-border text-foreground px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="bg-secondary border border-border text-foreground px-3 py-2 rounded-xl text-sm outline-none"
        >
          <option value="ALL">All</option>
          <option value="PASS">Pass</option>
          <option value="WARNING">Warning</option>
          <option value="FAIL">Fail</option>
        </select>
      </div>

      {/* Export buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          className="border-border text-xs"
        >
          Download Final CSV
        </Button>
        <Button
          onClick={handleExportJSON}
          variant="outline"
          size="sm"
          className="border-border text-xs"
        >
          Download Backup JSON
        </Button>
      </div>

      {/* History list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredInspections.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">
            No inspections yet
          </div>
        ) : (
          filteredInspections.map((row, index) => (
            <div
              key={`${row.created_at}-${index}`}
              className={cn(
                'p-3 border rounded-2xl bg-secondary',
                row.overall_result === 'FAIL' && 'border-l-4 border-l-stitchx-red bg-stitchx-red/5',
                row.overall_result === 'WARNING' && 'border-l-4 border-l-stitchx-gold bg-stitchx-gold/5',
                row.overall_result === 'PASS' && 'border-l-4 border-l-stitchx-green'
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <strong className="text-foreground">{row.rider}</strong>
                  <span className="text-muted-foreground ml-2">#{row.bib}</span>
                </div>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  row._synced ? 'bg-stitchx-green/20 text-stitchx-green' : 'bg-stitchx-gold/20 text-stitchx-gold'
                )}>
                  {row._synced ? 'Synced' : 'Pending'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {row.bike_brand} {row.frame_model}
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className={cn(
                  'font-semibold',
                  row.overall_result === 'PASS' && 'text-stitchx-green',
                  row.overall_result === 'WARNING' && 'text-stitchx-gold',
                  row.overall_result === 'FAIL' && 'text-stitchx-red'
                )}>
                  {row.overall_result}
                </span>
                <span className="text-muted-foreground">
                  {formatDateTime(row.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
