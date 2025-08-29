import { useEffect, useState } from 'react'
import { usePlayerStore } from '@/lib/stores/player-store'
import indexedDBService from '@/lib/stores/indexeddb-service'
import { usePlayerQueue } from '@/hooks/use-player-queue'

interface UsePlayerInitializationOptions {
    username?: string
    autoInitialize?: boolean
}

export const usePlayerInitialization = ({
    username,
    autoInitialize = true
}: UsePlayerInitializationOptions = {}) => {
    const [isCheckingUser, setIsCheckingUser] = useState(false)
    const [userExistsInCache, setUserExistsInCache] = useState<boolean | null>(null)

    const {
        isInitialized,
        currentUsername,
        setCurrentUser,
        setInitializing,
        setError
    } = usePlayerStore()

    const { initializeQueue } = usePlayerQueue()

    // Check if user exists in IndexedDB when username changes
    useEffect(() => {
        if (!username?.trim()) {
            setUserExistsInCache(null)
            return
        }

        const checkUserInCache = async () => {
            setIsCheckingUser(true)
            try {
                // Debug: Get all stored users first
                await indexedDBService.getAllStoredUsers()

                const exists = await indexedDBService.userExistsByUsername(username.trim())
                setUserExistsInCache(exists)

                if (exists) {
                    //      console.log(`✅ User ${username} found in IndexedDB cache - auto-play should activate`)
                } else {
                    //      console.log(`ℹ️ User ${username} not found in IndexedDB cache`)
                }
            } catch (error) {
                // console.error('❌ Error checking user in cache:', error)
                setUserExistsInCache(false)
            } finally {
                setIsCheckingUser(false)
            }
        }

        checkUserInCache()
    }, [username])

    // Function to manually initialize player
    const manuallyInitializePlayer = async (targetUsername: string) => {
        if (!targetUsername?.trim()) {
            throw new Error('Username is required')
        }

        setInitializing(true)
        setError(false)

        try {
            //     console.log(`🎵 Manually initializing player for user: ${targetUsername}`)

            // Set the current user in the store
            setCurrentUser(targetUsername.trim())

            // Initialize the queue with songs from user's anime
            await initializeQueue(targetUsername.trim())

            //    console.log(`✅ Player manually initialized successfully for user: ${targetUsername}`)
        } catch (error) {
            // console.error('❌ Failed to manually initialize player:', error)
            setError(true, `Failed to initialize player for user ${targetUsername}`)
            throw error
        } finally {
            setInitializing(false)
        }
    }

    // Auto-initialize if user exists in cache and conditions are met
    useEffect(() => {
        if (!autoInitialize || !username || !userExistsInCache || isInitialized) {
            return
        }

        // Only initialize if the current username is different or not set
        if (currentUsername === username.trim()) {
            return
        }

        //      console.log(`🎵 Auto-initializing player for cached user: ${username}`)
        manuallyInitializePlayer(username.trim()).catch(_error => {
            // console.error('Auto-initialization failed:', error)
        })
    }, [
        username,
        userExistsInCache,
        isInitialized,
        currentUsername,
        autoInitialize
    ])

    return {
        isCheckingUser,
        userExistsInCache,
        isPlayerInitialized: isInitialized,
        currentPlayerUsername: currentUsername,
        manuallyInitializePlayer
    }
}
