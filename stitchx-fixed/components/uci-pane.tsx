'use client'

import { useInspection } from '@/components/inspection-context'
import { WorkflowSteps } from '@/components/workflow-steps'
import { HistoryPanel } from '@/components/history-panel'
import { EventScreen, ScanScreen, ProfileScreen, CheckScreen, SaveScreen } from '@/components/screens'

export function UCIPane() {
  const { currentScreen } = useInspection()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
      {/* Left column - workflow and history */}
      <div className="space-y-4">
        <WorkflowSteps currentStep={currentScreen} />
        <HistoryPanel />
      </div>

      {/* Main column - current screen */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-lg min-h-[700px]">
        {currentScreen === 'login' && <EventScreen />}
        {currentScreen === 'event' && <EventScreen />}
        {currentScreen === 'scan' && <ScanScreen />}
        {currentScreen === 'profile' && <ProfileScreen />}
        {currentScreen === 'check' && <CheckScreen />}
        {currentScreen === 'save' && <SaveScreen />}
      </div>
    </div>
  )
}
