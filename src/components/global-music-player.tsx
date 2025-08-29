import { memo, useEffect, useRef } from 'react'
import { MusicPlayer } from '@/components/music-player'
import { MusicPlayerSkeleton } from '@/components/music-player-skeleton'
import { usePlayerStore } from '@/lib/stores/player-store'
import { usePlayerQueue } from '@/hooks/use-player-queue'
import * as aniListService from '@/services/anilist-service'

export const GlobalMusicPlayer = memo(() => {
    const initializationAttempted = useRef<Set<string>>(new Set())
    const autoPlayAttempted = useRef<Set<string>>(new Set())

    // Get state from Zustand store
    const {
        currentSong,
        isInitialized,
        isInitializing,
        autoPlayEnabled,
        currentUsername,
        hasError,
        errorMessage,
        setError,
        isPlaying,
        setPlaying,
    } = usePlayerStore()

    // Get queue navigation functions
    const {
        queue,
        goToNext,
        goToPrevious,
        canGoNext,
        canGoPrevious,
        initializeQueue,
    } = usePlayerQueue()

    // Auto-initialize queue when username is set
    useEffect(() => {
        const shouldInitialize = currentUsername &&
            currentUsername.trim() !== '' &&
            !isInitialized &&
            !isInitializing &&
            !hasError &&
            queue.length === 0 && // Only initialize if queue is empty
            !initializationAttempted.current.has(currentUsername)

        if (shouldInitialize) {
            console.log(`🎵 Auto-initializing music queue for user: ${currentUsername}`)
            initializationAttempted.current.add(currentUsername)
            initializeQueue(currentUsername)
        }
    }, [currentUsername, isInitialized, isInitializing, hasError, queue.length])

    // Auto-play the first song when queue is initialized from cache
    useEffect(() => {
        const shouldAutoPlay = currentSong &&
            autoPlayEnabled &&
            isInitialized &&
            !isInitializing &&
            !isPlaying &&
            !hasError &&
            currentUsername &&
            !autoPlayAttempted.current.has(currentUsername)

        if (shouldAutoPlay) {
            console.log(`🎵 Auto-starting playback for cached user: ${currentUsername}`)
            autoPlayAttempted.current.add(currentUsername)
            // Add a delay to ensure the MusicPlayer component and audio element are ready
            setTimeout(() => {
                setPlaying(true)
            }, 1000) // Increased delay to ensure everything is loaded
        }
    }, [currentSong, autoPlayEnabled, isInitialized, isInitializing, isPlaying, hasError, currentUsername, setPlaying])

    // Reset auto-play attempt when username changes
    useEffect(() => {
        if (currentUsername) {
            // Clean up auto-play attempt for previous users, but keep current one
            const currentUser = currentUsername
            autoPlayAttempted.current.forEach(user => {
                if (user !== currentUser) {
                    autoPlayAttempted.current.delete(user)
                }
            })
        }
    }, [currentUsername])

    // Function to handle rate limit reset
    const handleRetryAfterRateLimit = () => {
        aniListService.resetRateLimit()
        setError(false)
        if (currentUsername) {
            // Clear the initialization attempt for this user to allow retry
            initializationAttempted.current.delete(currentUsername)
            autoPlayAttempted.current.delete(currentUsername)
            initializeQueue(currentUsername)
        }
    }

    // Global keyboard event handler for spacebar
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle spacebar when player is initialized and not in an input field
            if (
                event.code === 'Space' &&
                isInitialized &&
                currentSong &&
                event.target instanceof Element &&
                !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) &&
                !(event.target as HTMLElement).isContentEditable
            ) {
                event.preventDefault()
                setPlaying(!isPlaying)
            }
        }

        // Add event listener to document
        document.addEventListener('keydown', handleKeyDown)

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isInitialized, currentSong, isPlaying, setPlaying])

    // Check if we should show loading state
    const showLoadingState = isInitializing || (!isInitialized && !!currentSong)

    // Show rate limit error UI
    if (hasError && errorMessage?.includes('rate limit')) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-500 text-white p-4 shadow-lg">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold">Rate Limit Exceeded</h3>
                            <p className="text-sm opacity-90">
                                API rate limit reached. Please wait 2-3 minutes before trying again.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRetryAfterRateLimit}
                        className="px-4 py-2 bg-white text-red-500 rounded-md font-medium hover:bg-gray-100 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // Show general error UI
    if (hasError && errorMessage) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-500 text-white p-4 shadow-lg">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold">Error Loading Music</h3>
                            <p className="text-sm opacity-90">{errorMessage}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setError(false)}
                        className="px-4 py-2 bg-white text-yellow-600 rounded-md font-medium hover:bg-gray-100 transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        )
    }

    // Don't render anything if there's no song and we're not initializing
    if (!currentSong && !isInitializing) {
        return null
    }

    return (
        <>
            {/* Fixed Bottom Music Player or Skeleton */}
            {showLoadingState ? (
                <MusicPlayerSkeleton />
            ) : (
                <MusicPlayer
                    song={currentSong ? {
                        title: currentSong.song.songName,
                        artist: currentSong.song.songArtist,
                        anime: {
                            english: currentSong.sourceAnime?.title?.english || currentSong.song.animeENName || undefined,
                            japanese: currentSong.sourceAnime?.title?.romaji || currentSong.song.animeJPName || undefined,
                            coverImage: currentSong.sourceAnime?.coverImage?.extraLarge ||
                                currentSong.sourceAnime?.coverImage?.large ||
                                currentSong.sourceAnime?.coverImage?.medium || undefined,
                            season: currentSong.song.animeSeason || undefined,
                            seasonYear: currentSong.song.animeYear || undefined
                        },
                        hasValidAudio: Boolean(currentSong.song.audio || currentSong.song.MQ || currentSong.song.HQ),
                        songType: currentSong.song.songType || null,
                        songTypeNumber: null // This property doesn't exist in AnisongDBSong
                    } : undefined}
                    audioUrl={currentSong?.song.audio || undefined}
                    fallbackUrls={currentSong ? [
                        currentSong.song.MQ,
                        currentSong.song.HQ
                    ].filter((url): url is string => Boolean(url)) : []}
                    isVisible={!!currentSong}
                    onNext={goToNext}
                    onPrevious={goToPrevious}
                    canGoNext={canGoNext()}
                    canGoPrevious={canGoPrevious()}
                    isLoading={isInitializing}
                    autoPlay={autoPlayEnabled}
                    selectedUser={undefined} // We'll remove this dependency since it's now global
                />
            )}
        </>
    )
})