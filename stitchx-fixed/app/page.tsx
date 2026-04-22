"use client"

import dynamic from "next/dynamic"

const RaceControlDashboard = dynamic(
  () => import("@/components/race-control-dashboard"),
  { ssr: false }
)

export default function Page() {
  return <RaceControlDashboard />
}
