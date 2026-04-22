'use client'

import type { SavedInspection, CheckResult } from './types'

const STORAGE_KEY = 'stitchx_inspections'

export function getLocalInspections(): SavedInspection[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function setLocalInspections(rows: SavedInspection[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

export function saveInspection(inspection: SavedInspection): void {
  const rows = getLocalInspections()
  rows.unshift(inspection)
  setLocalInspections(rows)
}

export function deriveOverallResult(checks: CheckResult[]): 'PASS' | 'WARNING' | 'FAIL' {
  if (checks.some(c => c.result === 'FAIL')) return 'FAIL'
  if (checks.some(c => c.result === 'WARNING')) return 'WARNING'
  return 'PASS'
}

export function exportInspectionsCSV(): void {
  const rows = getLocalInspections()
  
  if (!rows.length) {
    alert('No inspections to export')
    return
  }

  const headers = [
    'created_at', 'event_name', 'rider', 'bib', 'team',
    'bike_tag', 'bike_brand', 'frame_model', 'overall_result', 'notes', 'synced'
  ]

  const escapeCSV = (value: unknown): string => {
    const str = String(value == null ? '' : value)
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [
    headers.join(','),
    ...rows.map(row =>
      [
        row.created_at,
        row.event_name,
        row.rider,
        row.bib,
        row.team,
        row.bike_tag,
        row.bike_brand,
        row.frame_model,
        row.overall_result,
        row.notes,
        row._synced === true ? 'yes' : 'no'
      ].map(escapeCSV).join(',')
    )
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(`stitchx_inspections_${Date.now()}.csv`, blob)
}

export function exportInspectionsJSON(): void {
  const rows = getLocalInspections()

  if (!rows.length) {
    alert('No inspections to export')
    return
  }

  const payload = {
    exported_at: new Date().toISOString(),
    count: rows.length,
    inspections: rows
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  downloadBlob(`stitchx_inspections_backup_${Date.now()}.json`, blob)
}

export function exportSingleInspectionJSON(
  bike: { tagId: string; rider: string; bib: string; team: string; bikeBrand: string; frameModel: string },
  inspection: { checks: CheckResult[]; notes: string; overall_result: string },
  event: { name: string } | null
): void {
  const payload = {
    bike,
    inspection,
    event,
    exported_at: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  downloadBlob(`inspection_${bike.bib}_${Date.now()}.json`, blob)
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
