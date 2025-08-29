// AniList API Types
export interface MediaListEntry {
    id: number
    status: MediaListStatus
    score?: number
    progress?: number
    progressVolumes?: number
    repeat?: number
    priority?: number
    private?: boolean
    notes?: string
    hiddenFromStatusLists?: boolean
    customLists?: Record<string, boolean>
    advancedScores?: Record<string, number>
    startedAt?: FuzzyDate
    completedAt?: FuzzyDate
    updatedAt?: number
    createdAt?: number
    media: Media
}

export interface Media {
    id: number
    title: MediaTitle
    coverImage?: CoverImage
    bannerImage?: string
    startDate?: FuzzyDate
    endDate?: FuzzyDate
    description?: string
    season?: MediaSeason
    seasonYear?: number
    type?: MediaType
    format?: MediaFormat
    status?: MediaStatus
    episodes?: number
    duration?: number
    chapters?: number
    volumes?: number
    genres?: string[]
    synonyms?: string[]
    source?: MediaSource
    isAdult?: boolean
    meanScore?: number
    averageScore?: number
    popularity?: number
    favourites?: number
    hashtag?: string
    countryOfOrigin?: string
    isLicensed?: boolean
    siteUrl?: string
    updatedAt?: number
    trailer?: MediaTrailer
    tags?: MediaTag[]
    relations?: MediaConnection
    characters?: CharacterConnection
    studios?: StudioConnection
    isFavourite?: boolean
    isRecommendationBlocked?: boolean
    isReviewBlocked?: boolean
    nextAiringEpisode?: AiringSchedule
}

export interface MediaTitle {
    romaji?: string
    english?: string
    native?: string
    userPreferred?: string
}

export interface CoverImage {
    extraLarge?: string
    large?: string
    medium?: string
    color?: string
}

export interface MediaTrailer {
    id?: string
    site?: string
    thumbnail?: string
}

export interface MediaTag {
    id: number
    name: string
    description?: string
    category?: string
    rank?: number
    isGeneralSpoiler?: boolean
    isMediaSpoiler?: boolean
    isAdult?: boolean
}

export interface FuzzyDate {
    year?: number
    month?: number
    day?: number
}

export interface AiringSchedule {
    id: number
    airingAt: number
    timeUntilAiring: number
    episode: number
    mediaId: number
    media?: Media
}

// Connections
export interface MediaConnection {
    edges?: MediaEdge[]
    nodes?: Media[]
    pageInfo?: PageInfo
}

export interface MediaEdge {
    node?: Media
    id?: number
    relationType?: MediaRelation
    isMainStudio?: boolean
    characters?: Character[]
    characterRole?: CharacterRole
    characterName?: string
    roleNotes?: string
    dubGroup?: string
    staffRole?: string
    favouriteOrder?: number
}

export interface CharacterConnection {
    edges?: CharacterEdge[]
    nodes?: Character[]
    pageInfo?: PageInfo
}

export interface CharacterEdge {
    node?: Character
    id?: number
    role?: CharacterRole
    name?: string
    media?: Media[]
    favouriteOrder?: number
}

export interface Character {
    id: number
    name: CharacterName
    image?: CharacterImage
    description?: string
    gender?: string
    dateOfBirth?: FuzzyDate
    age?: string
    bloodType?: string
    isFavourite?: boolean
    isFavouriteBlocked?: boolean
    siteUrl?: string
    media?: MediaConnection
    updatedAt?: number
    favourites?: number
}

export interface CharacterName {
    first?: string
    middle?: string
    last?: string
    full?: string
    native?: string
    alternative?: string[]
    alternativeSpoiler?: string[]
    userPreferred?: string
}

export interface CharacterImage {
    large?: string
    medium?: string
}

export interface StudioConnection {
    edges?: StudioEdge[]
    nodes?: Studio[]
    pageInfo?: PageInfo
}

export interface StudioEdge {
    node?: Studio
    id?: number
    isMain?: boolean
    favouriteOrder?: number
}

