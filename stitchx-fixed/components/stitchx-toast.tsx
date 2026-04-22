'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ToastContextType {
  toast: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  const toast = useCallback((msg: string, duration = 2600) => {
    setMessage(msg)
    setVisible(true)
    setTimeout(() => {
      setVisible(false)
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className={cn(
          'fixed left-1/2 bottom-5 -translate-x-1/2 z-50',
          'bg-secondary border border-border rounded-full px-4 py-3',
          'text-sm font-medium text-foreground',
          'transition-all duration-250 ease-out',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5 pointer-events-none'
        )}
      >
        {message}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context.toast
}
