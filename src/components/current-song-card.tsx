import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { getAniListAnimeUrl } from '@/lib/utils/anime-utils'
import type { User as AniListUser } from '@/types/anilist'

interface CurrentSongData {
    song: {
        songName: string
        songArtist: string
        animeENName?: string | null
        animeJPName?: string | null
        songType?: string | null
        songTypeNumber?: number | string | null
        animeSeason?: string | null
        animeYear?: number | null
        audio?: string | null
        MQ?: string | null
        HQ?: string | null
    }
    sourceAnime?: {
        title?: {
            english?: string | null
            romaji?: string | null
        }
        season?: string | null
        seasonYear?: number | null
        coverImage?: {
            extraLarge?: string | null
            large?: string | null
            medium?: string | null
        }
    } | null
}

interface CurrentSongCardProps {
    currentSong: CurrentSongData
    selectedUser?: AniListUser
    onImageClick?: (imageUrl: string) => void
    onChangeUser?: () => void
}

export const CurrentSongCard = memo(({
    currentSong,
    selectedUser,
    onImageClick,
    onChangeUser,
}: CurrentSongCardProps) => {
    const openAnimeLink = () => {
        const animeTitle = getAnimeTitle();
        if (animeTitle) {
            window.open(getAniListAnimeUrl(animeTitle), '_blank');
        }
    }

    const handleAnimeClick = (e: React.MouseEvent) => {
        if (e.type === 'mouseup' && (e.button === 0 || e.button === 1)) {
            e.preventDefault();
            openAnimeLink();
        }
    }

    const handleImageClick = () => {
        const imageUrl = currentSong.sourceAnime?.coverImage?.extraLarge ||
            currentSong.sourceAnime?.coverImage?.large ||
            currentSong.sourceAnime?.coverImage?.medium
        if (imageUrl && onImageClick) {
            onImageClick(imageUrl)
        }
    }

    const getAnimeTitle = (): string | undefined => {
        const title = currentSong.sourceAnime?.title?.romaji ||
            currentSong.song.animeJPName ||
            currentSong.sourceAnime?.title?.english ||
            currentSong.song.animeENName
        return title || undefined
    }

    const getCoverImageUrl = (): string | undefined => {
        const url = currentSong.sourceAnime?.coverImage?.extraLarge ||
            currentSong.sourceAnime?.coverImage?.large ||
            currentSong.sourceAnime?.coverImage?.medium
        return url || undefined
    }

    const getSongTypeDisplay = (): string | null => {
        if (!currentSong.song.songType) return null
        return currentSong.song.songTypeNumber
            ? `${currentSong.song.songType} ${currentSong.song.songTypeNumber}`
            : currentSong.song.songType
    }

    const getSeasonInfo = (): string | null => {
        // Try sourceAnime first (from AniList), then fall back to song data
        const season = currentSong.sourceAnime?.season || currentSong.song.animeSeason
        const year = currentSong.sourceAnime?.seasonYear || currentSong.song.animeYear

        if (season && year) {
            return `${season} ${year}`
        } else if (year) {
            return year.toString()
        } else if (season) {
            return season
        }
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Card className="bg-card/90 backdrop-blur-sm border-primary/80 dark:border-primary/20 border shadow-xl overflow-hidden relative">
                {/* Now Playing Badge - Top Left of Card */}
                <div className="absolute top-4 left-4 z-10">
                    <div className="inline-flex items-center space-x-2 text-primary-foreground bg-primary/90 dark:bg-primary/70 backdrop-blur-sm px-3 py-2 rounded-full text-sm shadow-lg">
                        {/* Animated Music Waves - Smaller and Slower */}
                        <div className="flex items-center space-x-0.5">
                            <motion.div
                                className="w-0.5 bg-slate-900 rounded-full"
                                animate={{
                                    height: [6, 12, 6, 9, 6]
                                }}
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <motion.div
                                className="w-0.5 bg-slate-900 rounded-full"
                                animate={{
                                    height: [9, 6, 12, 6, 9]
                                }}
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.15
                                }}
                            />
                            <motion.div
                                className="w-0.5 bg-slate-900 rounded-full"
                                animate={{
                                    height: [6, 10, 7, 12, 6]
                                }}
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.3
                                }}
                            />
                            <motion.div
                                className="w-0.5 bg-slate-900 rounded-full"
                                animate={{
                                    height: [12, 7, 6, 10, 12]
                                }}
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.45
                                }}
                            />
                        </div>
                        <span className="font-medium">Now Playing</span>
                    </div>
                </div>

                {/* User Badge - Top Right of Card */}
                {selectedUser && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className="inline-flex items-center space-x-2 text-primary-foreground bg-primary/90 dark:bg-primary/70 backdrop-blur-sm px-3 py-2 rounded-full text-sm shadow-lg">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{selectedUser.name}</span>
                        </div>
                    </div>
                )}

                <CardContent className="p-6 pt-4">
                    {/* Anime Cover - Circular Avatar Style */}
                    <motion.div
                        className="flex flex-col items-center space-y-5"
                        key={currentSong.song.songName} // Key for re-animation on song change
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            type: "spring",
                            stiffness: 100,
                            damping: 20
                        }}
                    >
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <motion.div
                                className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-primary/20 dark:bg-primary/60 flex items-center justify-center shadow-2xl border-4 border-primary/60 dark:border-primary/30"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            >
                                {getCoverImageUrl() ? (
                                    <motion.img
                                        src={getCoverImageUrl()}
                                        alt={getAnimeTitle() || 'Anime Cover'}
                                        className="w-full h-full object-cover cursor-pointer"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                        onClick={handleImageClick}
                                    />
                                ) : (
                                    <motion.div
                                        className="text-6xl text-blue-600 dark:text-blue-400"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        🎵
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>

                        {/* Song Information */}
                        <motion.div
                            className="text-center space-y-4 max-w-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Song Title and Artist */}
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                                    {currentSong.song.songName}
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    {currentSong.song.songArtist}
                                </p>
                            </motion.div>

                            {/* Anime Title - Clickable */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <button
                                    onMouseUp={handleAnimeClick}
                                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200 text-lg font-medium hover:underline"
                                >
                                    <span>{getAnimeTitle()}</span>
                                    <ExternalLink className="h-4 w-4" />
                                </button>
                            </motion.div>

                            {/* Song Type Badge */}
                            {currentSong.song.songType && (
                                <motion.div
                                    className="flex justify-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.5 }}
                                >
                                    <div className="inline-flex items-center px-4 py-2 bg-primary/80 dark:bg-primary/40 text-primary-foreground dark:text-primary rounded-full text-sm font-medium border border-primary/60 dark:border-primary/40">
                                        {getSongTypeDisplay()}
                                    </div>
                                </motion.div>
                            )}

                            {/* Season Badge */}
                            {getSeasonInfo() && (
                                <motion.div
                                    className="flex justify-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.6 }}
                                >
                                    <div className="inline-flex items-center px-4 py-2 bg-primary/80 dark:bg-primary/40 text-primary-foreground dark:text-primary rounded-full text-sm font-medium border border-primary/60 dark:border-primary/40">
                                        {getSeasonInfo()}
                                    </div>
                                </motion.div>
                            )}

                            {/* Action Buttons */}
                            {onChangeUser && (
                                <motion.div
                                    className="flex justify-center pt-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.7 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onChangeUser}
                                            className="border-border hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80 dark:hover:text-accent-foreground/80"
                                        >
                                            Change User
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    )
})

CurrentSongCard.displayName = 'CurrentSongCard' 