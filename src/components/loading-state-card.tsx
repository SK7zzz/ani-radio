import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { User, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import type { User as AniListUser } from '@/types/anilist'

interface LoadingStateCardProps {
    selectedUser: AniListUser
}

export const LoadingStateCard = memo(({ selectedUser }: LoadingStateCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="bg-card/90 backdrop-blur-sm border-primary/20 border shadow-xl overflow-hidden relative">
                {/* User Badge - Top Right of Card */}
                <div className="absolute top-4 right-4 z-10">
                    <div className="inline-flex items-center space-x-2 text-primary-foreground bg-primary/90 dark:bg-primary/70 backdrop-blur-sm px-3 py-2 rounded-full text-sm shadow-lg">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{selectedUser.name}</span>
                    </div>
                </div>

                <CardContent className="p-6 pt-4">
                    {/* Loading skeleton */}
                    <div className="flex flex-col items-center space-y-5">
                        {/* Circular skeleton for image */}
                        <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-muted flex items-center justify-center shadow-2xl border-4 border-primary/20 animate-pulse">
                            <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                        </div>

                        {/* Text skeletons */}
                        <div className="text-center space-y-4 max-w-lg w-full">
                            <div className="space-y-2">
                                <div className="h-8 bg-muted rounded-lg animate-pulse mx-auto w-3/4"></div>
                                <div className="h-6 bg-muted rounded-lg animate-pulse mx-auto w-1/2"></div>
                            </div>
                            <div className="h-6 bg-muted rounded-lg animate-pulse mx-auto w-2/3"></div>
                            <div className="h-8 bg-muted rounded-full animate-pulse mx-auto w-24"></div>

                            {/* Loading text */}
                            <p className="text-primary text-sm mt-4">
                                Loading songs from {selectedUser.name}'s anime list...
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
})

LoadingStateCard.displayName = 'LoadingStateCard' 