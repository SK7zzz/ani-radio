import React, { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Repeat,
    ChevronUp,
    ExternalLink,
    User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMusicPlayer } from '@/hooks/use-music-player'
import { getAniListAnimeUrl } from '@/lib/utils/anime-utils'

interface MusicPlayerProps {
    song?: {
        title: string
        artist: string
        anime: {
            english?: string
            japanese?: string
            coverImage?: string
            season?: string
            seasonYear?: number
        }
        hasValidAudio: boolean
        songType?: string | null
        songTypeNumber?: number | string | null
    }
    audioUrl?: string
    fallbackUrls?: string[] // Array of fallback URLs [MQ, HQ]
    isVisible: boolean
    onNext?: () => void
    onPrevious?: () => void
    onClose?: () => void
    canGoNext?: boolean
    canGoPrevious?: boolean
    isLoading?: boolean
    autoPlay?: boolean
    className?: string
    selectedUser?: {
        id: number
        name: string
        avatar?: {
            large?: string
            medium?: string
        }
    }
}

export const MusicPlayer: React.FC<MusicPlayerProps> = memo(({
    song,
    audioUrl,
    fallbackUrls = [],
    isVisible,
    onNext,
    onPrevious,
    canGoNext = true,
    canGoPrevious = true,
    isLoading = false,
    autoPlay = false,
    selectedUser,
}) => {
    // Add expanded state
    const [isExpanded, setIsExpanded] = useState(false)

    // Use our custom hook for all player logic
    const {
        playerState,
        audioRefCallback,
        audioEventHandlers,
        controls,
        utils
    } = useMusicPlayer({
        audioUrl,
        fallbackUrls, // Pass fallback URLs
        autoPlay,
        song,
        onNext,
        onPrevious
    })

    // Destructure player state
    const {
        isPlaying,
        duration,
        currentTime,
        volume,
        isMuted,
        repeatMode,
        progressPercentage
    } = playerState

    const handleExpandToggle = () => {
        setIsExpanded(!isExpanded)
    }

    const openAnimeLink = () => {
        const animeTitle = song?.anime.japanese || song?.anime.english
        if (animeTitle) {
            window.open(getAniListAnimeUrl(animeTitle), '_blank')
        }
    }

    const formatSeasonInfo = () => {
        if (!song?.anime.season && !song?.anime.seasonYear) return null

        const seasonMap: Record<string, string> = {
            'WINTER': 'Winter',
            'SPRING': 'Spring',
            'SUMMER': 'Summer',
            'FALL': 'Fall',
            'AUTUMN': 'Fall'
        }

        const season = song.anime.season ? seasonMap[song.anime.season.toUpperCase()] || song.anime.season : ''
        const year = song.anime.seasonYear ? song.anime.seasonYear.toString() : ''

        if (season && year) {
            return `${season} ${year}`
        } else if (year) {
            return year
        } else if (season) {
            return season
        }

        return null
    }

    const getSongTypeDisplay = () => {
        if (!song?.songType) return null
        return song.songTypeNumber
            ? `${song.songType} ${song.songTypeNumber}`
            : song.songType
    }

    if (!isVisible || !song) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50"
            >
                {/* Expand Tab - Floating well above container */}
                <motion.button
                    onClick={handleExpandToggle}
                    className="absolute -top-12 right-6 bg-background/95 backdrop-blur-xl border rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 z-50"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </motion.div>
                </motion.button>

                {/* Expanded Info - Full current-song-card style design */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                height: 'auto'
                            }}
                            exit={{
                                opacity: 0,
                                y: 20,
                                height: 0
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                                mass: 0.8,
                                duration: 0.6
                            }}
                            className="bg-background/95 backdrop-blur-xl border-t border-primary/70 dark:border-primary/30 rounded-t-3xl mb-0 relative max-h-[85vh] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-muted/20 pointer-events-none rounded-t-3xl" />

                            {/* Content Container */}
                            <div className="px-6 py-8 relative z-10">
                                <motion.div
                                    className="flex flex-col items-center space-y-6 max-w-lg mx-auto"
                                    key={song.title} // Key for re-animation on song change
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
                                    {/* Top Badges Row */}
                                    <div className="w-full flex justify-between items-start relative">
                                        {/* Now Playing Badge - Left */}
                                        <div className="inline-flex items-center space-x-2 text-primary-foreground bg-primary/90 dark:bg-primary/70 backdrop-blur-sm px-3 py-2 rounded-full text-sm shadow-lg">
                                            {/* Animated Music Waves */}
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

                                        {/* User Badge - Right */}
                                        {selectedUser && (
                                            <div className="inline-flex items-center space-x-2 text-primary-foreground bg-primary/90 dark:bg-primary/70 backdrop-blur-sm px-3 py-2 rounded-full text-sm shadow-lg">
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">{selectedUser.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Large Circular Cover Image */}
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
                                            {song.anime.coverImage ? (
                                                <motion.img
                                                    src={song.anime.coverImage}
                                                    alt={song.anime.japanese || song.anime.english || 'Anime Cover'}
                                                    className="w-full h-full object-cover"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.4 }}
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
                                        className="text-center space-y-4 w-full max-w-md"
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
                                                {song.title}
                                            </h2>
                                            <p className="text-lg text-muted-foreground">
                                                {song.artist}
                                            </p>
                                        </motion.div>

                                        {/* Anime Title - Clickable */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.4 }}
                                        >
                                            <button
                                                onClick={openAnimeLink}
                                                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200 text-lg font-medium hover:underline"
                                            >
                                                <span>{song.anime.japanese || song.anime.english}</span>
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                        </motion.div>

                                        {/* Badges Row */}
                                        <motion.div
                                            className="flex flex-wrap justify-center gap-3"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4, delay: 0.5 }}
                                        >
                                            {/* Song Type Badge */}
                                            {getSongTypeDisplay() && (
                                                <div className="inline-flex items-center px-3 py-1.5 bg-primary/80 dark:bg-primary/40 text-primary-foreground dark:text-primary rounded-full text-sm font-medium border border-primary/60 dark:border-primary/40">
                                                    {getSongTypeDisplay()}
                                                </div>
                                            )}

                                            {/* Season Badge */}
                                            {formatSeasonInfo() && (
                                                <div className="inline-flex items-center px-3 py-1.5 bg-emerald-500/20 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/40 dark:border-emerald-400/40">
                                                    🗓️ {formatSeasonInfo()}
                                                </div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Player - Always visible with responsive height */}
                <div className={cn(
                    "bg-background/95 backdrop-blur-xl border-t border shadow-2xl h-40 sm:h-20 relative")}>
                    <div className={cn(
                        "absolute inset-0 bg-muted/20 pointer-events-none"
                    )} />

                    {/* Audio element */}
                    <audio
                        ref={audioRefCallback}
                        onLoadedMetadata={audioEventHandlers.onLoadedMetadata}
                        onTimeUpdate={audioEventHandlers.onTimeUpdate}
                        onEnded={audioEventHandlers.onEnded}
                        preload="metadata"
                    />

                    {/* Progress bar - full width on top with conditional rounded corners */}
                    <motion.div
                        className={cn(
                            "absolute top-0 left-0 right-0 h-1 bg-muted cursor-pointer group z-20"
                        )}
                        whileHover={{ height: 4 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            const rect = e.currentTarget.getBoundingClientRect()
                            const clickX = e.clientX - rect.left
                            const percentage = (clickX / rect.width) * 100
                            controls.seek([percentage])
                        }}
                    >
                        <motion.div
                            className={cn(
                                "h-full bg-primary relative",
                                isExpanded ? "rounded-none" : "rounded-t-3xl"
                            )}
                            style={{ width: `${progressPercentage}%` }}
                            initial={false}
                            animate={{
                                width: `${progressPercentage}%`,
                            }}
                            transition={{
                                duration: 0.3,
                                ease: "easeInOut",
                                type: "spring",
                                stiffness: 300,
                                damping: 25
                            }}
                        >
                            <motion.div
                                className="absolute right-0 top-1/2 w-3 h-3 bg-primary rounded-full transform -translate-y-1/2 opacity-0 group-hover:opacity-100 shadow-lg"
                                whileHover={{ scale: 1.2 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Main player content */}
                    <div className="px-4 py-4 sm:py-3 h-full relative z-10">

                        {/* Mobile Column Layout - Hidden on sm and up */}
                        <div className="flex sm:hidden h-full flex-col justify-between">
                            {/* Top section - All info */}
                            <div className="space-y-2">
                                {/* Anime info row */}
                                <div className="flex items-center space-x-3">
                                    {/* Anime cover image */}
                                    <motion.div
                                        className="w-12 h-12 bg-primary/20 dark:bg-primary/15 rounded-lg flex items-center justify-center border border-primary/60 dark:border-primary/30 overflow-hidden flex-shrink-0"
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.15)"
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20,
                                            duration: 0.2
                                        }}
                                    >
                                        {song.anime.coverImage ? (
                                            <motion.img
                                                src={song.anime.coverImage}
                                                alt={song.anime.japanese || song.anime.english || 'Anime Cover'}
                                                className="w-full h-full object-cover rounded-lg"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.4 }}
                                                key={`main-${song.anime.coverImage}`}
                                            />
                                        ) : (
                                            <div className="text-blue-600 dark:text-blue-400 text-lg">🎵</div>
                                        )}
                                    </motion.div>

                                    {/* Anime and song info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-primary font-medium truncate text-xs">
                                            {song.anime.japanese || song.anime.english}
                                        </p>
                                        <h4 className="text-foreground font-semibold truncate text-sm">
                                            {song.title}
                                        </h4>
                                        <p className="text-muted-foreground text-xs truncate">
                                            {song.artist}
                                        </p>
                                    </div>

                                    {/* Time info */}
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
                                        <span>{utils.formatTime(currentTime)}</span>
                                        <span>/</span>
                                        <span>{utils.formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom section - Controls */}
                            <div className="flex items-center justify-between">
                                {/* Left - Repeat */}
                                <div className="flex-1 flex justify-start">
                                    <motion.div
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 relative",
                                                repeatMode === 'one' && "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50"
                                            )}
                                            onClick={controls.repeatMode}
                                        >
                                            <Repeat className="h-5 w-5" />
                                            {repeatMode === 'one' && (
                                                <span className="absolute -top-1 -right-1 text-xs font-bold text-purple-600 dark:text-purple-300">1</span>
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>

                                {/* Center - Playback controls */}
                                <div className="flex items-center space-x-2">
                                    {/* Previous */}
                                    <motion.div
                                        whileHover={{ scale: 1.1, x: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 disabled:opacity-50"
                                            onClick={onPrevious}
                                            disabled={!canGoPrevious || isLoading}
                                        >
                                            <SkipBack className="h-6 w-6" />
                                        </Button>
                                    </motion.div>

                                    {/* Play/Pause */}
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-16 w-16 bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 text-primary-foreground hover:text-primary-foreground rounded-full shadow-lg transition-all duration-200"
                                            onClick={controls.playPause}
                                            disabled={!song.hasValidAudio}
                                        >
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={isPlaying ? 'pause' : 'play'}
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    exit={{ scale: 0, rotate: 180 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {isPlaying ? (
                                                        <Pause className="h-8 w-8" />
                                                    ) : (
                                                        <Play className="h-8 w-8 ml-0.5" />
                                                    )}
                                                </motion.div>
                                            </AnimatePresence>
                                        </Button>
                                    </motion.div>

                                    {/* Next */}
                                    <motion.div
                                        whileHover={{ scale: 1.1, x: 2 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 disabled:opacity-50"
                                            onClick={onNext}
                                            disabled={!canGoNext || isLoading}
                                        >
                                            <SkipForward className="h-6 w-6" />
                                        </Button>
                                    </motion.div>
                                </div>

                                {/* Right - Volume controls */}
                                <div className="flex-1 flex justify-end items-center">
                                    {/* Volume slider - Always visible on mobile */}
                                    <div className="w-20">
                                        <Slider
                                            value={[isMuted ? 0 : volume]}
                                            onValueChange={controls.volumeChange}
                                            max={100}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Layout - Hidden on mobile, shown on sm and up */}
                        <div className="hidden sm:flex items-center justify-between">

                            {/* Left section - Song info */}
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                {/* Anime cover image */}
                                <motion.div
                                    className="w-12 h-12 bg-primary/20 dark:bg-primary/15 rounded-lg flex items-center justify-center border border-primary/60 dark:border-primary/30 overflow-hidden"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 4px 20px rgba(59, 130, 246, 0.15)"
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                        duration: 0.2
                                    }}
                                >
                                    {song.anime.coverImage ? (
                                        <motion.img
                                            src={song.anime.coverImage}
                                            alt={song.anime.japanese || song.anime.english || 'Anime Cover'}
                                            className="w-full h-full object-cover rounded-lg"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.4 }}
                                            key={`main-${song.anime.coverImage}`}
                                        />
                                    ) : (
                                        <div className="text-blue-600 dark:text-blue-400 text-xl">🎵</div>
                                    )}
                                </motion.div>

                                {/* Song details */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-foreground font-medium truncate text-sm">
                                        {song.title}
                                    </h4>
                                    <p className="text-muted-foreground text-xs truncate">
                                        {song.artist} • {song.anime.japanese || song.anime.english}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                                        <span>{utils.formatTime(currentTime)}</span>
                                        <span>/</span>
                                        <span>{utils.formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Center section - Controls */}
                            <div className="flex items-center justify-center space-x-3">
                                {/* Previous */}
                                <motion.div
                                    whileHover={{ scale: 1.1, x: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 disabled:opacity-50"
                                        onClick={onPrevious}
                                        disabled={!canGoPrevious || isLoading}
                                    >
                                        <SkipBack className="h-5 w-5" />
                                    </Button>
                                </motion.div>

                                {/* Play/Pause */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 text-primary-foreground hover:text-primary-foreground rounded-full shadow-lg transition-all duration-200"
                                        onClick={controls.playPause}
                                        disabled={!song.hasValidAudio}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={isPlaying ? 'pause' : 'play'}
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {isPlaying ? (
                                                    <Pause className="h-6 w-6" />
                                                ) : (
                                                    <Play className="h-6 w-6 ml-0.5" />
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </Button>
                                </motion.div>

                                {/* Next */}
                                <motion.div
                                    whileHover={{ scale: 1.1, x: 2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 disabled:opacity-50"
                                        onClick={onNext}
                                        disabled={!canGoNext || isLoading}
                                    >
                                        <SkipForward className="h-5 w-5" />
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Right section - Volume controls */}
                            <div className="flex items-center space-x-3 flex-1 justify-end">
                                {/* Repeat */}
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 relative",
                                            repeatMode === 'one' && "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50"
                                        )}
                                        onClick={controls.repeatMode}
                                    >
                                        <Repeat className="h-4 w-4" />
                                        {repeatMode === 'one' && (
                                            <span className="absolute -top-1 -right-1 text-xs font-bold text-purple-600 dark:text-purple-300">1</span>
                                        )}
                                    </Button>
                                </motion.div>

                                {/* Volume button */}
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200"
                                        onClick={controls.mute}
                                    >
                                        {isMuted || volume === 0 ? (
                                            <VolumeX className="h-4 w-4" />
                                        ) : (
                                            <Volume2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </motion.div>

                                {/* Volume slider */}
                                <div className="w-20 hidden sm:block">
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        onValueChange={controls.volumeChange}
                                        max={100}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
})

MusicPlayer.displayName = 'MusicPlayer'