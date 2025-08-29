import { useMemo } from 'react'
import { usePlayerStore } from '@/lib/stores/player-store'

export const usePlaylistData = () => {
    const { queue, currentIndex, history, currentSong, isInitializing, isPreloading } = usePlayerStore()

    // Create combined playlist array (recent history + current + upcoming queue)
    const combinedPlaylist = useMemo(() => {
        const playlist = []

        // Only show the last 8 songs from history (most recent before current)
        const recentHistory = history.slice(-8)
        recentHistory.forEach((song, index) => {
            playlist.push({
                ...song,
                position: -(recentHistory.length - index), // negative positions for history
                isHistory: true,
                isCurrent: false,
                isUpcoming: false
            })
        })

        // Add current song
        if (currentSong) {
            playlist.push({
                ...currentSong,
                position: 0,
                isHistory: false,
                isCurrent: true,
                isUpcoming: false
            })
        }

        // Add upcoming songs (from current position forward)
        queue.slice(currentIndex + 1).forEach((song, index) => {
            playlist.push({
                ...song,
                position: index + 1,
                isHistory: false,
                isCurrent: false,
                isUpcoming: true
            })
        })

        return playlist
    }, [queue, currentIndex, history, currentSong])

    // Calculate total songs in queue (current + upcoming)
    const totalSongsInQueue = useMemo(() => {
        return queue.length
    }, [queue.length])

    return {
        combinedPlaylist,
        totalSongsInQueue,
        isInitializing,
        isPreloading
    }
}
