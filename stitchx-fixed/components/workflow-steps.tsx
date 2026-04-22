'use client'

import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'login', label: '1. Login' },
  { key: 'event', label: '2. Event' },
  { key: 'scan', label: '3. Scan' },
  { key: 'check', label: '4. Check' },
  { key: 'save', label: '5. Save' }
]

interface WorkflowStepsProps {
  currentStep: string
}

export function WorkflowSteps({ currentStep }: WorkflowStepsProps) {
  // Map profile to scan for display purposes
  const displayStep = currentStep === 'profile' ? 'scan' : currentStep

  return (
    <div className="bg-card border border-border rounded-3xl p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-lg">Inspection Workflow</h3>
        <span className="text-xs text-muted-foreground">Login → Event → Scan → Check → Save</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {STEPS.map(step => (
          <div
            key={step.key}
            className={cn(
              'px-2.5 py-2.5 rounded-xl border text-center text-xs transition-colors',
              displayStep === step.key
                ? 'border-primary text-primary'
                : 'bg-card border-border text-muted-foreground'
            )}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  )
}
