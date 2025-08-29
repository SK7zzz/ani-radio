import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePlayerStore } from '@/lib/stores/player-store'
import * as randomSongService from '@/services/random-song-service'
import type { QueueItem } from '@/types/anisong'
import type { UserAnimeListData } from '@/hooks/use-user-anime-list'

// Generate unique ID for queue items
const generateQueueItemId = () => `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Convert RandomSongResponse to QueueItem
const createQueueItem = (songResponse: any): QueueItem => ({
    ...songResponse,
    id: generateQueueItemId(),
    preloaded: false,
    addedAt: new Date()
})

export const usePlayerQueue = () => {
    const queryClient = useQueryClient()
    const {
        queue,
        currentIndex,
        history,
        isInitialized,
        isInitializing,
        hasError,
        setQueue,
        setCurrentIndex,
        addToQueue,
        addToHistory,
        setHistory,
        setInitialized,
        setInitializing,
        setPreloading,
        setError,
        clearQueue,
        shuffleQueue,
        canGoNext: storeCanGoNext,
        canGoPrevious: storeCanGoPrevious,
        isShuffled,
        currentUsername
    } = usePlayerStore()

    // Get cached anime list from TanStack Query
    const getCachedAnimeList = useCallback((username: string) => {
        // Try different strategy keys to find cached data
        const strategies = ['smart', 'normal', 'aggressive', 'conservative']

        for (const strategy of strategies) {
            const cacheData = queryClient.getQueryData<UserAnimeListData>(['user-anime-list', username, strategy])
            if (cacheData?.animeList?.length) {
                console.log(`📚 Found cached anime list with strategy: ${strategy} (${cacheData.animeList.length} entries)`)
                return cacheData.animeList
            }
        }

        console.log(`❌ No cached anime list found for user: ${username}`)
        return null
    }, [queryClient])

    // Initialize queue with random songs from user's anime list
    const initializeQueue = useCallback(async (username: string) => {
        if (isInitializing || isInitialized) {
            console.log('🔄 Queue already initializing or initialized')
            return
        }

        // Safety check: if queue already has songs, don't reinitialize
        if (queue.length > 0) {
            console.log('🔄 Queue already has songs, skipping initialization')
            return
        }

        try {
            setInitializing(true)
            setError(false)
            console.log(`🎵 Initializing music queue for user: ${username}`)

            // Get cached anime list to avoid redundant API calls
            const cachedAnimeList = getCachedAnimeList(username)
            if (cachedAnimeList) {
                console.log(`📚 Using cached anime list with ${cachedAnimeList.length} entries (no AniList API calls needed)`)
            }

            // Only clear if we really need to (not if it's already empty)
            if (queue.length > 0) {
                console.log(`🧹 Clearing existing queue before initialization`)
                clearQueue()
            }

            // Generate initial batch of songs (5 songs to start)
            const initialSongs: QueueItem[] = []
            const songTypes: Array<'opening' | 'ending' | 'insert'> = ['opening', 'ending', 'insert']

            for (let i = 0; i < 5; i++) {
                try {
                    console.log(`🎲 Fetching random song ${i + 1}/5...`)
                    const randomSong = await randomSongService.getRandomSong(username, {
                        songTypes,
                        animeList: cachedAnimeList || undefined // Pass cached list to avoid API calls
                    })

                    const queueItem = createQueueItem(randomSong)
                    initialSongs.push(queueItem)
                    console.log(`✅ Added song: "${queueItem.song.songName}" by ${queueItem.song.songArtist}`)
                } catch (error) {
                    console.warn(`⚠️ Failed to fetch song ${i + 1}:`, error)
                    // Continue trying to get other songs
                }
            }

            if (initialSongs.length === 0) {
                throw new Error('Failed to fetch any songs for the queue')
            }

            // Set queue and start with first song
            setQueue(initialSongs)
            setCurrentIndex(0)
            setInitialized(true)

            console.log(`🎉 Queue initialized with ${initialSongs.length} songs`)

            // Preload additional songs in background
            setTimeout(() => {
                preloadMoreSongs(username, 6)
            }, 1000) // Delay to avoid immediate re-render

        } catch (error) {
            console.error('❌ Failed to initialize queue:', error)
            setError(true, error instanceof Error ? error.message : 'Failed to initialize music queue')
        } finally {
            setInitializing(false)
        }
    }, [isInitializing, isInitialized, queue.length, getCachedAnimeList, setInitializing, setError, clearQueue, setQueue, setCurrentIndex, setInitialized])

    // Preload more songs in background
    const preloadMoreSongs = useCallback(async (username: string, count: number = 6) => {
        try {
            console.log(`🔄 Preloading ${count} additional songs...`)
            setPreloading(true)

            // Get cached anime list to avoid redundant API calls
            const cachedAnimeList = getCachedAnimeList(username)
            if (cachedAnimeList) {
                console.log(`📚 Using cached anime list for preloading (no AniList API calls needed)`)
            }

            const newSongs: QueueItem[] = []
            const songTypes: Array<'opening' | 'ending' | 'insert'> = ['opening', 'ending', 'insert']

            for (let i = 0; i < count; i++) {
                try {
                    const randomSong = await randomSongService.getRandomSong(username, {
                        songTypes,
                        animeList: cachedAnimeList || undefined // Pass cached list to avoid API calls
                    })

                    const queueItem = createQueueItem(randomSong)
                    queueItem.preloaded = true
                    newSongs.push(queueItem)
                } catch (error) {
                    console.warn(`⚠️ Failed to preload song ${i + 1}:`, error)
                }
            }

            if (newSongs.length > 0) {
                addToQueue(newSongs)
                console.log(`✅ Preloaded ${newSongs.length} additional songs`)
            }
        } catch (error) {
            console.warn('⚠️ Failed to preload songs:', error)
        } finally {
            setPreloading(false)
        }
    }, [getCachedAnimeList, addToQueue, setPreloading])

    // Go to next song
    const goToNext = useCallback(async () => {
        if (!storeCanGoNext()) {
            console.log('🚫 Cannot go to next song - end of queue')
            return
        }

        // Safety check: ensure queue is not empty
        if (queue.length === 0) {
            console.error('❌ Cannot go to next song - queue is empty!')
            setError(true, 'Queue is empty')
            return
        }

        try {
            const currentSong = queue[currentIndex]
            if (currentSong) {
                addToHistory(currentSong)
            }

            const newIndex = currentIndex + 1
            setCurrentIndex(newIndex)

            console.log(`⏭️ Moving to next song (${newIndex + 1}/${queue.length})`)

            // Preload more songs when we're getting close to the end
            const remainingSongs = queue.length - newIndex
            if (remainingSongs <= 2 && currentUsername) {
                setTimeout(() => {
                    preloadMoreSongs(currentUsername, 6)
                }, 100) // Small delay to avoid immediate re-render
            }
        } catch (error) {
            console.error('❌ Error going to next song:', error)
            setError(true, 'Failed to go to next song')
        }
    }, [queue, currentIndex, currentUsername, storeCanGoNext, setError, addToHistory, setCurrentIndex, preloadMoreSongs])

    // Go to previous song
    const goToPrevious = useCallback(() => {
        if (!storeCanGoPrevious()) {
            console.log('🚫 Cannot go to previous song')
            return
        }

        try {
            if (history.length > 0) {
                // Go back to last song in history
                const previousSong = history[history.length - 1]
                const newHistory = history.slice(0, -1)
                setHistory(newHistory)

                // Add current song to front of queue and set previous song as current
                const currentSong = queue[currentIndex]
                if (currentSong) {
                    const newQueue = [previousSong, currentSong, ...queue.slice(currentIndex + 1)]
                    setQueue(newQueue)
                    setCurrentIndex(0) // Previous song is now at index 0
                } else {
                    // If no current song, just add previous song to queue
                    const newQueue = [previousSong, ...queue]
                    setQueue(newQueue)
                    setCurrentIndex(0)
                }

                console.log(`⏮️ Returned to previous song: "${previousSong.song.songName}"`)
            } else if (currentIndex > 0) {
                // Simply go back one position in queue
                const newIndex = currentIndex - 1
                setCurrentIndex(newIndex)
                console.log(`⏮️ Moving to previous song in queue (${newIndex + 1}/${queue.length})`)
            }
        } catch (error) {
            console.error('❌ Error going to previous song:', error)
            setError(true, 'Failed to go to previous song')
        }
    }, [history, queue, currentIndex, storeCanGoPrevious, setHistory, setQueue, setCurrentIndex, setError])

    // Shuffle queue (keep current song at the beginning)
    const shuffleCurrentQueue = useCallback(() => {
        if (queue.length <= 1) return

        try {
            const currentSong = queue[currentIndex]
            const otherSongs = queue.filter((_, index) => index !== currentIndex)

            // Fisher-Yates shuffle
            for (let i = otherSongs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                    ;[otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]]
            }

            shuffleQueue(currentSong, otherSongs)
            console.log('🔀 Queue shuffled')
        } catch (error) {
            console.error('❌ Error shuffling queue:', error)
            setError(true, 'Failed to shuffle queue')
        }
    }, [queue, currentIndex, shuffleQueue, setError])

    // Add a specific song to queue
    const addSongToQueue = useCallback(async (username: string, options?: {
        songTypes?: Array<'opening' | 'ending' | 'insert'>
        minScore?: number
    }) => {
        try {
            console.log('🎵 Adding new song to queue...')
            setPreloading(true)

            // Get cached anime list to avoid redundant API calls
            const cachedAnimeList = getCachedAnimeList(username)

            const defaultSongTypes: Array<'opening' | 'ending' | 'insert'> = ['opening', 'ending', 'insert']
            const randomSong = await randomSongService.getRandomSong(username, {
                songTypes: options?.songTypes || defaultSongTypes,
                minScore: options?.minScore,
                animeList: cachedAnimeList || undefined
            })

            const queueItem = createQueueItem(randomSong)
            addToQueue([queueItem])

            console.log(`✅ Added song to queue: "${queueItem.song.songName}" by ${queueItem.song.songArtist}`)
            return queueItem
        } catch (error) {
            console.error('❌ Failed to add song to queue:', error)
            setError(true, 'Failed to add new song to queue')
            throw error
        } finally {
            setPreloading(false)
        }
    }, [getCachedAnimeList, addToQueue, setError, setPreloading])

    // Clear and restart queue
    const restartQueue = useCallback(async (username: string) => {
        try {
            console.log('🔄 Restarting queue...')
            clearQueue()
            await initializeQueue(username)
        } catch (error) {
            console.error('❌ Failed to restart queue:', error)
            setError(true, 'Failed to restart queue')
        }
    }, [clearQueue, initializeQueue, setError])

    // Get queue statistics
    const getQueueStats = useCallback(() => {
        return {
            total: queue.length,
            current: currentIndex + 1,
            remaining: queue.length - currentIndex - 1,
            historyCount: history.length,
            hasNext: storeCanGoNext(),
            hasPrevious: storeCanGoPrevious(),
            isShuffled
        }
    }, [queue.length, currentIndex, history.length, storeCanGoNext, storeCanGoPrevious, isShuffled])

    return {
        // Queue management
        initializeQueue,
        restartQueue,
        addSongToQueue,
        shuffleCurrentQueue,
        preloadMoreSongs,

        // Navigation
        goToNext,
        goToPrevious,
        canGoNext: storeCanGoNext,
        canGoPrevious: storeCanGoPrevious,

        // State
        queue,
        currentIndex,
        history,
        isInitialized,
        isInitializing,
        hasError,

        // Utilities
        getQueueStats
    }
}
