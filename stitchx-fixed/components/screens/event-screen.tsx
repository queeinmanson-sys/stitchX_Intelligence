'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useInspection } from '@/components/inspection-context'
import { useToast } from '@/components/stitchx-toast'
import { EVENTS } from '@/lib/data'

export function EventScreen() {
  const { selectEvent, setScreen, enableEvaluatorMode } = useInspection()
  const toast = useToast()
  
  const [eventIndex, setEventIndex] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)
  const [date, setDate] = useState('')

  useEffect(() => {
    // Set default date to today
    setDate(new Date().toISOString().slice(0, 10))
    // Enable evaluator mode on mount
    enableEvaluatorMode()
  }, [enableEvaluatorMode])

  const currentEvent = EVENTS[eventIndex] || EVENTS[0]

  const handleStartInspection = () => {
    selectEvent(eventIndex, stageIndex)
    setScreen('scan')
    toast('Event selected - ready to scan')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">Official Access</h3>
          <p className="text-sm text-muted-foreground">Select event details</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="block text-xs text-muted-foreground uppercase tracking-wider">Event</span>
          <select
            value={eventIndex}
            onChange={(e) => {
              setEventIndex(Number(e.target.value))
              setStageIndex(0)
            }}
            className="w-full bg-secondary border border-border text-foreground px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary"
          >
            {EVENTS.map((event, i) => (
              <option key={i} value={i}>
                {event.name} — {event.location}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs text-muted-foreground uppercase tracking-wider">Stage</span>
          <select
            value={stageIndex}
            onChange={(e) => setStageIndex(Number(e.target.value))}
            className="w-full bg-secondary border border-border text-foreground px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary"
          >
            {currentEvent.stages.map((stage, i) => (
              <option key={i} value={i}>{stage}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs text-muted-foreground uppercase tracking-wider">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-secondary border border-border text-foreground px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="space-y-2">
          <span className="block text-xs text-muted-foreground uppercase tracking-wider">Location</span>
          <input
            type="text"
            value={currentEvent.location}
            readOnly
            className="w-full bg-secondary border border-border text-foreground px-3 py-3 rounded-xl outline-none"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleStartInspection}
          className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground font-bold px-6"
        >
          Start Inspection
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Evaluator mode is active. Select an event to begin the inspection workflow.
      </p>
    </div>
  )
}
