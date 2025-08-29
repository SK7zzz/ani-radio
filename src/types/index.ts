// Re-export all AniList types
export * from './anilist'

// Re-export all Anisong types
export * from './anisong'

// Additional utility types for the application
export interface AppConfig {
    apiTimeout: number;
    maxRetries: number;
    defaultCacheTime: number;
    defaultStaleTime: number;
}

export interface User {
    id: number;
    name: string;
    avatar?: {
        large?: string;
        medium?: string;
    };
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    timestamp: Date;
} 