export interface Studio {
    id: number
    name: string
    media?: MediaConnection
    siteUrl?: string
    isFavourite?: boolean
    favourites?: number
}

export interface PageInfo {
    total?: number
    perPage?: number
    currentPage?: number
    lastPage?: number
    hasNextPage?: boolean
}

// User Types
export interface User {
    id: number
    name: string
    about?: string
    avatar?: UserAvatar
    bannerImage?: string
    isFollowing?: boolean
    isFollower?: boolean
    isBlocked?: boolean
    bans?: string[]
    options?: UserOptions
    mediaListOptions?: MediaListOptions
    favourites?: Favourites
    statistics?: UserStatisticTypes
    unreadNotificationCount?: number
    siteUrl?: string
    donatorTier?: number
    donatorBadge?: string
    moderatorRoles?: ModRole[]
    createdAt?: number
    updatedAt?: number
}

export interface UserAvatar {
    large?: string
    medium?: string
}

export interface UserOptions {
    titleLanguage?: UserTitleLanguage
    displayAdultContent?: boolean
    airingNotifications?: boolean
    profileColor?: string
    notificationOptions?: NotificationOption[]
    timezone?: string
    activityMergeTime?: number
    restrictMessagesToFollowing?: boolean
    disabledListActivity?: ListActivityOption[]
}

export interface MediaListOptions {
    scoreFormat?: ScoreFormat
    rowOrder?: string
    useLegacyLists?: boolean
    animeList?: MediaListTypeOptions
    mangaList?: MediaListTypeOptions
}

export interface MediaListTypeOptions {
    sectionOrder?: string[]
    splitCompletedSectionByFormat?: boolean
    theme?: string
    customLists?: string[]
    advancedScoring?: string[]
    advancedScoringEnabled?: boolean
}

export interface Favourites {
    anime?: MediaConnection
    manga?: MediaConnection
    characters?: CharacterConnection
    studios?: StudioConnection
}

export interface UserStatisticTypes {
    anime?: UserStatistics
    manga?: UserStatistics
}

export interface UserStatistics {
    count: number
    meanScore: number
    standardDeviation: number
    minutesWatched: number
    episodesWatched: number
    chaptersRead?: number
    volumesRead?: number
    formats?: UserFormatStatistic[]
    statuses?: UserStatusStatistic[]
    scores?: UserScoreStatistic[]
    lengths?: UserLengthStatistic[]
    releaseYears?: UserReleaseYearStatistic[]
    startYears?: UserStartYearStatistic[]
    genres?: UserGenreStatistic[]
    tags?: UserTagStatistic[]
    countries?: UserCountryStatistic[]
    studios?: UserStudioStatistic[]
}

export interface UserFormatStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    format?: MediaFormat
}

export interface UserStatusStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    status?: MediaListStatus
}

export interface UserScoreStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    score?: number
}

export interface UserLengthStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    length?: string
}

export interface UserReleaseYearStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    releaseYear?: number
}

export interface UserStartYearStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    startYear?: number
}

export interface UserGenreStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    genre?: string
}

export interface UserTagStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    tag?: MediaTag
}

export interface UserCountryStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    country?: string
}

export interface UserStudioStatistic {
    count: number
    meanScore: number
    minutesWatched: number
    chaptersRead?: number
    mediaIds: number[]
    studio?: Studio
}

export interface NotificationOption {
    type?: NotificationType
    enabled?: boolean
}

// Enums
export enum MediaType {
    ANIME = 'ANIME',
    MANGA = 'MANGA'
}

export enum MediaFormat {
    TV = 'TV',
    TV_SHORT = 'TV_SHORT',
    MOVIE = 'MOVIE',
    SPECIAL = 'SPECIAL',
    OVA = 'OVA',
    ONA = 'ONA',
    MUSIC = 'MUSIC',
    MANGA = 'MANGA',
    NOVEL = 'NOVEL',
    ONE_SHOT = 'ONE_SHOT'
}

