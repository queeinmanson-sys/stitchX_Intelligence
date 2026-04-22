'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Event, Bike, CheckResult, InspectionDraft, SavedInspection, AppUser, AppProfile } from '@/lib/types'
import { EVENTS, CHECK_SECTIONS } from '@/lib/data'
import { deriveOverallResult, saveInspection as saveToStorage } from '@/lib/inspection-store'

type WorkflowScreen = 'login' | 'event' | 'scan' | 'profile' | 'check' | 'save'

interface InspectionContextType {
  // User state
  currentUser: AppUser | null
  currentProfile: AppProfile | null
  
  // Workflow state
  currentScreen: WorkflowScreen
  currentEvent: Event | null
  currentStage: string | null
  currentBike: Bike | null
  inspectionDraft: InspectionDraft | null
  
  // Actions
  setScreen: (screen: WorkflowScreen) => void
  selectEvent: (eventIndex: number, stageIndex: number) => void
  selectBike: (bike: Bike) => void
  updateCheck: (code: string, result: CheckResult['result']) => void
  updateNotes: (notes: string) => void
  markPhotoAdded: () => void
  completeInspection: () => void
  saveCurrentInspection: () => boolean
  resetInspection: () => void
  enableEvaluatorMode: () => void
}

const InspectionContext = createContext<InspectionContextType | null>(null)

export function InspectionProvider({ children }: { children: ReactNode }) {
  // User state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [currentProfile, setCurrentProfile] = useState<AppProfile | null>(null)
  
  // Workflow state
  const [currentScreen, setCurrentScreen] = useState<WorkflowScreen>('event')
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [currentBike, setCurrentBike] = useState<Bike | null>(null)
  const [inspectionDraft, setInspectionDraft] = useState<InspectionDraft | null>(null)

  const enableEvaluatorMode = useCallback(() => {
    setCurrentUser({
      id: 'evaluator-local-user',
      email: 'evaluator@local'
    })
    setCurrentProfile({
      id: 'evaluator-local-user',
      full_name: 'Evaluator',
      role: 'official'
    })
  }, [])

  const setScreen = useCallback((screen: WorkflowScreen) => {
    setCurrentScreen(screen)
  }, [])

  const selectEvent = useCallback((eventIndex: number, stageIndex: number) => {
    const event = EVENTS[eventIndex] || EVENTS[0]
    setCurrentEvent(event)
    setCurrentStage(event.stages[stageIndex] || event.stages[0])
  }, [])

  const selectBike = useCallback((bike: Bike) => {
    setCurrentBike(bike)
    // Initialize inspection draft with all checks set to SKIP
    const checks: CheckResult[] = CHECK_SECTIONS.flatMap(section =>
      section.items.map(item => ({
        code: item.code,
        result: 'SKIP' as const
      }))
    )
    setInspectionDraft({
      checks,
      notes: '',
      photoAdded: false,
      overall_result: 'PASS',
      created_at: new Date().toISOString()
    })
    setCurrentScreen('profile')
  }, [])

  const updateCheck = useCallback((code: string, result: CheckResult['result']) => {
    setInspectionDraft(draft => {
      if (!draft) return draft
      const updatedChecks = draft.checks.map(c =>
        c.code === code ? { ...c, result } : c
      )
      return {
        ...draft,
        checks: updatedChecks,
        overall_result: deriveOverallResult(updatedChecks)
      }
    })
  }, [])

  const updateNotes = useCallback((notes: string) => {
    setInspectionDraft(draft => {
      if (!draft) return draft
      return { ...draft, notes }
    })
  }, [])

  const markPhotoAdded = useCallback(() => {
    setInspectionDraft(draft => {
      if (!draft) return draft
      return { ...draft, photoAdded: true }
    })
  }, [])

  const completeInspection = useCallback(() => {
    if (!inspectionDraft) return
    setInspectionDraft(draft => {
      if (!draft) return draft
      return {
        ...draft,
        overall_result: deriveOverallResult(draft.checks)
      }
    })
    setCurrentScreen('save')
  }, [inspectionDraft])

  const saveCurrentInspection = useCallback((): boolean => {
    if (!currentBike || !inspectionDraft || !currentUser) {
      return false
    }

    const payload: SavedInspection = {
      user_id: currentUser.id,
      bike_tag: currentBike.tagId,
      rider: currentBike.rider,
      bib: currentBike.bib,
      team: currentBike.team,
      bike_brand: currentBike.bikeBrand,
      frame_model: currentBike.frameModel,
      frame_serial: currentBike.frameSerial,
      transponder: currentBike.transponder,
      overall_result: inspectionDraft.overall_result,
      checks: inspectionDraft.checks,
      notes: inspectionDraft.notes,
      event_name: currentEvent?.name || '',
      created_at: new Date().toISOString(),
      _synced: false
    }

    saveToStorage(payload)
    return true
  }, [currentBike, inspectionDraft, currentUser, currentEvent])

  const resetInspection = useCallback(() => {
    setCurrentBike(null)
    setInspectionDraft(null)
    setCurrentScreen('scan')
  }, [])

  // Auto-enable evaluator mode on mount
  useState(() => {
    enableEvaluatorMode()
  })

  return (
    <InspectionContext.Provider
      value={{
        currentUser,
        currentProfile,
        currentScreen,
        currentEvent,
        currentStage,
        currentBike,
        inspectionDraft,
        setScreen,
        selectEvent,
        selectBike,
        updateCheck,
        updateNotes,
        markPhotoAdded,
        completeInspection,
        saveCurrentInspection,
        resetInspection,
        enableEvaluatorMode
      }}
    >
      {children}
    </InspectionContext.Provider>
  )
}

export function useInspection() {
  const context = useContext(InspectionContext)
  if (!context) {
    throw new Error('useInspection must be used within an InspectionProvider')
  }
  return context
}
