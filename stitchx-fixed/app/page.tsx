"use client"

import RaceControlDashboard from "@/components/race-control-dashboard"
import { ToastProvider } from "@/components/stitchx-toast"
import { InspectionProvider } from "@/components/inspection-context"

export default function Page() {
  return (
    <ToastProvider>
      <InspectionProvider>
        <RaceControlDashboard />
      </InspectionProvider>
    </ToastProvider>
  )
}
