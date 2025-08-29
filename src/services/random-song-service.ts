import * as aniListService from './anilist-service'
import * as anisongService from './anisong-service'
import type { MediaListEntry, AnisongData } from '@/types/anilist'
import { MediaListStatus } from '@/types/anilist'
import type {
    RandomSongResponse,
    AnisongError
} from '@/types/anisong'

// Media base URL for constructing full audio URLs
const mediaBaseURL = 'https://naedist.animemusicquiz.com'

function createError(code: string, message: string): AnisongError {
    return {
        code,
        message,
        timestamp: new Date()
    }
}

function selectRandomAnime(entries: MediaListEntry[]): MediaListEntry {
    const randomIndex = Math.floor(Math.random() * entries.length)
    return entries[randomIndex]
}

function combineAnimeAndSongData(
    animeEntry: MediaListEntry,
    song: AnisongData
): RandomSongResponse {
    const audioURL = song.audio ? `${mediaBaseURL}/${song.audio}` : ''

    return {
        song: {
            songId: song.annSongId,
            songName: song.songName,
            songArtist: song.songArtist,
            songType: song.songType as 'Opening' | 'Ending' | 'Insert Song' | 'OST',
            animeENName: song.animeENName,
            animeJPName: song.animeJPName,
            animeId: song.linked_ids?.anilist,
            animeYear: parseInt(song.animeVintage.split(' ')[1]) || undefined,
            animeSeason: song.animeVintage.split(' ')[0] || undefined,
            HQ: song.HQ || undefined,
            MQ: song.MQ || undefined,
            audio: audioURL,
            composers: song.composers.map(composer => ({
                name: composer.names[0],
                id: composer.id
            })),
            artists: song.artists.map(artist => ({
                name: artist.names[0],
                id: artist.id
            })),
            duration: song.songLength
        },
        sourceAnime: {
            id: animeEntry.media.id,
            title: {
                romaji: animeEntry.media.title.romaji || '',
                english: animeEntry.media.title.english || undefined
            },
            score: animeEntry.score || 0,
            popularity: animeEntry.media.popularity || 0,
            season: animeEntry.media.season || undefined,
            seasonYear: animeEntry.media.seasonYear || undefined,
            coverImage: animeEntry.media.coverImage
        },
        metadata: {
            selectionMethod: 'random',
            totalCandidates: 1,
            requestTimestamp: new Date()
        }
    }
}

export async function getRandomSong(
    username: string,
    options: {
        songTypes?: Array<'opening' | 'ending' | 'insert'>
        minScore?: number
        excludeAnimeIds?: number[]
        animeList?: MediaListEntry[] // OPTIMIZATION: Pass anime list to avoid API calls
    } = {}
): Promise<RandomSongResponse> {
    // console.log(`\n🚀 === RANDOM SONG SEARCH ===`)

    let allEntries: MediaListEntry[]

    // OPTIMIZATION: Use provided anime list if available
    if (options.animeList && options.animeList.length > 0) {
        allEntries = options.animeList
        // console.log(`📚 Using provided anime list with ${allEntries.length} entries (no API call needed)`)
    } else {
        // Fallback to API call if no list provided
        if (aniListService.isCurrentlyRateLimited()) {
            throw createError(
                'RATE_LIMITED',
                'AniList API is currently rate limited. Please wait a few minutes before trying again.'
            )
        }

        const userAnimeListResponse = await aniListService.getUserAnimeList(username)

        if (!userAnimeListResponse.MediaListCollection?.lists) {
            throw createError(
                'NO_ANIME_ENTRIES',
                `No anime entries found for user: ${username}`
            )
        }

        allEntries = []
        userAnimeListResponse.MediaListCollection.lists.forEach((list) => {
            if (list.entries) {
                // Filter only COMPLETED and CURRENT (watching) animes, exclude PLANNING
                const filteredEntries = list.entries.filter(entry =>
                    entry.status === MediaListStatus.COMPLETED || entry.status === MediaListStatus.CURRENT
                )
                allEntries.push(...filteredEntries)
            }
        })

        // console.log(`📚 Loaded ${allEntries.length} anime entries from AniList API`)
    }

    if (allEntries.length === 0) {
        throw createError(
            'NO_ANIME_ENTRIES',
            'No anime entries available'
        )
    }

    // Filter entries based on options
    let filteredEntries = allEntries

    if (options.minScore) {
        filteredEntries = filteredEntries.filter(entry =>
            (entry.score || 0) >= options.minScore!
        )
    }

    if (options.excludeAnimeIds?.length) {
        filteredEntries = filteredEntries.filter(entry =>
            !options.excludeAnimeIds!.includes(entry.media.id)
        )
    }

    if (filteredEntries.length === 0) {
        throw createError(
            'NO_MATCHING_ANIME',
            'No anime entries match the specified criteria'
        )
    }

    // Select random anime - completely random, no preference for higher ratings
    const selectedEntry = selectRandomAnime(filteredEntries)
    // console.log(`🎬 Selected anime: ${selectedEntry.media.title.romaji} (Score: ${selectedEntry.score})`)

    // Get anime title in English (prefer English, fallback to romaji)
    const englishTitle = selectedEntry.media.title.english ||
        selectedEntry.media.title.romaji ||
        selectedEntry.media.title.userPreferred || ''

    const japaneseTitle = selectedEntry.media.title.romaji ||
        selectedEntry.media.title.native || ''

    if (!englishTitle && !japaneseTitle) {
        throw createError(
            'NO_TITLE_FOUND',
            `No title found for anime ID: ${selectedEntry.media.id}`
        )
    }

    // console.log(`🎵 Searching songs for: ${englishTitle}`)

    // Search songs for this anime (try English first)
    let songs = await anisongService.searchAnimeByName(englishTitle)

    // If no songs found with English title, try Japanese/Romaji title
    if ((!songs || songs.length === 0) && japaneseTitle && japaneseTitle !== englishTitle) {
        // console.log(`🎌 No songs found with English title, trying Japanese: ${japaneseTitle}`)
        songs = await anisongService.searchAnimeByName(japaneseTitle)
    }

    if (!songs || songs.length === 0) {
        throw createError(
            'NO_SONGS_FOUND',
            `No songs found for: ${englishTitle} (also tried: ${japaneseTitle})`
        )
    }

    // Filter songs by type if specified
    const songTypes = options.songTypes || ['opening', 'ending', 'insert']
    const filteredSongs = anisongService.filterSongsByType(songs, songTypes)

    if (filteredSongs.length === 0) {
        throw createError(
            'NO_MATCHING_SONG_TYPES',
            `No matching song types found for: ${englishTitle}`
        )
    }

    // Get random song
    const randomSong = anisongService.getRandomSong(filteredSongs)

    if (!randomSong) {
        throw createError(
            'FAILED_TO_SELECT_SONG',
            `Failed to select random song for: ${englishTitle}`
        )
    }

    // Combine data and return
    const combinedData = combineAnimeAndSongData(selectedEntry, randomSong)
    // console.log(`✅ Successfully found random song: "${randomSong.songName}" from ${usedTitle}`)

    return combinedData
}