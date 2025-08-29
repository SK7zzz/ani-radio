import { useRef, useCallback, useReducer, useEffect } from 'react'
import { usePlayerStore } from '@/lib/stores/player-store'

// Player state types
type PlayerState = {
    isPlaying: boolean
    duration: number
    currentTime: number
    volume: number
    isMuted: boolean
    isShuffled: boolean
    repeatMode: 'off' | 'one'
    isMinimized: boolean
}

type PlayerAction =
    | { type: 'PLAY' }
    | { type: 'PAUSE' }
    | { type: 'TOGGLE_PLAY_PAUSE' }
    | { type: 'SET_DURATION'; payload: number }
    | { type: 'SET_CURRENT_TIME'; payload: number }
    | { type: 'SET_VOLUME'; payload: number }
    | { type: 'TOGGLE_MUTE' }
    | { type: 'TOGGLE_SHUFFLE' }
    | { type: 'SET_REPEAT_MODE'; payload: 'off' | 'one' }
    | { type: 'TOGGLE_MINIMIZE' }
    | { type: 'RESET_PLAYBACK' }

const initialPlayerState: PlayerState = {
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume: 75,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'off',
    isMinimized: false,
}

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
    switch (action.type) {
        case 'PLAY':
            return { ...state, isPlaying: true }

        case 'PAUSE':
            return { ...state, isPlaying: false }

        case 'TOGGLE_PLAY_PAUSE':
            return { ...state, isPlaying: !state.isPlaying }

        case 'SET_DURATION':
            return { ...state, duration: action.payload }

        case 'SET_CURRENT_TIME':
            return { ...state, currentTime: action.payload }

        case 'SET_VOLUME':
            return {
                ...state,
                volume: action.payload,
                isMuted: action.payload === 0
            }

        case 'TOGGLE_MUTE':
            return { ...state, isMuted: !state.isMuted }

        case 'TOGGLE_SHUFFLE':
            return { ...state, isShuffled: !state.isShuffled }

        case 'SET_REPEAT_MODE':
            return { ...state, repeatMode: action.payload }

        case 'TOGGLE_MINIMIZE':
            return { ...state, isMinimized: !state.isMinimized }

        case 'RESET_PLAYBACK':
            return {
                ...state,
                isPlaying: false,
                currentTime: 0
            }

        default:
            return state
    }
}

interface UseMusicPlayerProps {
    audioUrl?: string
    fallbackUrls?: string[] // Array of fallback URLs [MQ, HQ]
    autoPlay?: boolean
    song?: {
        title: string
        hasValidAudio: boolean
    }
    onNext?: () => void
    onPrevious?: () => void
}

