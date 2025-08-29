// AnisongDB Types
export interface AnisongDBSong {
    songId?: number;
    songName: string;
    songArtist: string;
    songType: 'Opening' | 'Ending' | 'Insert Song' | 'OST';
    animeENName: string;
    animeJPName: string;
    animeId?: number;
    animeYear?: number;
    animeSeason?: string;
    animeType?: string;
    animeGenre?: string[];
    HQ?: string | null;
    MQ?: string | null;
    audio?: string | null;
    composers?: Array<{ name: string; id?: number }>;
    artists?: Array<{ name: string; id?: number }>;
    duration?: number;
    vintage?: string;
    difficulty?: number;
    category?: string;
}

// Random Song Selection Types
export interface RandomSongRequest {
    animeIds?: number[];
    animeNames?: string[];
    songTypes?: Array<'Opening' | 'Ending' | 'Insert Song'>;
    excludeIds?: number[];
    limit?: number;
    preferHigherRated?: boolean;
    minScore?: number;
}

export interface RandomSongResponse {
    song: AnisongDBSong;
    sourceAnime: {
        id: number;
        title: {
            romaji: string;
            english?: string;
        };
        score: number;
        popularity: number;
        season?: string;
        seasonYear?: number;
        coverImage?: {
            extraLarge?: string;
            large?: string;
            medium?: string;
        };
    };
    metadata: {
        selectionMethod: 'random' | 'weighted' | 'popular';
        totalCandidates: number;
        requestTimestamp: Date;
    };
}

// Queue Types
export interface QueueItem extends RandomSongResponse {
    id: string;
    preloaded: boolean;
    addedAt?: Date;
}

// Combined Service Types
export interface CombinedAnimeData {
    aniListEntry: {
        id: number;
        title: {
            romaji: string;
            english?: string;
            native?: string;
        };
        score: number;
        status: string;
        progress: number;
        media: {
            id: number;
            title: {
                romaji: string;
                english?: string;
                native?: string;
            };
            averageScore?: number;
            popularity?: number;
            genres: string[];
            year?: number;
            season?: string;
        };
    };
    songs: AnisongDBSong[];
    audioUrls: {
        hq?: string;
        mq?: string;
        audio?: string;
    };
}

// Error Types
export interface AnisongError {
    code: string;
    message: string;
    details?: unknown;
    timestamp: Date;
}

// Cache Types
export interface CachedSongData {
    song: AnisongDBSong;
    audioUrls: string[];
    cachedAt: Date;
    expiresAt: Date;
}

// Hook Configuration Types
export interface RandomSongHookConfig {
    enabled?: boolean;
    refetchInterval?: number;
    maxRetries?: number;
    cacheTime?: number;
    staleTime?: number;
    onSongSelect?: (song: AnisongDBSong) => void;
    onError?: (error: AnisongError) => void;
}

// Player Types
export interface AudioPlayerState {
    currentSong: AnisongDBSong | null;
    isPlaying: boolean;
    isLoading: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    audioUrl: string | null;
    quality: 'HQ' | 'MQ' | 'audio';
    error: string | null;
}

export interface PlayerControls {
    play: () => void;
    pause: () => void;
    stop: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    changeQuality: (quality: 'HQ' | 'MQ' | 'audio') => void;
    loadSong: (song: AnisongDBSong) => Promise<void>;
}

// Export utility type for the main combined export
export type * from './anilist'; 