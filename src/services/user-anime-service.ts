import * as aniListService from '@/services/anilist-service'
import indexedDBService from '@/lib/stores/indexeddb-service'
import type { User, MediaListEntry } from '@/types/anilist'
import { MediaListStatus } from '@/types/anilist'

// Types for better type safety
export interface UserAnimeData {
    user: User
    animeList: MediaListEntry[]
    fromCache: boolean
}

export interface AnimeStats {
    total: number
    completed: number
    current: number
    planned: number
    dropped: number
    paused: number
}

// Cache configuration
export const CACHE_CONFIG = {
    DEFAULT_MAX_AGE_HOURS: 24,
    CLEANUP_MAX_AGE_DAYS: 7
} as const

// Utility functions
const cleanUsername = (username: string): string => username.trim()

const logUserFound = (user: User): User => {
    // console.log(`✅ User found: ${user.name} (ID: ${user.id})`)
    return user
}

const logAnimeListLoaded = (animeList: MediaListEntry[], _fromCache: boolean): MediaListEntry[] => {
    // const source = fromCache ? 'cache' : 'API and cached'
    // console.log(`📚 Loaded ${animeList.length} anime from ${source}`)
    return animeList
}

// Cache operations
export const cacheOperations = {
    /**
     * Check if user data is cached and valid
     */
    isCached: async (userId: number, maxAgeHours: number = CACHE_CONFIG.DEFAULT_MAX_AGE_HOURS): Promise<boolean> => {
        return indexedDBService.isUserListCached(userId, maxAgeHours)
    },

    /**
     * Get cached user anime list
     */
    getCached: async (userId: number): Promise<MediaListEntry[]> => {
        const cachedData = await indexedDBService.getUserList(userId)
        return cachedData ? indexedDBService.getAllAnimeFromLists(cachedData.lists) : []
    },

    /**
     * Store user anime list in cache
     */
    store: async (userId: number, username: string, lists: any[]): Promise<void> => {
        await indexedDBService.storeUserList(userId, username, lists)
    },

    /**
     * Clear cache for specific user or all
     */
    clear: async (userId?: number): Promise<void> => {
        if (userId) {
            // TODO: Implement user-specific cache clearing
            // console.log(`🗑️ Clearing cache for user: ${userId}`)
        } else {
            await indexedDBService.clearCache()
            // console.log('🗑️ All cache cleared')
        }
    }
}

// Data fetching operations
export const dataOperations = {
    /**
     * Fetch user by username
     */
    fetchUser: async (username: string): Promise<User> => {
        const userResponse = await aniListService.searchUser(username)
        if (!userResponse.User) {
            throw new Error(`User "${username}" not found`)
        }
        return logUserFound(userResponse.User)
    },

    /**
     * Fetch user's anime list from API
     */
    fetchAnimeList: async (username: string, status?: MediaListStatus) => {
        // console.log(`🌐 Fetching fresh anime list from AniList API`)
        const response = await aniListService.getUserAnimeList(username, status)

        if (!response.MediaListCollection?.lists) {
            throw new Error(`No anime list found for user "${username}"`)
        }

        return response.MediaListCollection.lists
    }
}

// Main service functions
/**
 * Initialize the service
 */
export const initialize = async (): Promise<void> => {
    try {
        await indexedDBService.init()
        // console.log('✅ UserAnimeService initialized')
    } catch (error) {
        // console.error('❌ Failed to initialize UserAnimeService:', error)
        throw error
    }
}

/**
 * Load user data and anime list with caching strategy
 */
export const loadUserAndAnimeList = async (username: string): Promise<UserAnimeData> => {
    const cleanedUsername = cleanUsername(username)
    // console.log(`🔍 Loading user and anime list for: ${cleanedUsername}`)

    // Fetch user data
    const user = await dataOperations.fetchUser(cleanedUsername)
    const userId = user.id

    // Check cache first
    const isCached = await cacheOperations.isCached(userId)

    if (isCached) {
        // console.log(`💾 Using cached anime list for: ${cleanedUsername}`)
        const animeList = await cacheOperations.getCached(userId)

        if (animeList.length > 0) {
            return {
                user,
                animeList: logAnimeListLoaded(animeList, true),
                fromCache: true
            }
        }
    }

    // Fetch from API if not cached
    const lists = await dataOperations.fetchAnimeList(cleanedUsername)

    // Store in cache
    await cacheOperations.store(userId, cleanedUsername, lists)

    const animeList = indexedDBService.getAllAnimeFromLists(lists)
        .filter(anime =>
            anime.status === MediaListStatus.COMPLETED ||
            anime.status === MediaListStatus.CURRENT
        )

    return {
        user,
        animeList: logAnimeListLoaded(animeList, false),
        fromCache: false
    }
}

/**
 * Get a random anime from user's list
 */
export const getRandomAnime = async (
    userId: number,
    statuses: MediaListStatus[] = [MediaListStatus.COMPLETED, MediaListStatus.CURRENT]
): Promise<MediaListEntry | null> => {
    try {
        const randomAnime = await indexedDBService.getRandomAnimeFromUser(userId, statuses)

        if (randomAnime) {
            // console.log(`🎲 Random anime selected:`, {
            //     id: randomAnime.media.id,
            //     title: randomAnime.media.title.userPreferred || randomAnime.media.title.romaji,
            //     status: randomAnime.status,
            //     score: randomAnime.score
            // })
        }

        return randomAnime
    } catch (error) {
        // console.error('❌ Failed to get random anime:', error)
        return null
    }
}

/**
 * Calculate user's anime statistics
 */
export const calculateAnimeStats = (animeList: MediaListEntry[]): AnimeStats => {
    const stats = animeList.reduce((acc, anime) => {
        acc.total++

        switch (anime.status) {
            case 'COMPLETED':
                acc.completed++
                break
            case 'CURRENT':
                acc.current++
                break
            case 'PLANNING':
                acc.planned++
                break
            case 'DROPPED':
                acc.dropped++
                break
            case 'PAUSED':
                acc.paused++
                break
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

    // console.log(`📊 User anime stats:`, stats)
    return stats
}

/**
 * Get user's anime statistics
 */
export const getUserAnimeStats = async (userId: number): Promise<AnimeStats | null> => {
    try {
        const animeList = await cacheOperations.getCached(userId)
        return animeList.length > 0 ? calculateAnimeStats(animeList) : null
    } catch (error) {
        // console.error('❌ Failed to get user stats:', error)
        return null
    }
}

// Composed operations for common use cases
/**
 * Initialize service and load user data in one go
 */
export const initializeAndLoadUser = async (username: string): Promise<UserAnimeData> => {
    await initialize()
    return loadUserAndAnimeList(username)
}

/**
 * Load user and get random anime in one operation
 */
export const loadUserAndGetRandomAnime = async (
    username: string,
    statuses?: MediaListStatus[]
): Promise<{ userData: UserAnimeData; randomAnime: MediaListEntry | null }> => {
    const userData = await loadUserAndAnimeList(username)
    const randomAnime = await getRandomAnime(userData.user.id, statuses)

    return { userData, randomAnime }
}

// Export all operations grouped by concern
export const userAnimeService = {
    // Core operations
    initialize,
    loadUserAndAnimeList,
    getRandomAnime,
    getUserAnimeStats,
    calculateAnimeStats,

    // Composed operations
    initializeAndLoadUser,
    loadUserAndGetRandomAnime,

    // Cache operations
    cache: cacheOperations,

    // Data operations
    data: dataOperations,

    // Configuration
    config: CACHE_CONFIG
}

// Default export for backward compatibility
export default userAnimeService
