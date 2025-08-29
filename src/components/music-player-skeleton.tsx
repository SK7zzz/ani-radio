import { memo } from 'react'
import { motion } from 'framer-motion'

export const MusicPlayerSkeleton = memo(() => {
    return (
        <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border shadow-2xl h-40 sm:h-20"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Progress bar skeleton */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                <motion.div
                    className="h-full bg-primary w-1/3"
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                />
            </div>

            <div className="px-4 py-4 sm:py-3 h-full relative z-10">
                {/* Mobile Column Layout - Hidden on sm and up */}
                <div className="flex sm:hidden h-full flex-col justify-between">
                    {/* Top section - All info */}
                    <div className="space-y-2">
                        {/* Anime info row */}
                        <div className="flex items-center space-x-3">
                            {/* Anime cover image skeleton */}
                            <div className="w-12 h-12 bg-muted rounded-lg animate-pulse flex-shrink-0" />

                            {/* Anime and song info skeleton */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="h-3 bg-muted rounded animate-pulse w-24" />
                                <div className="h-4 bg-muted rounded animate-pulse w-32" />
                                <div className="h-3 bg-muted rounded animate-pulse w-20" />
                            </div>

                            {/* Time info skeleton */}
                            <div className="flex items-center space-x-1 flex-shrink-0">
                                <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                                <span className="text-muted-foreground">/</span>
                                <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom section - Controls */}
                    <div className="flex items-center justify-between">
                        {/* Left - Repeat skeleton */}
                        <div className="flex-1 flex justify-start">
                            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                        </div>

                        {/* Center - Playback controls skeleton */}
                        <div className="flex items-center space-x-2">
                            {/* Previous */}
                            <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                            {/* Play/Pause - Larger */}
                            <div className="h-16 w-16 bg-primary/40 rounded-full animate-pulse" />
                            {/* Next */}
                            <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                        </div>

                        {/* Right - Volume controls skeleton */}
                        <div className="flex-1 flex justify-end items-center">
                            <div className="w-20 h-2 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Desktop Layout - Hidden on mobile, shown on sm and up */}
                <div className="hidden sm:flex items-center justify-between h-full">
                    {/* Left section skeleton */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse w-32" />
                            <div className="h-3 bg-muted rounded animate-pulse w-24" />
                        </div>
                    </div>

                    {/* Center controls skeleton */}
                    <div className="flex items-center justify-center space-x-3">
                        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                        <div className="h-12 w-12 bg-primary/40 rounded-full animate-pulse" />
                        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                    </div>

                    {/* Right section skeleton */}
                    <div className="flex items-center space-x-3 flex-1 justify-end">
                        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                        <div className="w-20 h-2 bg-muted rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
})

MusicPlayerSkeleton.displayName = 'MusicPlayerSkeleton' 