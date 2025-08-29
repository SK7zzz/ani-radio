import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { QueueItem } from '@/types/anisong'

interface PlayerState {
    // Current state
    currentSong: QueueItem | null
    isPlaying: boolean
    duration: number
    currentTime: number
    volume: number
    isMuted: boolean
    isShuffled: boolean
    repeatMode: 'off' | 'one'
    isMinimized: boolean

    // Queue state
    queue: QueueItem[]
    currentIndex: number
    history: QueueItem[]
    isInitialized: boolean
    autoPlayEnabled: boolean
    currentUsername: string

    // Loading states
    isInitializing: boolean
    isPreloading: boolean
    hasError: boolean
    errorMessage: string | null

    // Statistics
    queueStats: {
        total: number
        current: number
        remaining: number
        historyCount: number
        hasNext: boolean
        hasPrevious: boolean
    }
}

interface PlayerActions {
    // Player controls
    setPlaying: (isPlaying: boolean) => void
    setDuration: (duration: number) => void
    setCurrentTime: (currentTime: number) => void
    setVolume: (volume: number) => void
    toggleMute: () => void
    toggleShuffle: () => void
    setRepeatMode: (mode: 'off' | 'one') => void
    toggleMinimize: () => void
    resetPlayback: () => void

    // Queue management
    setQueue: (queue: QueueItem[]) => void
    addToQueue: (songs: QueueItem[]) => void
    setCurrentIndex: (index: number) => void
    incrementIndex: () => void
    decrementIndex: () => void
    addToHistory: (song: QueueItem) => void
    removeFromHistory: () => void
    setHistory: (history: QueueItem[]) => void
    clearQueue: () => void
    shuffleQueue: (currentSong: QueueItem, otherSongs: QueueItem[]) => void

    // User and initialization
    setCurrentUser: (username: string) => void
    setInitialized: (isInitialized: boolean) => void
    setAutoPlay: (enabled: boolean) => void

    // Loading and error states
    setInitializing: (isInitializing: boolean) => void
    setPreloading: (isPreloading: boolean) => void
    setError: (hasError: boolean, errorMessage?: string) => void

    // Utility actions
    updateQueueStats: () => void
    getCurrentSong: () => QueueItem | null
    canGoNext: () => boolean
    canGoPrevious: () => boolean
}

type PlayerStore = PlayerState & PlayerActions

const initialState: PlayerState = {
    // Current state
    currentSong: null,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume: 75,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'off',
    isMinimized: false,

    // Queue state
    queue: [],
    currentIndex: 0,
    history: [],
    isInitialized: false,
    autoPlayEnabled: true,
    currentUsername: '',

    // Loading states
    isInitializing: false,
    isPreloading: false,
    hasError: false,
    errorMessage: null,

    // Statistics
    queueStats: {
        total: 0,
        current: 0,
        remaining: 0,
        historyCount: 0,
        hasNext: false,
        hasPrevious: false,
    }
}

export const usePlayerStore = create<PlayerStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Player controls
            setPlaying: (isPlaying) => set({ isPlaying }),
            setDuration: (duration) => set({ duration }),
            setCurrentTime: (currentTime) => set({ currentTime }),
            setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
            toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
            setRepeatMode: (repeatMode) => set({ repeatMode }),
            toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
            resetPlayback: () => set({ isPlaying: false, currentTime: 0 }),

            // Queue management
            setQueue: (queue) => {
                set({ queue })
                get().updateQueueStats()
            },
            addToQueue: (songs) => {
                set((state) => ({ queue: [...state.queue, ...songs] }))
                get().updateQueueStats()
            },
            setCurrentIndex: (currentIndex) => {
                set({ currentIndex })
                get().updateQueueStats()
                // Update current song
                const state = get()
                const currentSong = state.queue[currentIndex] || null
                set({ currentSong })
            },
            incrementIndex: () => {
                const state = get()
                const newIndex = state.currentIndex + 1
                if (newIndex < state.queue.length) {
                    get().setCurrentIndex(newIndex)
                }
            },
            decrementIndex: () => {
                const state = get()
                const newIndex = Math.max(0, state.currentIndex - 1)
                get().setCurrentIndex(newIndex)
            },
            addToHistory: (song) => {
                set((state) => ({ history: [...state.history, song] }))
                get().updateQueueStats()
            },
            removeFromHistory: () => {
                set((state) => ({ history: state.history.slice(0, -1) }))
                get().updateQueueStats()
            },
            setHistory: (history) => {
                set({ history })
                get().updateQueueStats()
            },
            clearQueue: () => {
                set({
                    queue: [],
                    currentIndex: 0,
                    history: [],
                    currentSong: null,
                    // Don't reset these when clearing queue
                    // isInitialized: false,
                    // hasError: false,
                    // errorMessage: null,
                })
                get().updateQueueStats()
            },
            shuffleQueue: (currentSong, otherSongs) => {
                set({
                    queue: [currentSong, ...otherSongs],
                    currentIndex: 0,
                    currentSong,
                })
                get().updateQueueStats()
            },

            // User and initialization
            setCurrentUser: (currentUsername) => set({ currentUsername }),
            setInitialized: (isInitialized) => set({ isInitialized }),
            setAutoPlay: (autoPlayEnabled) => set({ autoPlayEnabled }),

            // Loading and error states
            setInitializing: (isInitializing) => set({ isInitializing }),
            setPreloading: (isPreloading) => set({ isPreloading }),
            setError: (hasError, errorMessage = undefined) => set({ hasError, errorMessage }),

            // Utility actions
            updateQueueStats: () => {
                const state = get()
                const queueStats = {
                    total: state.queue.length,
                    current: state.currentIndex + 1,
                    remaining: state.queue.length - state.currentIndex - 1,
                    historyCount: state.history.length,
                    hasNext: state.currentIndex < state.queue.length - 1,
                    hasPrevious: state.history.length > 0 || state.currentIndex > 0,
                }
                set({ queueStats })
            },
            getCurrentSong: () => {
                const state = get()
                return state.queue[state.currentIndex] || null
            },
            canGoNext: () => {
                const state = get()
                return state.currentIndex < state.queue.length - 1
            },
            canGoPrevious: () => {
                const state = get()
                return state.history.length > 0 || state.currentIndex > 0
            },
        }),
        {
            name: 'player-store',
        }
    )
) 