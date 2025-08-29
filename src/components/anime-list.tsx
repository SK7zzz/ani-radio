import { memo, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Star, Calendar, Play, Eye, Users, ExternalLink, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaListStatus, MediaFormat } from '@/types/anilist'
import type { MediaListEntry } from '@/types/anilist'

interface AnimeListProps {
    entries: MediaListEntry[]
    isLoading?: boolean
    className?: string
}

const AnimeList = memo<AnimeListProps>(({ entries, isLoading, className }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [formatFilter, setFormatFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('title')

    const filteredAndSortedEntries = useMemo(() => {
        let filtered = entries

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(entry =>
                entry.media.title.romaji?.toLowerCase().includes(query) ||
                entry.media.title.english?.toLowerCase().includes(query) ||
                entry.media.title.native?.toLowerCase().includes(query) ||
                entry.media.genres?.some(genre => genre.toLowerCase().includes(query))
            )
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(entry => entry.status === statusFilter)
        }

        // Apply format filter
        if (formatFilter !== 'all') {
            filtered = filtered.filter(entry => entry.media.format === formatFilter)
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return (a.media.title.userPreferred || a.media.title.romaji || '').localeCompare(
                        b.media.title.userPreferred || b.media.title.romaji || ''
                    )
                case 'score':
                    return (b.score || 0) - (a.score || 0)
                case 'progress':
                    return (b.progress || 0) - (a.progress || 0)
                case 'year':
                    return (b.media.seasonYear || 0) - (a.media.seasonYear || 0)
                case 'popularity':
                    return (b.media.popularity || 0) - (a.media.popularity || 0)
                case 'average-score':
                    return (b.media.averageScore || 0) - (a.media.averageScore || 0)
                default:
                    return 0
            }
        })

        return sorted
    }, [entries, searchQuery, statusFilter, formatFilter, sortBy])

    const getStatusColor = (status: MediaListStatus) => {
        switch (status) {
            case MediaListStatus.COMPLETED:
                return 'bg-green-100 text-green-800 hover:bg-green-200'
            case MediaListStatus.CURRENT:
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            case MediaListStatus.PLANNING:
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            case MediaListStatus.PAUSED:
                return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            case MediaListStatus.DROPPED:
                return 'bg-red-100 text-red-800 hover:bg-red-200'
            case MediaListStatus.REPEATING:
                return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }
    }

    const formatStatus = (status: MediaListStatus) => {
        switch (status) {
            case MediaListStatus.COMPLETED:
                return 'Completed'
            case MediaListStatus.CURRENT:
                return 'Watching'
            case MediaListStatus.PLANNING:
                return 'Planning'
            case MediaListStatus.PAUSED:
                return 'Paused'
            case MediaListStatus.DROPPED:
                return 'Dropped'
            case MediaListStatus.REPEATING:
                return 'Rewatching'
            default:
                return status
        }
    }

    const formatProgress = (entry: MediaListEntry) => {
        const progress = entry.progress || 0
        const total = entry.media.episodes || '?'
        return `${progress}/${total}`
    }

    const getScoreColor = (score: number) => {
        if (score === 0) return 'text-gray-500'
        if (score >= 8) return 'text-green-600'
        if (score >= 7) return 'text-blue-600'
        if (score >= 6) return 'text-yellow-600'
        if (score >= 5) return 'text-orange-600'
        return 'text-red-600'
    }

    if (isLoading) {
        return (
            <div className={cn("space-y-4", className)}>
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (entries.length === 0) {
        return (
            <Card className={cn("w-full", className)}>
                <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No anime found in the list</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Filters and Search */}
            <Card className="p-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <h3 className="font-semibold">Filters & Search</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by title or genre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <Label htmlFor="status-filter">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value={MediaListStatus.COMPLETED}>Completed</SelectItem>
                                    <SelectItem value={MediaListStatus.CURRENT}>Watching</SelectItem>
                                    <SelectItem value={MediaListStatus.PLANNING}>Planning</SelectItem>
                                    <SelectItem value={MediaListStatus.PAUSED}>Paused</SelectItem>
                                    <SelectItem value={MediaListStatus.DROPPED}>Dropped</SelectItem>
                                    <SelectItem value={MediaListStatus.REPEATING}>Rewatching</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Format Filter */}
                        <div>
                            <Label htmlFor="format-filter">Format</Label>
                            <Select value={formatFilter} onValueChange={setFormatFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Formats</SelectItem>
                                    <SelectItem value={MediaFormat.TV}>TV</SelectItem>
                                    <SelectItem value={MediaFormat.MOVIE}>Movie</SelectItem>
                                    <SelectItem value={MediaFormat.OVA}>OVA</SelectItem>
                                    <SelectItem value={MediaFormat.ONA}>ONA</SelectItem>
                                    <SelectItem value={MediaFormat.SPECIAL}>Special</SelectItem>
                                    <SelectItem value={MediaFormat.MUSIC}>Music</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort */}
                        <div>
                            <Label htmlFor="sort">Sort By</Label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="title">Title</SelectItem>
                                    <SelectItem value="score">My Score</SelectItem>
                                    <SelectItem value="progress">Progress</SelectItem>
                                    <SelectItem value="year">Year</SelectItem>
                                    <SelectItem value="popularity">Popularity</SelectItem>
                                    <SelectItem value="average-score">Average Score</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredAndSortedEntries.length} of {entries.length} anime
                </p>
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                    >
                        Clear Search
                    </Button>
                )}
            </div>

            {/* Anime Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredAndSortedEntries.map((entry) => (
                    <Card
                        key={entry.id}
                        className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                    >
                        {/* Cover Image */}
                        <div className="relative h-64 overflow-hidden">
                            <img
                                src={entry.media.coverImage?.large || entry.media.coverImage?.medium || ''}
                                alt={entry.media.title.userPreferred || entry.media.title.romaji}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                            />
                            {/* Overlay with score */}
                            <div className="absolute top-2 right-2 space-y-1">
                                {entry.score && entry.score > 0 && (
                                    <Badge className="bg-black/70 text-white hover:bg-black/80">
                                        <Star className="h-3 w-3 mr-1 fill-current" />
                                        {entry.score}
                                    </Badge>
                                )}
                                <Badge className={cn("text-xs", getStatusColor(entry.status))}>
                                    {formatStatus(entry.status)}
                                </Badge>
                            </div>

                            {/* Progress overlay */}
                            {entry.status === MediaListStatus.CURRENT && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                    <p className="text-white text-xs">
                                        <Play className="h-3 w-3 inline mr-1" />
                                        Episode {formatProgress(entry)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <CardHeader className="p-3">
                            <CardTitle className="text-sm font-semibold line-clamp-2 min-h-[2.5rem]">
                                {entry.media.title.userPreferred || entry.media.title.romaji}
                            </CardTitle>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {entry.media.seasonYear && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {entry.media.seasonYear}
                                    </span>
                                )}
                                {entry.media.format && (
                                    <Badge variant="outline" className="text-xs">
                                        {entry.media.format}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-3 pt-0 space-y-2">
                            {/* Statistics */}
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3 text-blue-500" />
                                    <span>{entry.media.popularity?.toLocaleString() || 'N/A'}</span>
                                </div>

                                {entry.media.averageScore && (
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3 text-green-500" />
                                        <span className={getScoreColor(entry.media.averageScore / 10)}>
                                            {(entry.media.averageScore / 10).toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Genres */}
                            {entry.media.genres && entry.media.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {entry.media.genres.slice(0, 2).map((genre) => (
                                        <Badge key={genre} variant="secondary" className="text-xs">
                                            {genre}
                                        </Badge>
                                    ))}
                                    {entry.media.genres.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{entry.media.genres.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* External Link */}
                            {entry.media.siteUrl && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => window.open(entry.media.siteUrl, '_blank')}
                                >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View on AniList
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No results */}
            {filteredAndSortedEntries.length === 0 && (
                <Card>
                    <CardContent className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">
                            No anime match the current filters
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
})

AnimeList.displayName = 'AnimeList'

export { AnimeList } 