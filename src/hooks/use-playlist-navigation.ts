import { useCallback } from 'react'
import { usePlayerStore } from '@/lib/stores/player-store'

export const usePlaylistNavigation = () => {
    const { queue, currentIndex, history, currentSong, setCurrentIndex } = usePlayerStore()

    // Handle navigation to a specific song in the playlist
    const navigateToSong = useCallback((item: any) => {
        if (item.isCurrent) {
            // Already playing this song, do nothing
            return
        }

        try {
            if (item.isHistory) {
                // Song is in history - insert it after current song and navigate to it
                const historyIndex = history.findIndex(historyItem => historyItem.id === item.id)
                if (historyIndex !== -1) {
                    const targetSong = history[historyIndex]

                    // Insert the target song right after current position in queue
                    const newQueue = [...queue]
                    newQueue.splice(currentIndex + 1, 0, targetSong)

                    usePlayerStore.getState().setQueue(newQueue)

                    // Add current song to history
                    if (currentSong) {
                        usePlayerStore.getState().addToHistory(currentSong)
                    }

                    // Navigate to the inserted song (now at currentIndex + 1)
                    setCurrentIndex(currentIndex + 1)

                    // console.log(`🎵 Navigated to history song: "${targetSong.song.songName}"`)
                }
            } else if (item.isUpcoming) {
                // Song is in the future queue
                const targetIndex = currentIndex + item.position

                if (targetIndex < queue.length && targetIndex > currentIndex) {
                    // Move current song and all songs in between to history
                    if (currentSong) {
                        usePlayerStore.getState().addToHistory(currentSong)
                    }

                    // Add all songs between current and target to history
                    for (let i = currentIndex + 1; i < targetIndex; i++) {
                        if (queue[i]) {
                            usePlayerStore.getState().addToHistory(queue[i])
                        }
                    }

                    // Navigate directly to the target song
                    setCurrentIndex(targetIndex)
                    // console.log(`🎵 Navigated to upcoming song: "${item.song.songName}" (index ${targetIndex})`)

                    // Trigger preload check - we'll use a setTimeout to let the state update first
                    setTimeout(() => {
                        const store = usePlayerStore.getState()
                        const remainingSongs = store.queue.length - targetIndex
                        if (remainingSongs <= 2 && store.currentUsername) {
                            // console.log('🔄 Triggering preload after navigation - remaining songs:', remainingSongs)
                            // The preload will be handled by the existing logic in usePlayerQueue
                        }
                    }, 100)
                }
            }
        } catch (error) {
            // console.error('❌ Error navigating to song:', error)
        }
    }, [queue, currentIndex, history, currentSong, setCurrentIndex])

    return {
        navigateToSong
    }
}
