import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Star, Eye, Trophy, Clock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types/anilist'

interface UserProfileCardProps {
    user: User | null
    statistics?: {
        totalAnime: number
        completedCount: number
        currentlyWatching: number
        planToWatch: number
        dropped: number
        paused: number
        totalEpisodes: number
        averageScore: number
        topGenres: [string, number][]
    }
    className?: string
}

const UserProfileCard = memo<UserProfileCardProps>(({
    user,
    statistics,
    className
}) => {
    if (!user) {
        return (
            <Card className={cn("w-full shadow-lg", className)}>
                <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No user selected</p>
                </CardContent>
            </Card>
        )
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getDonatorBadgeColor = (tier: number) => {
        switch (tier) {
            case 1: return 'bg-orange-500 hover:bg-orange-600'
            case 2: return 'bg-purple-500 hover:bg-purple-600'
            case 3: return 'bg-pink-500 hover:bg-pink-600'
            case 4: return 'bg-red-500 hover:bg-red-600'
            case 5: return 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
            default: return 'bg-gray-500 hover:bg-gray-600'
        }
    }

    return (
        <Card className={cn("w-full shadow-lg overflow-hidden", className)}>
            {/* Banner Image */}
            {user.bannerImage && (
                <div
                    className="h-32 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${user.bannerImage})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
            )}

            <CardHeader className={cn(
                "pb-4",
                user.bannerImage ? "-mt-16 relative z-10" : ""
            )}>
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                        <AvatarImage
                            src={user.avatar?.large || user.avatar?.medium}
                            alt={user.name}
                        />
                        <AvatarFallback className="text-lg font-bold">
                            {getUserInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className={cn(
                                "text-2xl font-bold",
                                user.bannerImage ? "text-white drop-shadow-lg" : ""
                            )}>
                                {user.name}
                            </CardTitle>

                            {/* Donator Badge */}
                            {user.donatorTier && user.donatorTier > 0 && (
                                <Badge
                                    className={cn(
                                        "text-white font-semibold",
                                        getDonatorBadgeColor(user.donatorTier)
                                    )}
                                >
                                    <Trophy className="h-3 w-3 mr-1" />
                                    Donator {user.donatorTier}
                                </Badge>
                            )}

                            {/* Moderator Roles */}
                            {user.moderatorRoles && user.moderatorRoles.length > 0 && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    <Star className="h-3 w-3 mr-1" />
                                    Moderator
                                </Badge>
                            )}
                        </div>

                        {/* Join Date */}
                        {user.createdAt && (
                            <CardDescription className={cn(
                                "flex items-center gap-1 text-sm",
                                user.bannerImage ? "text-white/80" : "text-muted-foreground"
                            )}>
                                <Calendar className="h-4 w-4" />
                                Joined {formatDate(user.createdAt)}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* About Section */}
                {user.about && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-foreground">About</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {user.about.replace(/<[^>]*>/g, '')} {/* Remove HTML tags */}
                        </p>
                    </div>
                )}

                {/* Statistics */}
                {statistics && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-foreground">Anime Statistics</h4>

                        {/* Main Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center space-y-1">
                                <div className="flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-blue-500 mr-1" />
                                    <span className="text-lg font-bold text-blue-600">
                                        {statistics.totalAnime}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Total Anime</p>
                            </div>

                            <div className="text-center space-y-1">
                                <div className="flex items-center justify-center">
                                    <Trophy className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-lg font-bold text-green-600">
                                        {statistics.completedCount}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>

                            <div className="text-center space-y-1">
                                <div className="flex items-center justify-center">
                                    <Eye className="h-4 w-4 text-purple-500 mr-1" />
                                    <span className="text-lg font-bold text-purple-600">
                                        {statistics.currentlyWatching}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Watching</p>
                            </div>

                            <div className="text-center space-y-1">
                                <div className="flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-orange-500 mr-1" />
                                    <span className="text-lg font-bold text-orange-600">
                                        {statistics.totalEpisodes}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Episodes</p>
                            </div>
                        </div>

                        {/* Average Score */}
                        {statistics.averageScore > 0 && (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="text-lg font-bold text-yellow-600">
                                        {statistics.averageScore}/100
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Average Score</p>
                            </div>
                        )}

                        {/* Top Genres */}
                        {statistics.topGenres.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="font-medium text-sm text-foreground">Top Genres</h5>
                                <div className="flex flex-wrap gap-1">
                                    {statistics.topGenres.slice(0, 5).map(([genre, count]) => (
                                        <Badge
                                            key={genre}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {genre} ({count})
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
})

UserProfileCard.displayName = 'UserProfileCard'

export { UserProfileCard } 