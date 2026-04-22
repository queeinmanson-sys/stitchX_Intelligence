'use client'

import { cn } from '@/lib/utils'

interface AudioVisualizerProps {
  isPlaying: boolean
  barCount?: number
}

/**
 * Decorative audio visualizer. Pure CSS animation — does not read real
 * audio data (that would require MediaElementAudioSourceNode + CORS on
 * the stream). Bars animate when `isPlaying` is true and flatline otherwise.
 */
export function AudioVisualizer({ isPlaying, barCount = 32 }: AudioVisualizerProps) {
  return (
    <div className="flex items-end justify-center gap-0.5 h-12 w-full">
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block w-1 rounded-sm bg-gradient-to-t from-primary/60 to-accent/80',
            'origin-bottom transition-[height] duration-200',
            isPlaying ? 'animate-visualizer-bar' : 'h-1'
          )}
          style={{
            animationDelay: isPlaying ? `${(i * 73) % 900}ms` : undefined,
            animationDuration: isPlaying ? `${600 + ((i * 41) % 500)}ms` : undefined,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes visualizer-bar {
          0%, 100% { height: 10%; }
          20% { height: 70%; }
          45% { height: 35%; }
          70% { height: 95%; }
          85% { height: 45%; }
        }
        .animate-visualizer-bar {
          animation-name: visualizer-bar;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  )
}
