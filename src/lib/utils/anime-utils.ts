/**
 * Get AniList anime search URL
 * @param animeTitle - The anime title to search for
 * @returns The AniList search URL
 */
export const getAniListAnimeUrl = (animeTitle: string): string => {
    const searchQuery = encodeURIComponent(animeTitle)
    return `https://anilist.co/search/anime?search=${searchQuery}`
} 