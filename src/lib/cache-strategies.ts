import type { MediaListEntry, MediaListGroup } from '@/types/anilist'

// Enhanced cache configuration
export const CACHE_STRATEGIES = {
    // Time-based strategies
    TIME: {
        AGGRESSIVE: 4, // 4 hours
        NORMAL: 24,    // 24 hours  
        CONSERVATIVE: 72, // 3 days
        PERMANENT: 168   // 1 week
    },

    // Size-based strategies
    SIZE: {
        MAX_ENTRIES_PER_USER: 10000,
        MAX_TOTAL_USERS: 100,
        CLEANUP_THRESHOLD: 0.8 // Clean when 80% full
    },

    // Quality-based strategies
    QUALITY: {
        // Different cache times based on list size
        SMALL_LIST: 4,   // < 50 anime, cache for 4 hours
        MEDIUM_LIST: 12, // 50-500 anime, cache for 12 hours  
        LARGE_LIST: 24,  // 500+ anime, cache for 24 hours
    }
} as const

export interface CacheMetadata {
    userId: number
    username: string
    timestamp: number
    expiresAt: number
    accessCount: number
    lastAccessed: number
    listSize: number
    version: number
}

export interface EnhancedStoredUserList {
    userId: number
    username: string
    lists: MediaListGroup[]
    metadata: CacheMetadata
}

// Cache strategy functions
export const cacheStrategies = {
    /**
     * Determine cache duration based on list size
     */
    getDurationByListSize: (animeCount: number): number => {
        if (animeCount < 50) return CACHE_STRATEGIES.QUALITY.SMALL_LIST
        if (animeCount < 500) return CACHE_STRATEGIES.QUALITY.MEDIUM_LIST
        return CACHE_STRATEGIES.QUALITY.LARGE_LIST
    },

    /**
     * Determine if cache should be refreshed based on access patterns
     */
    shouldRefreshByUsage: (metadata: CacheMetadata): boolean => {
        const hoursSinceCreated = (Date.now() - metadata.timestamp) / (1000 * 60 * 60)
        const hoursSinceAccessed = (Date.now() - metadata.lastAccessed) / (1000 * 60 * 60)

        // Refresh if frequently accessed but old
        return metadata.accessCount > 5 && hoursSinceCreated > 12 && hoursSinceAccessed < 1
    },

    /**
     * Calculate cache priority for cleanup
     */
    calculatePriority: (metadata: CacheMetadata): number => {
        const age = Date.now() - metadata.timestamp
        const lastAccess = Date.now() - metadata.lastAccessed
        const accessFrequency = metadata.accessCount / Math.max(1, age / (1000 * 60 * 60))

        // Higher score = higher priority to keep
        return accessFrequency * 1000 - lastAccess / (1000 * 60 * 60)
    }
}