export enum MediaStatus {
    FINISHED = 'FINISHED',
    RELEASING = 'RELEASING',
    NOT_YET_RELEASED = 'NOT_YET_RELEASED',
    CANCELLED = 'CANCELLED',
    HIATUS = 'HIATUS'
}

export enum MediaListStatus {
    CURRENT = 'CURRENT',
    PLANNING = 'PLANNING',
    COMPLETED = 'COMPLETED',
    DROPPED = 'DROPPED',
    PAUSED = 'PAUSED',
    REPEATING = 'REPEATING'
}

export enum MediaSeason {
    WINTER = 'WINTER',
    SPRING = 'SPRING',
    SUMMER = 'SUMMER',
    FALL = 'FALL'
}

export enum MediaSource {
    ORIGINAL = 'ORIGINAL',
    MANGA = 'MANGA',
    LIGHT_NOVEL = 'LIGHT_NOVEL',
    VISUAL_NOVEL = 'VISUAL_NOVEL',
    VIDEO_GAME = 'VIDEO_GAME',
    OTHER = 'OTHER',
    NOVEL = 'NOVEL',
    DOUJINSHI = 'DOUJINSHI',
    ANIME = 'ANIME',
    WEB_NOVEL = 'WEB_NOVEL',
    LIVE_ACTION = 'LIVE_ACTION',
    GAME = 'GAME',
    COMIC = 'COMIC',
    MULTIMEDIA_PROJECT = 'MULTIMEDIA_PROJECT',
    PICTURE_BOOK = 'PICTURE_BOOK'
}

export enum MediaRelation {
    ADAPTATION = 'ADAPTATION',
    PREQUEL = 'PREQUEL',
    SEQUEL = 'SEQUEL',
    PARENT = 'PARENT',
    SIDE_STORY = 'SIDE_STORY',
    CHARACTER = 'CHARACTER',
    SUMMARY = 'SUMMARY',
    ALTERNATIVE = 'ALTERNATIVE',
    SPIN_OFF = 'SPIN_OFF',
    OTHER = 'OTHER',
    SOURCE = 'SOURCE',
    COMPILATION = 'COMPILATION',
    CONTAINS = 'CONTAINS'
}

export enum CharacterRole {
    MAIN = 'MAIN',
    SUPPORTING = 'SUPPORTING',
    BACKGROUND = 'BACKGROUND'
}

export enum UserTitleLanguage {
    ROMAJI = 'ROMAJI',
    ENGLISH = 'ENGLISH',
    NATIVE = 'NATIVE',
    ROMAJI_STYLISED = 'ROMAJI_STYLISED',
    ENGLISH_STYLISED = 'ENGLISH_STYLISED',
    NATIVE_STYLISED = 'NATIVE_STYLISED'
}

export enum ScoreFormat {
    POINT_100 = 'POINT_100',
    POINT_10_DECIMAL = 'POINT_10_DECIMAL',
    POINT_10 = 'POINT_10',
    POINT_5 = 'POINT_5',
    POINT_3 = 'POINT_3'
}

export enum ListActivityOption {
    ANIME_LIST = 'ANIME_LIST',
    MANGA_LIST = 'MANGA_LIST'
}

export enum NotificationType {
    ACTIVITY_MESSAGE = 'ACTIVITY_MESSAGE',
    ACTIVITY_REPLY = 'ACTIVITY_REPLY',
    FOLLOWING = 'FOLLOWING',
    ACTIVITY_MENTION = 'ACTIVITY_MENTION',
    THREAD_COMMENT_MENTION = 'THREAD_COMMENT_MENTION',
    THREAD_SUBSCRIBED = 'THREAD_SUBSCRIBED',
    THREAD_COMMENT_REPLY = 'THREAD_COMMENT_REPLY',
    AIRING = 'AIRING',
    ACTIVITY_LIKE = 'ACTIVITY_LIKE',
    ACTIVITY_REPLY_LIKE = 'ACTIVITY_REPLY_LIKE',
    THREAD_LIKE = 'THREAD_LIKE',
    THREAD_COMMENT_LIKE = 'THREAD_COMMENT_LIKE',
    ACTIVITY_REPLY_SUBSCRIBED = 'ACTIVITY_REPLY_SUBSCRIBED',
    RELATED_MEDIA_ADDITION = 'RELATED_MEDIA_ADDITION',
    MEDIA_DATA_CHANGE = 'MEDIA_DATA_CHANGE',
    MEDIA_MERGE = 'MEDIA_MERGE',
    MEDIA_DELETION = 'MEDIA_DELETION'
}

