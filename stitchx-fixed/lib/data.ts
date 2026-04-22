import type { Event, Bike, CheckSection, GCRider } from './types'

export const EVENTS: Event[] = [
  { name: 'Volta Catalunya', stages: ['Stage 12', 'Stage 13', 'Stage 14'], location: 'Girona → Montserrat' },
  { name: 'Tour de Romandie', stages: ['Stage 2', 'Stage 3', 'Stage 4'], location: 'Sion → Thyon 2000' }
]

export const BIKES: Bike[] = [
  { tagId: '044B536AD71F90', rider: 'T. Pogačar', bib: '11', team: 'UAE Team Emirates', bikeBrand: 'Colnago', frameModel: 'V5Rs', frameSerial: 'COL-V5R-2026-011', wheels: 'ENVE SES 4.5', groupset: 'Shimano Dura-Ace', transponder: 'TRN-33011', status: 'Active' },
  { tagId: '113C8821AB4F72', rider: 'J. Vingegaard', bib: '21', team: 'Visma | Lease a Bike', bikeBrand: 'Cervélo', frameModel: 'R5', frameSerial: 'CRV-R5-2026-021', wheels: 'Reserve 40|44', groupset: 'Shimano Dura-Ace', transponder: 'TRN-33021', status: 'Active' },
  { tagId: '9F22C771A08D11', rider: 'R. Evenepoel', bib: '35', team: 'Soudal Quick-Step', bikeBrand: 'Specialized', frameModel: 'Tarmac SL8', frameSerial: 'SPZ-SL8-2026-035', wheels: 'Roval Rapide', groupset: 'SRAM Red', transponder: 'TRN-33035', status: 'Active' },
  { tagId: 'A17D33BC09FF28', rider: 'P. Roglič', bib: '7', team: 'BORA-hansgrohe', bikeBrand: 'Specialized', frameModel: 'Tarmac SL8', frameSerial: 'SPZ-SL8-2026-007', wheels: 'Roval CLX II', groupset: 'Shimano Dura-Ace', transponder: 'TRN-33007', status: 'Active' },
  { tagId: '8811440AFBC812', rider: 'C. Rodríguez', bib: '62', team: 'INEOS Grenadiers', bikeBrand: 'Pinarello', frameModel: 'Dogma F', frameSerial: 'PIN-DGF-2026-062', wheels: 'Princeton Peak', groupset: 'Shimano Dura-Ace', transponder: 'TRN-33062', status: 'Flagged' }
]

export const CHECK_SECTIONS: CheckSection[] = [
  {
    section: 'Identity',
    items: [
      { code: 'bike_match', label: 'Bike matches rider' },
      { code: 'tag_readable', label: 'Tag readable' },
      { code: 'transponder_match', label: 'Transponder matches record' }
    ]
  },
  {
    section: 'Equipment',
    items: [
      { code: 'frame_approved', label: 'Frame approved' },
      { code: 'wheels_approved', label: 'Wheels approved' },
      { code: 'groupset_compliant', label: 'Groupset compliant' }
    ]
  },
  {
    section: 'Regulations',
    items: [
      { code: 'weight_compliant', label: 'Weight compliant' },
      { code: 'dimensions_compliant', label: 'Dimensions compliant' },
      { code: 'no_illegal_mods', label: 'No illegal modifications' }
    ]
  },
  {
    section: 'Verification',
    items: [
      { code: 'photo_captured', label: 'Photo captured' },
      { code: 'notes_added', label: 'Notes added' }
    ]
  }
]

export const GC_RIDERS: GCRider[] = [
  { rank: 1, bib: 11, name: 'T. Pogačar', team: 'UAE Team Emirates', gap: '0:00', bike: 'Colnago V5Rs', wheels: 'ENVE SES 4.5', status: 'Attacking on final climb', power: '6.4 w/kg', hr: '174 bpm', cadence: '91 rpm', tags: ['Race leader', 'Climbing setup', 'Stable gap'] },
  { rank: 2, bib: 21, name: 'J. Vingegaard', team: 'Visma | Lease a Bike', gap: '+0:18', bike: 'Cervelo R5', wheels: 'Reserve 40/44', status: 'Following first GC accelerations', power: '6.2 w/kg', hr: '171 bpm', cadence: '88 rpm', tags: ['Low-drag position', 'Measured pacing'] },
  { rank: 3, bib: 35, name: 'R. Evenepoel', team: 'Soudal Quick-Step', gap: '+0:42', bike: 'Specialized Tarmac SL8', wheels: 'Roval Rapide', status: 'Bridging to front selection', power: '6.1 w/kg', hr: '176 bpm', cadence: '93 rpm', tags: ['TT engine', 'Fast descent'] },
  { rank: 4, bib: 7, name: 'P. Roglič', team: 'BORA-hansgrohe', gap: '+0:56', bike: 'Specialized Tarmac SL8', wheels: 'Roval CLX II', status: 'Riding defensively', power: '5.9 w/kg', hr: '168 bpm', cadence: '87 rpm', tags: ['Explosive finish', 'Compact setup'] },
  { rank: 5, bib: 62, name: 'C. Rodríguez', team: 'INEOS Grenadiers', gap: '+1:13', bike: 'Pinarello Dogma F', wheels: 'Princeton Peak', status: 'Holding GC group', power: '5.8 w/kg', hr: '167 bpm', cadence: '89 rpm', tags: ['Smooth cadence', 'Controlled effort'] }
]

export const SOCIAL_POSTS = [
  { src: 'Race Radio', msg: 'Breakaway gap drops below 1:15 as UAE increase tempo on lower slopes.' },
  { src: 'Moto 2', msg: 'Front selection forming behind Pogačar, Vingegaard and Evenepoel.' },
  { src: 'Tech Feed', msg: 'Officials report stable transponder reads at intermediate timing point.' },
  { src: 'Fan Cam', msg: 'Montserrat crowds are 5 deep near the final kilometer.' }
]

export const INITIAL_STAGE_STATE = {
  elapsed: 4 * 3600 + 22 * 60 + 18,
  kmToGo: 36,
  avgSpeed: 44.2,
  gapSec: 74,
  kmMarker: 142
}
