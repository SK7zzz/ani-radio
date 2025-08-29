import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { AnisongSearchPayload, AnisongSearchResponse, AnisongData } from '@/types/anilist'

const baseURL = 'https://anisongdb.com/api'

const client: AxiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    },
    timeout: 30000
})

client.interceptors.request.use(
    (config) => {
        // console.log(`🎵 AnisongDB API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
    },
    (error) => {
        // console.error('❌ AnisongDB API Request Error:', error)
        return Promise.reject(error)
    }
)

client.interceptors.response.use(
    (response) => {
        // console.log(`✅ AnisongDB API Response: ${response.status} - ${response.data?.length || 0} songs found`)
        return response
    },
    (error) => {
        // console.error('❌ AnisongDB API Response Error:', error)
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. AnisongDB server is taking too long to respond.')
        }
        if (error.response?.status === 503) {
            throw new Error('AnisongDB service is temporarily unavailable. Please try again later.')
        }
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please wait before making more requests.')
        }
        throw error
    }
)

function createAnimeSearchPayload(animeName: string, partialMatch = true): AnisongSearchPayload {
    return {
        anime_search_filter: {
            search: animeName,
            partial_match: partialMatch
        },
        song_name_search_filter: {
            search: '',
            partial_match: false
        },
        artist_search_filter: {
            search: '',
            partial_match: false,
            group_granularity: 0,
            max_other_artist: 99
        },
        composer_search_filter: {
            search: '',
            partial_match: false,
            arrangement: true
        },
        and_logic: false,
        ignore_duplicate: false,
        opening_filter: true,
        ending_filter: true,
        insert_filter: true,
        normal_broadcast: true,
        dub: true,
        rebroadcast: true,
        standard: true,
        instrumental: true,
        chanting: true,
        character: true
    }
}

export async function searchAnimeByName(animeName: string): Promise<AnisongData[]> {
    // console.log(`🔍 Searching songs for anime: "${animeName}"`)

    if (!animeName || animeName.trim() === '') {
        // console.warn(`⚠️ Empty anime name provided`)
        return []
    }

    try {
        const payload = createAnimeSearchPayload(animeName.trim())
        const response: AxiosResponse<AnisongSearchResponse> = await client.post('/search_request', payload)

        if (!response.data || !Array.isArray(response.data)) {
            // console.log(`📭 No songs found for anime: "${animeName}"`)
            return []
        }

        const songs = response.data
        // console.log(`🎶 Found ${songs.length} songs for "${animeName}"`)

        return songs
    } catch (error) {
        // console.error(`❌ Failed to search songs for anime "${animeName}":`, error)
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
                throw new Error('AnisongDB API rate limit exceeded. Please try again later.')
            }
            throw new Error(`AnisongDB API Error: ${error.response?.status} - ${error.message}`)
        }
        throw error
    }
}

export function filterSongsByType(
    songs: AnisongData[],
    types: Array<'opening' | 'ending' | 'insert'> = ['opening', 'ending', 'insert']
): AnisongData[] {
    return songs.filter((song) => {
        const songType = song.songType.toLowerCase()
        return types.some((type) => songType.includes(type))
    })
}

export function getRandomSong(songs: AnisongData[]): AnisongData | null {
    if (!songs || songs.length === 0) {
        return null
    }

    const randomIndex = Math.floor(Math.random() * songs.length)
    const randomSong = songs[randomIndex]

    // console.log(`🎲 Random song selected: "${randomSong.songName}" by ${randomSong.songArtist} (${randomSong.songType})`)

    return randomSong
} 