export enum ModRole {
    ADMIN = 'ADMIN',
    LEAD_DEVELOPER = 'LEAD_DEVELOPER',
    DEVELOPER = 'DEVELOPER',
    LEAD_COMMUNITY = 'LEAD_COMMUNITY',
    COMMUNITY = 'COMMUNITY',
    DISCORD_COMMUNITY = 'DISCORD_COMMUNITY',
    LEAD_ANIME_DATA = 'LEAD_ANIME_DATA',
    ANIME_DATA = 'ANIME_DATA',
    LEAD_MANGA_DATA = 'LEAD_MANGA_DATA',
    MANGA_DATA = 'MANGA_DATA',
    LEAD_SOCIAL_MEDIA = 'LEAD_SOCIAL_MEDIA',
    SOCIAL_MEDIA = 'SOCIAL_MEDIA',
    RETIRED = 'RETIRED',
    CHARACTER_DATA = 'CHARACTER_DATA',
    STAFF_DATA = 'STAFF_DATA'
}

// API Response Types
export interface AniListResponse<T> {
    data: T
    errors?: Array<{
        message: string
        status: number
        locations: Array<{
            line: number
            column: number
        }>
    }>
}

// Response Types for specific queries
export interface UserMediaListResponse {
    User?: {
        id: number
        name: string
        mediaListOptions?: MediaListOptions
    }
    MediaListCollection?: {
        lists: MediaListGroup[]
        user?: User
        hasNextChunk?: boolean
    }
}

export interface MediaListGroup {
    entries?: MediaListEntry[]
    name: string
    isCustomList?: boolean
    isSplitCompletedList?: boolean
    status?: MediaListStatus
}

export interface UserSearchResponse {
    User?: User
}

// GraphQL Query Variables
export interface UserMediaListVariables extends Record<string, unknown> {
    userName: string
    type: MediaType
    status?: MediaListStatus
}

export interface UserSearchVariables extends Record<string, unknown> {
    search: string
}

// Anisong Types (keep existing)
export interface AnisongSearchPayload {
    anime_search_filter: {
        search: string
        partial_match: boolean
    }
    song_name_search_filter: {
        search: string
        partial_match: boolean
    }
    artist_search_filter: {
        search: string
        partial_match: boolean
        group_granularity: number
        max_other_artist: number
    }
    composer_search_filter: {
        search: string
        partial_match: boolean
        arrangement: boolean
    }
    and_logic: boolean
    ignore_duplicate: boolean
    opening_filter: boolean
    ending_filter: boolean
    insert_filter: boolean
    normal_broadcast: boolean
    dub: boolean
    rebroadcast: boolean
    standard: boolean
    instrumental: boolean
    chanting: boolean
    character: boolean
}

export interface AnisongArtist {
    id: number
    names: string[]
    line_up_id: number | null
    groups: AnisongArtist[] | null
    members: AnisongArtist[] | null
}

export interface AnisongData {
    annId: number
    annSongId: number
    animeENName: string
    animeJPName: string
    animeAltName: string | null
    animeVintage: string
    linked_ids: {
        myanimelist: number
        anidb: number
        anilist: number
        kitsu: number
    }
    animeType: string
    animeCategory: string
    songType: string
    songName: string
    songArtist: string
    songComposer: string
    songArranger: string
    songDifficulty: number
    songCategory: string
    songLength: number
    isDub: boolean
    isRebroadcast: boolean
    HQ: string
    MQ: string
    audio: string
    artists: AnisongArtist[]
    composers: AnisongArtist[]
    arrangers: AnisongArtist[]
}

export type AnisongSearchResponse = AnisongData[]