export const useMusicPlayer = ({
    audioUrl,
    fallbackUrls = [],
    autoPlay = false,
    song,
    onNext,
}: UseMusicPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [playerState, dispatch] = useReducer(playerReducer, initialPlayerState)
    const currentUrlIndex = useRef(0)
    const allUrls = useRef<string[]>([])
    const hasTriedFallback = useRef(false)

    // Get global player state for synchronization
    const globalPlayerState = usePlayerStore()

    // Destructure for easier access
    const {
        isPlaying,
        duration,
        currentTime,
        volume,
        isMuted,
        isShuffled,
        repeatMode,
        isMinimized
    } = playerState

    // Sync with global player store when it changes
    useEffect(() => {
        if (globalPlayerState.isPlaying !== isPlaying && audioRef.current) {
            if (globalPlayerState.isPlaying && !isPlaying) {
                // Global store says play, but local state is paused
                audioRef.current.play()
                    .then(() => {
                        dispatch({ type: 'PLAY' })
                    })
                    .catch((_error) => {
                        // console.warn('Auto-play failed:', error)
                        // Update global store to reflect actual state
                        globalPlayerState.setPlaying(false)
                    })
            } else if (!globalPlayerState.isPlaying && isPlaying) {
                // Global store says pause, but local state is playing
                audioRef.current.pause()
                dispatch({ type: 'PAUSE' })
            }
        }
    }, [globalPlayerState.isPlaying, isPlaying, globalPlayerState.setPlaying])

    // Audio setup with ref callback (no useEffect needed!)
    const audioRefCallback = useCallback((audioElement: HTMLAudioElement | null) => {
        if (audioElement) {
            audioRef.current = audioElement

            // Set initial volume
            audioElement.volume = isMuted ? 0 : volume / 100

            // Configure audio element for better performance
            audioElement.preload = 'metadata' // Only load metadata initially
            audioElement.crossOrigin = 'anonymous' // Handle CORS

            // If we have an audioUrl, set it up immediately
            if (audioUrl) {
                audioElement.src = audioUrl
                audioElement.volume = isMuted ? 0 : volume / 100
                audioElement.load()
                dispatch({ type: 'RESET_PLAYBACK' })

                // Auto-play setup
                const handleLoadedData = () => {
                    if (autoPlay && audioElement && song?.hasValidAudio) {
                        audioElement.play()
                            .then(() => {
                                dispatch({ type: 'PLAY' })
                                // Sync with global store
                                globalPlayerState.setPlaying(true)
                            })
                            .catch(() => {
                                // Auto-play failed (browser policy)
                                globalPlayerState.setPlaying(false)
                            })
                    }
                }

                audioElement.addEventListener('loadeddata', handleLoadedData)

                // Cleanup function stored in a closure
                const cleanup = () => {
                    audioElement.removeEventListener('loadeddata', handleLoadedData)
                }

                    // Store cleanup for later use
                    ; (audioElement as any).__cleanup = cleanup
            }
        }
    }, [audioUrl, song?.title, song?.hasValidAudio, autoPlay])

    // Audio source change handler with fallback support
    const updateAudioSource = useCallback(() => {
        if (!audioRef.current) return

        // Build array of URLs to try (primary + fallbacks)
        const urlsToTry = audioUrl ? [audioUrl, ...fallbackUrls.filter(Boolean)] : []
        allUrls.current = urlsToTry
        currentUrlIndex.current = 0
        hasTriedFallback.current = false

        if (urlsToTry.length === 0) return

        const tryLoadUrl = (urlIndex: number) => {
            if (!audioRef.current || urlIndex >= urlsToTry.length) return

            const currentUrl = urlsToTry[urlIndex]
            if (!currentUrl) return

            // Cleanup previous listeners
            if ((audioRef.current as any).__cleanup) {
                ; (audioRef.current as any).__cleanup()
            }

            // Reset playback state only for the first URL
            if (urlIndex === 0) {
                dispatch({ type: 'RESET_PLAYBACK' })
            }

            // Set up new audio source
            audioRef.current.src = currentUrl
            audioRef.current.volume = isMuted ? 0 : volume / 100
            audioRef.current.preload = 'metadata'
            audioRef.current.load()

            const handleLoadedData = () => {
                if (autoPlay && audioRef.current && song?.hasValidAudio) {
                    audioRef.current.play()
                        .then(() => {
                            dispatch({ type: 'PLAY' })
                            // Sync with global store
                            globalPlayerState.setPlaying(true)
                        })
                        .catch(() => {
                            // Auto-play failed (browser policy)
                            globalPlayerState.setPlaying(false)
                        })
                }
            }

            const handlePlay = () => {
                if (audioRef.current && audioRef.current.preload !== 'auto') {
                    audioRef.current.preload = 'auto'
                }
            }

            // Handle loading errors (404, etc.) - TRY NEXT URL
            const handleError = () => {
                const nextIndex = urlIndex + 1
                if (nextIndex < urlsToTry.length && !hasTriedFallback.current) {
                    // console.warn(`❌ Audio URL failed (${currentUrl}), trying fallback...`)
                    hasTriedFallback.current = true
                    currentUrlIndex.current = nextIndex
                    tryLoadUrl(nextIndex)
                } else {
                    // console.error(`❌ All audio URLs failed for song: ${song?.title}`)
                }
            }

            audioRef.current.addEventListener('loadeddata', handleLoadedData)
            audioRef.current.addEventListener('play', handlePlay)
            audioRef.current.addEventListener('error', handleError)

                // Store cleanup
                ; (audioRef.current as any).__cleanup = () => {
                    audioRef.current?.removeEventListener('loadeddata', handleLoadedData)
                    audioRef.current?.removeEventListener('play', handlePlay)
                    audioRef.current?.removeEventListener('error', handleError)
                }
        }

        // Start loading the first URL
        tryLoadUrl(0)
    }, [audioUrl, fallbackUrls, song?.title, song?.hasValidAudio, autoPlay, isMuted, volume])

    // Call updateAudioSource when dependencies change (replaces useEffect)
    const prevAudioUrl = useRef(audioUrl)
    const prevSongTitle = useRef(song?.title)

    if (prevAudioUrl.current !== audioUrl || prevSongTitle.current !== song?.title) {
        prevAudioUrl.current = audioUrl
        prevSongTitle.current = song?.title
        updateAudioSource()
    }

    // Handle volume changes separately without resetting the audio source
    const prevVolume = useRef(volume)
    const prevIsMuted = useRef(isMuted)

    if (audioRef.current && (prevVolume.current !== volume || prevIsMuted.current !== isMuted)) {
        prevVolume.current = volume
        prevIsMuted.current = isMuted
        audioRef.current.volume = isMuted ? 0 : volume / 100
    }

    // Audio event handlers
    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            dispatch({ type: 'SET_DURATION', payload: audioRef.current.duration || 0 })
        }
    }, [])

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            dispatch({ type: 'SET_CURRENT_TIME', payload: audioRef.current.currentTime || 0 })
        }
    }, [])

    const handleEnded = useCallback(() => {
        dispatch({ type: 'PAUSE' })
        // Sync with global store
        globalPlayerState.setPlaying(false)

        if (repeatMode === 'one') {
            // Repeat same song
            if (audioRef.current) {
                audioRef.current.currentTime = 0
                audioRef.current.play()
                dispatch({ type: 'PLAY' })
                // Sync with global store
                globalPlayerState.setPlaying(true)
            }
        } else if (onNext) {
            // Auto-advance to next song (auto-play will be handled by the effect)
            onNext()
        }
    }, [repeatMode, onNext, globalPlayerState.setPlaying])

    // Control handlers
    const handlePlay = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play()
            dispatch({ type: 'PLAY' })
            // Sync with global store
            globalPlayerState.setPlaying(true)
        }
    }, [globalPlayerState.setPlaying])

    const handlePause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            dispatch({ type: 'PAUSE' })
            // Sync with global store
            globalPlayerState.setPlaying(false)
        }
    }, [globalPlayerState.setPlaying])

    const handlePlayPause = useCallback(() => {
        if (isPlaying) {
            handlePause()
        } else {
            handlePlay()
        }
    }, [isPlaying, handlePlay, handlePause])

    const handleSeek = useCallback((value: number[]) => {
        if (audioRef.current) {
            const newTime = (value[0] / 100) * duration
            audioRef.current.currentTime = newTime
            dispatch({ type: 'SET_CURRENT_TIME', payload: newTime })
        }
    }, [duration])

    const handleVolumeChange = useCallback((value: number[]) => {
        const newVolume = value[0]
        dispatch({ type: 'SET_VOLUME', payload: newVolume })
        // Update audio element volume immediately
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100
        }
    }, [])

    const handleMute = useCallback(() => {
        dispatch({ type: 'TOGGLE_MUTE' })
        // Update audio element volume immediately
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = volume / 100
            } else {
                audioRef.current.volume = 0
            }
        }
    }, [isMuted, volume])

    const handleShuffle = useCallback(() => {
        dispatch({ type: 'TOGGLE_SHUFFLE' })
    }, [])

    const handleRepeatMode = useCallback(() => {
        const nextMode = repeatMode === 'off' ? 'one' : 'off'
        dispatch({ type: 'SET_REPEAT_MODE', payload: nextMode })
    }, [repeatMode])

    const handleMinimize = useCallback(() => {
        dispatch({ type: 'TOGGLE_MINIMIZE' })
    }, [])

    // Format time utility
    const formatTime = useCallback((time: number): string => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }, [])

    // Progress percentage
    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

    return {
        // State
        playerState: {
            isPlaying,
            duration,
            currentTime,
            volume,
            isMuted,
            isShuffled,
            repeatMode,
            isMinimized,
            progressPercentage,
        },

        // Refs and callbacks
        audioRefCallback,

        // Event handlers for audio element
        audioEventHandlers: {
            onLoadedMetadata: handleLoadedMetadata,
            onTimeUpdate: handleTimeUpdate,
            onEnded: handleEnded,
        },

        // Control handlers
        controls: {
            play: handlePlay,
            pause: handlePause,
            playPause: handlePlayPause,
            seek: handleSeek,
            volumeChange: handleVolumeChange,
            mute: handleMute,
            shuffle: handleShuffle,
            repeatMode: handleRepeatMode,
            minimize: handleMinimize,
        },

        // Utilities
        utils: {
            formatTime,
        },
    }
} 