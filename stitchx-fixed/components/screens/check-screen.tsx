'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useInspection } from '@/components/inspection-context'
import { useToast } from '@/components/stitchx-toast'
import { CHECK_SECTIONS } from '@/lib/data'
import { cn } from '@/lib/utils'
import type { CheckResult } from '@/lib/types'

const RESULT_OPTIONS: CheckResult['result'][] = ['PASS', 'WARNING', 'FAIL', 'SKIP']

export function CheckScreen() {
  const { inspectionDraft, updateCheck, updateNotes, markPhotoAdded, completeInspection, setScreen } = useInspection()
  const toast = useToast()
  
  const [notes, setNotes] = useState(inspectionDraft?.notes || '')
  const [photoConfirmed, setPhotoConfirmed] = useState(inspectionDraft?.photoAdded || false)

  if (!inspectionDraft) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No inspection in progress
      </div>
    )
  }

  const getCheckResult = (code: string): CheckResult['result'] => {
    return inspectionDraft.checks.find(c => c.code === code)?.result || 'SKIP'
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    updateNotes(value)
  }

  const handlePhotoConfirm = () => {
    setPhotoConfirmed(true)
    markPhotoAdded()
    toast('Photo marked as added')
  }

  const handleComplete = () => {
    updateNotes(notes)
    completeInspection()
    toast('Inspection complete - review summary')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">Compliance Check</h3>
          <p className="text-sm text-muted-foreground">Complete all checklist items</p>
        </div>
      </div>

      {/* Checklist sections */}
      <div className="space-y-4">
        {CHECK_SECTIONS.map(section => (
          <div key={section.section} className="space-y-2">
            <h4 className="font-semibold text-foreground">{section.section}</h4>
            {section.items.map(item => {
              const currentResult = getCheckResult(item.code)
              return (
                <div
                  key={item.code}
                  className="p-3 border border-border rounded-2xl bg-secondary"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <span className="font-medium">{item.label}</span>
                    <div className="flex gap-1">
                      {RESULT_OPTIONS.map(result => (
                        <button
                          key={result}
                          onClick={() => updateCheck(item.code, result)}
                          className={cn(
                            'px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all',
                            currentResult === result
                              ? result === 'PASS'
                                ? 'bg-stitchx-green/20 text-stitchx-green border-stitchx-green/50'
                                : result === 'WARNING'
                                  ? 'bg-stitchx-gold/20 text-stitchx-gold border-stitchx-gold/50'
                                  : result === 'FAIL'
                                    ? 'bg-stitchx-red/20 text-stitchx-red border-stitchx-red/50'
                                    : 'bg-stitchx-blue/20 text-stitchx-blue border-stitchx-blue/50'
                              : 'bg-card border-border text-muted-foreground hover:border-muted-foreground/50'
                          )}
                        >
                          {result}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Notes */}
      <label className="block space-y-2">
        <span className="block text-xs text-muted-foreground uppercase tracking-wider">Inspection notes</span>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add technical notes, concerns or follow-up..."
          rows={4}
          className="w-full bg-secondary border border-border text-foreground px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary resize-y min-h-[100px]"
        />
      </label>

      {/* Photo evidence */}
      <label className="block space-y-2">
        <span className="block text-xs text-muted-foreground uppercase tracking-wider">Photo evidence</span>
        <input
          type="file"
          accept="image/*"
          className="w-full bg-secondary border border-border text-foreground px-3 py-3 rounded-xl outline-none"
        />
      </label>

      <div className="flex items-center gap-3">
        <Button
          onClick={handlePhotoConfirm}
          variant="outline"
          className="border-border"
          disabled={photoConfirmed}
        >
          {photoConfirmed ? 'Photo Confirmed' : 'Confirm Photo Added'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {photoConfirmed ? 'Photo confirmed' : 'No photo attached'}
        </span>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setScreen('profile')}
          variant="outline"
          className="border-border"
        >
          Back
        </Button>
        <Button
          onClick={handleComplete}
          className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground font-bold px-6"
        >
          Complete Inspection
        </Button>
      </div>
    </div>
  )
}
