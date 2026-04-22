// StitchX Type Definitions

export interface Event {
  name: string
  stages: string[]
  location: string
}

export interface Bike {
  tagId: string
  rider: string
  bib: string
  team: string
  bikeBrand: string
  frameModel: string
  frameSerial: string
  wheels: string
  groupset: string
  transponder: string
  status: 'Active' | 'Flagged' | 'Inactive'
}

export interface CheckItem {
  code: string
  label: string
}

export interface CheckSection {
  section: string
  items: CheckItem[]
}

export interface CheckResult {
  code: string
  result: 'PASS' | 'WARNING' | 'FAIL' | 'SKIP'
  note?: string
}

export interface InspectionDraft {
  checks: CheckResult[]
  notes: string
  photoAdded: boolean
  overall_result: 'PASS' | 'WARNING' | 'FAIL'
  created_at: string
}

export interface SavedInspection {
  id?: string
  user_id: string
  bike_tag: string
  rider: string
  bib: string
  team: string
  bike_brand: string
  frame_model: string
  frame_serial?: string
  transponder?: string
  overall_result: 'PASS' | 'WARNING' | 'FAIL'
  checks: CheckResult[]
  notes: string
  event_name: string
  created_at: string
  _synced?: boolean
}

export interface AppUser {
  id: string
  email: string
}

export interface AppProfile {
  id: string
  full_name: string
  role: 'official' | 'admin' | 'viewer'
}

export interface GCRider {
  rank: number
  bib: number
  name: string
  team: string
  gap: string
  bike: string
  wheels: string
  status: string
  power: string
  hr: string
  cadence: string
  tags: string[]
}

export interface StageState {
  elapsed: number
  kmToGo: number
  avgSpeed: number
  gapSec: number
  kmMarker: number
}
