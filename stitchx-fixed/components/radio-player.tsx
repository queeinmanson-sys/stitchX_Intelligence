'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Radio, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { AudioVisualizer } from './audio-visualizer'
import { cn } from '@/lib/utils'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stitchxradio-production.up.railway.app'

interface ApiStatus {
  status: string
  service?: string
}

interface NowPlaying {
  title: string
  artist: string
  live: boolean
}

export function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)
  const [nowPlayingLoading, setNowPlayingLoading] = useState(true)
  const [nowPlayingError, setNowPlayingError] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const previousVolume = useRef(80)

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch(BACKEND_URL)
      if (!response.ok) throw new Error('bad status')
      const data: ApiStatus = await response.json()
      setIsConnected(data.status === 'ok')
    } catch {
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchNowPlaying = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/now-playing`)
      if (response.ok) {
        const data: NowPlaying = await response.json()
        setNowPlaying(data)
        setNowPlayingError(false)
      } else {
        setNowPlayingError(true)
      }
    } catch {
      setNowPlayingError(true)
    } finally {
      setNowPlayingLoading(false)
    }
  }, [])

  useEffect(() => {
    checkConnection()
    fetchNowPlaying()
    const connectionInterval = setInterval(checkConnection, 30000)
    const nowPlayingInterval = setInterval(fetchNowPlaying, 10000)
    return () => {
      clearInterval(connectionInterval)
      clearInterval(nowPlayingInterval)
    }
  }, [checkConnection, fetchNowPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleWaiting = () => setIsBuffering(true)
    const handlePlaying = () => setIsBuffering(false)
    const handleCanPlay = () => setIsBuffering(false)
    const handleEnded = () => setIsPlaying(false)
    const handleError = () => {
      setIsBuffering(false)
      setIsPlaying(false)
    }

    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  const togglePlay = async () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume.current)
    } else {
      previousVolume.current = volume
    }
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) setIsMuted(false)
  }

  return (
    <div className="relative w-full">
      {/* Glow */}
      <div
        className={cn(
          'absolute -inset-1 rounded-3xl blur-xl transition-opacity duration-500',
          isPlaying ? 'opacity-60' : 'opacity-20',
          'bg-gradient-to-r from-primary via-accent to-primary'
        )}
      />

      <div className="relative bg-card border border-border rounded-2xl p-6 backdrop-blur-sm">
        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">stitchX Radio</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
            ) : isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-500">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-destructive" />
                <span className="text-xs text-destructive">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Now playing */}
        <div className="relative rounded-xl bg-secondary/50 overflow-hidden flex items-center justify-center mb-4 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 w-full">
            <div
              className={cn(
                'w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center transition-all duration-300',
                isPlaying && 'animate-pulse border-primary/60'
              )}
            >
              <Radio
                className={cn(
                  'w-10 h-10 text-primary transition-transform duration-300',
                  isPlaying && 'scale-110'
                )}
              />
            </div>
            <div className="text-center min-h-[3rem]">
              {nowPlayingLoading ? (
                <div className="animate-pulse">
                  <div className="h-5 w-32 bg-muted rounded mx-auto mb-2" />
                  <div className="h-3 w-24 bg-muted/60 rounded mx-auto" />
                </div>
              ) : nowPlaying ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-foreground">{nowPlaying.title}</h3>
                    {nowPlaying.live && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-red-500 text-white rounded animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{nowPlaying.artist}</p>
                </>
              ) : nowPlayingError ? (
                <>
                  <h3 className="text-base font-bold text-foreground">stitchX Radio</h3>
                  <p className="text-xs text-muted-foreground">Tune in to the underground</p>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="mb-4">
          <AudioVisualizer isPlaying={isPlaying} />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center mb-4 gap-2">
          <Button
            size="lg"
            onClick={togglePlay}
            disabled={!isConnected}
            className={cn(
              'w-14 h-14 rounded-full transition-all duration-300',
              isPlaying
                ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'
                : 'bg-secondary hover:bg-secondary/80'
            )}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Play className="w-6 h-6 text-foreground ml-0.5" />
            )}
          </Button>
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-wider transition-colors duration-300',
              !isConnected
                ? 'text-destructive'
                : isBuffering
                  ? 'text-accent animate-pulse'
                  : isPlaying
                    ? 'text-primary'
                    : 'text-muted-foreground'
            )}
          >
            {!isConnected
              ? 'Offline'
              : isBuffering
                ? 'Buffering…'
                : isPlaying
                  ? 'Playing'
                  : 'Paused'}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground w-8 text-right">
            {isMuted ? 0 : volume}%
          </span>
        </div>

        {/* Hidden audio */}
        <audio ref={audioRef} src={`${BACKEND_URL}/stream`} preload="none" crossOrigin="anonymous" />
      </div>
    </div>
  )
}
