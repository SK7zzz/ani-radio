import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import userAnimeService from '@/services/user-anime-service'
import type { User, MediaListEntry } from '@/types/anilist'
import { MediaListStatus } from '@/types/anilist'

interface UseUserAnimeListOptions {
    username?: string
    enabled?: boolean
    strategy?: 'aggressive' | 'normal' | 'conservative' | 'smart'
    includeStats?: boolean
}

export interface UserAnimeListData {
    user: User
    animeList: MediaListEntry[]
    fromCache: boolean
    stats?: {
        total: number
        completed: number
        current: number
        planned: number
        dropped: number
        paused: number
    }
}

// Helper functions for better composition
const validateUsername = (username?: string): string => {
    if (!username?.trim()) {
        throw new Error('Username is required')
    }
    return username.trim()
}

const getCacheConfig = (strategy: 'aggressive' | 'normal' | 'conservative' | 'smart') => {
    switch (strategy) {
        case 'aggressive':
            return { staleTime: 1000 * 60 * 15, gcTime: 1000 * 60 * 30 } // 15min stale, 30min cache
        case 'conservative':
            return { staleTime: 1000 * 60 * 60, gcTime: 1000 * 60 * 120 } // 1h stale, 2h cache
        case 'smart':
        case 'normal':
        default:
            return { staleTime: 1000 * 60 * 30, gcTime: 1000 * 60 * 60 } // 30min stale, 1h cache
    }
}

const calculateStats = (animeList: MediaListEntry[]) => {
    return animeList.reduce((acc, anime) => {
        acc.total++
        switch (anime.status) {
            case 'COMPLETED': acc.completed++; break
            case 'CURRENT': acc.current++; break
            case 'PLANNING': acc.planned++; break
            case 'DROPPED': acc.dropped++; break
            case 'PAUSED': acc.paused++; break
        }
        return acc
    }, {
        total: 0,
        completed: 0,
        current: 0,
        planned: 0,
        dropped: 0,
        paused: 0
    })
}

export const useUserAnimeList = ({
    username,
    enabled = true,
    strategy = 'smart',
    includeStats = false
}: UseUserAnimeListOptions) => {
    const queryClient = useQueryClient()
    const cacheConfig = getCacheConfig(strategy)

    // Main query
    const query = useQuery({
        queryKey: ['user-anime-list', username, strategy],
        queryFn: async (): Promise<UserAnimeListData> => {
            const cleanUsername = validateUsername(username)
            const data = await userAnimeService.loadUserAndAnimeList(cleanUsername)

            return {
                ...data,
                stats: includeStats ? calculateStats(data.animeList) : undefined
            }
        },
        enabled: enabled && !!username?.trim(),
        ...cacheConfig,
        retry: (failureCount, error) => {
            if (error?.message?.includes('not found')) {
                return false
            }
            return failureCount < 2
        },
    })

    // Clear cache mutation
    const clearCacheMutation = useMutation({
        mutationFn: async () => {
            await userAnimeService.cache.clear()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-anime-list'] })
        }
    })

    // Get random anime mutation
    const getRandomAnimeMutation = useMutation({
        mutationFn: async (options?: { statuses?: MediaListStatus[] }) => {
            if (!query.data?.user.id) {
                throw new Error('User data not loaded')
            }
            const statuses = options?.statuses || [MediaListStatus.COMPLETED, MediaListStatus.CURRENT]
            return await userAnimeService.getRandomAnime(query.data.user.id, statuses)
        }
    })

    // Helper functions
    const getAnimeByStatus = useCallback((statuses: MediaListStatus[]) => {
        if (!query.data?.animeList) return []
        return query.data.animeList.filter(anime =>
            statuses.includes(anime.status as MediaListStatus)
        )
    }, [query.data?.animeList])

    const getTopRatedAnime = useCallback((count: number = 10) => {
        if (!query.data?.animeList) return []
        return [...query.data.animeList]
            .filter(anime => anime.score && anime.score > 0)
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, count)
    }, [query.data?.animeList])

    return {
        // Main data and states
        ...query,

        // Enhanced data access
        user: query.data?.user,
        animeList: query.data?.animeList || [],
        stats: query.data?.stats,
        fromCache: query.data?.fromCache || false,

        // Actions
        clearCache: clearCacheMutation.mutate,
        isClearingCache: clearCacheMutation.isPending,
        getRandomAnime: getRandomAnimeMutation.mutate,
        randomAnime: getRandomAnimeMutation.data,
        isGettingRandomAnime: getRandomAnimeMutation.isPending,

        // Helper functions
        getAnimeByStatus,
        getTopRatedAnime,

        // Quick filters
        completedAnime: getAnimeByStatus([MediaListStatus.COMPLETED]),
        currentAnime: getAnimeByStatus([MediaListStatus.CURRENT]),
        plannedAnime: getAnimeByStatus([MediaListStatus.PLANNING]),

        // Computed properties
        hasAnime: (query.data?.animeList?.length || 0) > 0,
        totalCount: query.data?.stats?.total || query.data?.animeList?.length || 0,
        completedCount: query.data?.stats?.completed || 0,
        currentCount: query.data?.stats?.current || 0,
    }
} 