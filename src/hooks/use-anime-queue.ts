import { useMemo, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { MediaListEntry } from '@/types/anilist'
import { MediaListStatus } from '@/types/anilist'

interface UseAnimeQueueOptions {
    animeList: MediaListEntry[]
    queueSize?: number
    allowedStatuses?: MediaListStatus[]
    prioritizeHighScored?: boolean
    minScore?: number
}

// Helper functions for better composition
const filterAnimeByStatus = (animeList: MediaListEntry[], statuses: MediaListStatus[]) => {
    return animeList.filter(anime => statuses.includes(anime.status as MediaListStatus))
}

const filterAnimeByScore = (animeList: MediaListEntry[], minScore: number) => {
    return animeList.filter(anime => !anime.score || anime.score >= minScore)
}

const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
}

const prioritizeByScore = (animeList: MediaListEntry[]): MediaListEntry[] => {
    return [...animeList].sort((a, b) => {
        const scoreA = a.score || 0
        const scoreB = b.score || 0
        // Higher score first, but add some randomness
        const scoreDiff = scoreB - scoreA
        return scoreDiff !== 0 ? scoreDiff : Math.random() - 0.5
    })
}

export const useAnimeQueue = ({
    animeList,
    queueSize = 5,
    allowedStatuses = [MediaListStatus.COMPLETED, MediaListStatus.CURRENT],
    prioritizeHighScored = false,
    minScore = 0
}: UseAnimeQueueOptions) => {
    const queryClient = useQueryClient()
    const [currentQueue, setCurrentQueue] = useState<MediaListEntry[]>([])

    // Filter eligible anime with multiple criteria
    const eligibleAnime = useMemo(() => {
        let filtered = filterAnimeByStatus(animeList, allowedStatuses)

        if (minScore > 0) {
            filtered = filterAnimeByScore(filtered, minScore)
        }

        return filtered
    }, [animeList, allowedStatuses, minScore])

    // Generate new queue with different strategies
    const generateQueue = useCallback((strategy: 'random' | 'score' | 'mixed' = 'random') => {
        if (eligibleAnime.length === 0) {
            return []
        }

        const actualQueueSize = Math.min(queueSize, eligibleAnime.length)
        let processedAnime = [...eligibleAnime]

        switch (strategy) {
            case 'score':
                processedAnime = prioritizeByScore(processedAnime)
                break
            case 'mixed':
                // Mix of high-scored and random
                const halfSize = Math.floor(actualQueueSize / 2)
                const highScored = prioritizeByScore(processedAnime).slice(0, halfSize)
                const remaining = processedAnime.filter(anime => !highScored.includes(anime))
                const randomPick = shuffleArray(remaining).slice(0, actualQueueSize - halfSize)
                processedAnime = shuffleArray([...highScored, ...randomPick])
                break
            case 'random':
            default:
                processedAnime = shuffleArray(processedAnime)
                break
        }

        const queue = processedAnime.slice(0, actualQueueSize)

        // Invalidate song queries for new queue items
        queue.forEach(anime => {
            queryClient.invalidateQueries({
                queryKey: ['anime-songs', anime.media.id],
            })
        })

        return queue
    }, [eligibleAnime, queueSize, queryClient])

    // Function to actually update the current queue
    const updateCurrentQueue = useCallback((strategy: 'random' | 'score' | 'mixed' = 'random') => {
        const newQueue = generateQueue(strategy)
        setCurrentQueue(newQueue)
        return newQueue
    }, [generateQueue])

    // Initial queue generation (memoized without side effects)
    const initialQueue = useMemo(() => {
        if (eligibleAnime.length === 0) {
            return []
        }
        const strategy = prioritizeHighScored ? 'score' : 'random'
        return generateQueue(strategy)
    }, [eligibleAnime.length, generateQueue, prioritizeHighScored]) // Only depend on length to avoid constant regeneration

    // Additional utility functions
    const getAnimeByScore = useCallback((minScore: number) => {
        return eligibleAnime.filter(anime => anime.score && anime.score >= minScore)
    }, [eligibleAnime])

    const getTopRatedAnime = useCallback((count: number = 10) => {
        return prioritizeByScore(eligibleAnime).slice(0, count)
    }, [eligibleAnime])

    const replaceInQueue = useCallback((oldAnime: MediaListEntry, newAnime?: MediaListEntry) => {
        const newQueue = [...currentQueue]
        const index = newQueue.findIndex(anime => anime.id === oldAnime.id)

        if (index !== -1) {
            if (newAnime) {
                newQueue[index] = newAnime
            } else {
                // Replace with random anime from eligible list
                const available = eligibleAnime.filter(anime =>
                    !newQueue.some(queueAnime => queueAnime.id === anime.id)
                )
                if (available.length > 0) {
                    const randomAnime = available[Math.floor(Math.random() * available.length)]
                    newQueue[index] = randomAnime
                }
            }
            setCurrentQueue(newQueue)
        }

        return newQueue
    }, [currentQueue, eligibleAnime])

    return {
        // Core data
        eligibleAnime,
        currentQueue,
        initialQueue,

        // Actions
        generateQueue: updateCurrentQueue, // Use the version that updates state
        replaceInQueue,

        // Utilities
        getAnimeByScore,
        getTopRatedAnime,

        // Status
        hasEligibleAnime: eligibleAnime.length > 0,
        eligibleCount: eligibleAnime.length,
        queueIsFull: currentQueue.length >= queueSize,

        // Stats
        averageScore: eligibleAnime.reduce((sum, anime) => sum + (anime.score || 0), 0) / eligibleAnime.length || 0,
        highScoredCount: eligibleAnime.filter(anime => anime.score && anime.score >= 8).length,
    }
} 