// Enhanced cache operations with better strategies
export class EnhancedCacheService {
    private dbName = 'ani-radio-enhanced-cache'
    private version = 2
    private storeName = 'userLists'
    private metadataStore = 'metadata'
    private db: IDBDatabase | null = null

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version)

            request.onerror = () => reject(request.error)

            request.onsuccess = () => {
                this.db = request.result
                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                // Main data store
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'userId' })
                    store.createIndex('username', 'username', { unique: false })
                    store.createIndex('expiresAt', 'metadata.expiresAt', { unique: false })
                    store.createIndex('lastAccessed', 'metadata.lastAccessed', { unique: false })
                    store.createIndex('accessCount', 'metadata.accessCount', { unique: false })
                }

                // Metadata store for analytics
                if (!db.objectStoreNames.contains(this.metadataStore)) {
                    const metaStore = db.createObjectStore(this.metadataStore, { keyPath: 'userId' })
                    metaStore.createIndex('timestamp', 'timestamp', { unique: false })
                }
            }
        })
    }

    /**
     * Store with intelligent caching strategy
     */
    async storeWithStrategy(
        userId: number,
        username: string,
        lists: MediaListGroup[],
        strategy: 'aggressive' | 'normal' | 'conservative' | 'smart' = 'smart'
    ): Promise<void> {
        if (!this.db) await this.init()

        const animeCount = lists.reduce((total, list) => total + (list.entries?.length || 0), 0)
        const now = Date.now()

        let cacheDurationHours: number

        switch (strategy) {
            case 'aggressive':
                cacheDurationHours = CACHE_STRATEGIES.TIME.AGGRESSIVE
                break
            case 'conservative':
                cacheDurationHours = CACHE_STRATEGIES.TIME.CONSERVATIVE
                break
            case 'smart':
                cacheDurationHours = cacheStrategies.getDurationByListSize(animeCount)
                break
            default:
                cacheDurationHours = CACHE_STRATEGIES.TIME.NORMAL
        }

        const metadata: CacheMetadata = {
            userId,
            username,
            timestamp: now,
            expiresAt: now + (cacheDurationHours * 60 * 60 * 1000),
            accessCount: 1,
            lastAccessed: now,
            listSize: animeCount,
            version: this.version
        }

        const data: EnhancedStoredUserList = {
            userId,
            username,
            lists,
            metadata
        }

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'))

            const transaction = this.db.transaction([this.storeName], 'readwrite')
            const store = transaction.objectStore(this.storeName)
            const request = store.put(data)

            request.onsuccess = () => {
                // console.log(`✅ Stored with ${strategy} strategy: ${username} (${animeCount} anime, expires in ${cacheDurationHours}h)`)
                resolve()
            }
            request.onerror = () => reject(request.error)
        })
    }

    /**
     * Retrieve with access tracking
     */
    async getWithTracking(userId: number): Promise<{ data: MediaListEntry[]; fromCache: boolean; shouldRefresh: boolean }> {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'))

            const transaction = this.db.transaction([this.storeName], 'readwrite')
            const store = transaction.objectStore(this.storeName)
            const request = store.get(userId)

            request.onsuccess = () => {
                const result = request.result as EnhancedStoredUserList | undefined

                if (!result) {
                    return resolve({ data: [], fromCache: false, shouldRefresh: true })
                }

                const now = Date.now()
                const isExpired = now > result.metadata.expiresAt

                if (isExpired) {
                    return resolve({ data: [], fromCache: false, shouldRefresh: true })
                }

                // Update access tracking
                result.metadata.accessCount++
                result.metadata.lastAccessed = now

                // Update the record with new metadata
                store.put(result)

                const allAnime = result.lists.flatMap(list => list.entries || [])
                const shouldRefresh = cacheStrategies.shouldRefreshByUsage(result.metadata)

                resolve({
                    data: allAnime,
                    fromCache: true,
                    shouldRefresh
                })
            }

            request.onerror = () => reject(request.error)
        })
    }

    /**
     * Intelligent cleanup based on priority
     */
    async intelligentCleanup(): Promise<void> {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'))

            const transaction = this.db.transaction([this.storeName], 'readwrite')
            const store = transaction.objectStore(this.storeName)
            const request = store.getAll()

            request.onsuccess = () => {
                const allData = request.result as EnhancedStoredUserList[]

                // Calculate priorities and sort
                const prioritizedData = allData
                    .map(item => ({
                        ...item,
                        priority: cacheStrategies.calculatePriority(item.metadata)
                    }))
                    .sort((a, b) => a.priority - b.priority) // Lower priority first (for deletion)

                // Remove bottom 20% if we're over the size threshold
                const maxUsers = CACHE_STRATEGIES.SIZE.MAX_TOTAL_USERS
                if (allData.length > maxUsers * CACHE_STRATEGIES.SIZE.CLEANUP_THRESHOLD) {
                    const toRemove = Math.floor(allData.length * 0.2)
                    const itemsToDelete = prioritizedData.slice(0, toRemove)

                    const deletePromises = itemsToDelete.map(item => {
                        return new Promise<void>((resolveDelete) => {
                            const deleteRequest = store.delete(item.userId)
                            deleteRequest.onsuccess = () => resolveDelete()
                        })
                    })

                    Promise.all(deletePromises).then(() => {
                        // console.log(`🧹 Cleaned up ${toRemove} low-priority cache entries`)
                        resolve()
                    })
                } else {
                    resolve()
                }
            }

            request.onerror = () => reject(request.error)
        })
    }

    /**
     * Get cache analytics
     */
    async getCacheAnalytics(): Promise<{
        totalUsers: number
        totalSize: number
        avgAccessCount: number
        oldestEntry: number
        newestEntry: number
        expiringShortly: number
    }> {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'))

            const transaction = this.db.transaction([this.storeName], 'readonly')
            const store = transaction.objectStore(this.storeName)
            const request = store.getAll()

            request.onsuccess = () => {
                const allData = request.result as EnhancedStoredUserList[]
                const now = Date.now()
                const oneHour = 60 * 60 * 1000

                if (allData.length === 0) {
                    return resolve({
                        totalUsers: 0,
                        totalSize: 0,
                        avgAccessCount: 0,
                        oldestEntry: 0,
                        newestEntry: 0,
                        expiringShortly: 0
                    })
                }

                const analytics = {
                    totalUsers: allData.length,
                    totalSize: allData.reduce((sum, item) => sum + item.metadata.listSize, 0),
                    avgAccessCount: allData.reduce((sum, item) => sum + item.metadata.accessCount, 0) / allData.length,
                    oldestEntry: Math.min(...allData.map(item => item.metadata.timestamp)),
                    newestEntry: Math.max(...allData.map(item => item.metadata.timestamp)),
                    expiringShortly: allData.filter(item => item.metadata.expiresAt - now < oneHour).length
                }

                resolve(analytics)
            }

            request.onerror = () => reject(request.error)
        })
    }
}

// Export singleton instance
export const enhancedCacheService = new EnhancedCacheService()

// Factory function for different cache strategies
export const createCacheStrategy = (type: 'performance' | 'storage' | 'bandwidth') => {
    switch (type) {
        case 'performance':
            return {
                defaultDuration: CACHE_STRATEGIES.TIME.AGGRESSIVE,
                enablePrefetch: true,
                enableBackgroundRefresh: true
            }
        case 'storage':
            return {
                defaultDuration: CACHE_STRATEGIES.TIME.CONSERVATIVE,
                enablePrefetch: false,
                maxSize: CACHE_STRATEGIES.SIZE.MAX_TOTAL_USERS * 0.5
            }
        case 'bandwidth':
            return {
                defaultDuration: CACHE_STRATEGIES.TIME.PERMANENT,
                enablePrefetch: false,
                enableBackgroundRefresh: false
            }
    }
}
