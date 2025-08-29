import type { MediaListEntry, MediaListGroup } from '@/types/anilist'

interface StoredUserList {
    userId: number
    username: string
    lists: MediaListGroup[]
    timestamp: number
    version: number
}

class IndexedDBService {
    private dbName = 'ani-radio-cache'
    private version = 1
    private storeName = 'userLists'
    private db: IDBDatabase | null = null

    /**
     * Initialize IndexedDB connection
     */
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version)

            request.onerror = () => {
                console.error('❌ IndexedDB failed to open:', request.error)
                reject(request.error)
            }

            request.onsuccess = () => {
                this.db = request.result
                console.log('✅ IndexedDB opened successfully')
                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'userId' })
                    store.createIndex('username', 'username', { unique: false })
                    store.createIndex('timestamp', 'timestamp', { unique: false })
                    console.log('✅ IndexedDB store created')
                }
            }
        })
    }

    /**
     * Store user's complete anime list
     */
    async storeUserList(userId: number, username: string, lists: MediaListGroup[]): Promise<void> {
        if (!this.db) {
            await this.init()
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite')
            const store = transaction.objectStore(this.storeName)

            const data: StoredUserList = {
                userId,
                username: username.toLowerCase(), // Store username in lowercase for case-insensitive searches
                lists,
                timestamp: Date.now(),
                version: this.version
            }

            const request = store.put(data)

            request.onsuccess = () => {
                console.log(`✅ Stored anime list for user: ${username} (${lists.length} lists, ${this.getTotalAnimeCount(lists)} total anime)`)
                resolve()
            }

            request.onerror = () => {
                console.error('❌ Failed to store user list:', request.error)
                reject(request.error)
            }
        })
    }

    /**
     * Retrieve user's anime list from local storage
     */
    async getUserList(userId: number): Promise<StoredUserList | null> {
        if (!this.db) {
            await this.init()
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readonly')
            const store = transaction.objectStore(this.storeName)
            const request = store.get(userId)

            request.onsuccess = () => {
                const result = request.result as StoredUserList | undefined
                if (result) {
                    console.log(`✅ Retrieved cached anime list for user: ${result.username} (${result.lists.length} lists)`)
                }
                resolve(result || null)
            }

            request.onerror = () => {
                console.error('❌ Failed to retrieve user list:', request.error)
                reject(request.error)
            }
        })
    }

    /**
     * Check if user's list is cached and still valid (less than 24 hours old)
     */
    async isUserListCached(userId: number, maxAgeHours: number = 24): Promise<boolean> {
        try {
            const storedList = await this.getUserList(userId)
            if (!storedList) return false

            const ageInHours = (Date.now() - storedList.timestamp) / (1000 * 60 * 60)
            return ageInHours < maxAgeHours
        } catch {
            return false
        }
    }

    /**
     * Get all anime entries from user's lists, flattened
     */
    getAllAnimeFromLists(lists: MediaListGroup[]): MediaListEntry[] {
        return lists.flatMap(list => list.entries || [])
    }

    /**
     * Get user by username from IndexedDB
     */
    async getUserByUsername(username: string): Promise<StoredUserList | null> {
        if (!this.db) {
            await this.init()
        }

        console.log(`🔍 Searching for user in IndexedDB: "${username}"`)

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readonly')
            const store = transaction.objectStore(this.storeName)

            // Get the username index specifically
            const usernameIndex = store.index('username')
            console.log(`📋 Using username index to search for: "${username}"`)

            // Try exact match first
            const request = usernameIndex.get(username)

            request.onsuccess = () => {
                const result = request.result as StoredUserList | undefined
                if (result) {
                    console.log(`✅ Found cached user (exact match): ${result.username} (ID: ${result.userId})`)
                    resolve(result)
                } else {
                    // If not found with exact case, try lowercase
                    const searchUsername = username.toLowerCase()
                    console.log(`🔍 Exact match failed, trying lowercase: "${searchUsername}"`)
                    const requestLower = usernameIndex.get(searchUsername)

                    requestLower.onsuccess = () => {
                        const resultLower = requestLower.result as StoredUserList | undefined
                        if (resultLower) {
                            console.log(`✅ Found cached user (lowercase): ${resultLower.username} (ID: ${resultLower.userId})`)
                            resolve(resultLower)
                        } else {
                            console.log(`❌ User "${username}" not found in IndexedDB cache (tried exact and lowercase)`)
                            resolve(null)
                        }
                    }

                    requestLower.onerror = () => {
                        console.error('❌ Failed to retrieve user by lowercase username:', requestLower.error)
                        reject(requestLower.error)
                    }
                }
            }

            request.onerror = () => {
                console.error('❌ Failed to retrieve user by username:', request.error)
                reject(request.error)
            }
        })
    }

    /**
     * Check if user exists in IndexedDB by username
     */
    async userExistsByUsername(username: string): Promise<boolean> {
        try {
            const storedUser = await this.getUserByUsername(username)
            return storedUser !== null
        } catch {
            return false
        }
    }

    /**
     * Get all stored users (for debugging)
     */
    async getAllStoredUsers(): Promise<StoredUserList[]> {
        if (!this.db) {
            await this.init()
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readonly')
            const store = transaction.objectStore(this.storeName)
            const request = store.getAll()

            request.onsuccess = () => {
                const result = request.result as StoredUserList[]
                console.log(`📚 All stored users in IndexedDB:`, result.map(u => ({ username: u.username, userId: u.userId })))
                resolve(result)
            }

            request.onerror = () => {
                console.error('❌ Failed to retrieve all users:', request.error)
                reject(request.error)
            }
        })
    }

    /**
     * Get random anime from user's cached lists
     */
    async getRandomAnimeFromUser(userId: number, statuses?: string[]): Promise<MediaListEntry | null> {
        try {
            const storedList = await this.getUserList(userId)
            if (!storedList) return null

            let allAnime = this.getAllAnimeFromLists(storedList.lists)

            // Filter by status if provided
            if (statuses && statuses.length > 0) {
                allAnime = allAnime.filter(entry =>
                    statuses.includes(entry.status)
                )
            }

            if (allAnime.length === 0) return null

            // Get random anime
            const randomIndex = Math.floor(Math.random() * allAnime.length)
            return allAnime[randomIndex]
        } catch (error) {
            console.error('❌ Failed to get random anime:', error)
            return null
        }
    }

    /**
     * Clear all cached data
     */
    async clearCache(): Promise<void> {
        if (!this.db) {
            await this.init()
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite')
            const store = transaction.objectStore(this.storeName)
            const request = store.clear()

            request.onsuccess = () => {
                console.log('✅ Cache cleared')
                resolve()
            }

            request.onerror = () => {
                console.error('❌ Failed to clear cache:', request.error)
                reject(request.error)
            }
        })
    }

    /**
     * Get statistics about stored data
     */
    private getTotalAnimeCount(lists: MediaListGroup[]): number {
        return lists.reduce((total, list) => total + (list.entries?.length || 0), 0)
    }

    /**
     * Remove old cached data (older than specified days)
     */
    async cleanOldCache(maxAgeDays: number = 7): Promise<void> {
        if (!this.db) {
            await this.init()
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite')
            const store = transaction.objectStore(this.storeName)
            const index = store.index('timestamp')

            const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000)
            const range = IDBKeyRange.upperBound(cutoffTime)

            const request = index.openCursor(range)

            let deletedCount = 0

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result
                if (cursor) {
                    cursor.delete()
                    deletedCount++
                    cursor.continue()
                } else {
                    console.log(`✅ Cleaned ${deletedCount} old cache entries`)
                    resolve()
                }
            }

            request.onerror = () => {
                console.error('❌ Failed to clean old cache:', request.error)
                reject(request.error)
            }
        })
    }
}

// Create singleton instance
const indexedDBService = new IndexedDBService()

export default indexedDBService 