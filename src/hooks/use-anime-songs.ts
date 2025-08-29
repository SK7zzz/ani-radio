import type { MediaListEntry } from '@/types/anilist'

interface UseAnimeSongsOptions {
    animeList?: MediaListEntry[]
    enabled?: boolean
}

// DEPRECATED: This hook searches by anime title, which goes against the new artist-only search flow
// Use the RandomSongService with staff information instead for artist-based searches
export const useAnimeSongs = (_: UseAnimeSongsOptions) => {
    // console.warn('⚠️ useAnimeSongs is deprecated. Use RandomSongService with staff info instead.')

    // Return empty/disabled state since we're not using title-based searches anymore
    return {
        songs: [],
        isLoading: false,
        isError: false,
        foundSongs: 0,
        totalRequests: 0,
        successRate: 0,
        errors: [],
        results: []
    }
} 