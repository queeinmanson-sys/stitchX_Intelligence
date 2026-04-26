'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import Login from '@/components/login'
import { ToastProvider } from '@/components/stitchx-toast'
import { InspectionProvider } from '@/components/inspection-context'

const RaceControlDashboard = dynamic(
  () => import('@/components/race-control-dashboard'),
  { ssr: false }
)

export default function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Restoring session…
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <ToastProvider>
      <InspectionProvider>
        <RaceControlDashboard user={user} />
      </InspectionProvider>
    </ToastProvider>
  )
}
