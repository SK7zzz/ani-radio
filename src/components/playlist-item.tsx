import { memo } from 'react'

interface PlaylistItemProps {
    item: any
    onImageClick: (imageUrl: string) => void
    onSongClick: (item: any) => void
}

export const PlaylistItem = memo(({ item, onImageClick, onSongClick }: PlaylistItemProps) => {
    return (
        <div
            className={`
                flex items-center gap-4 p-3 rounded-lg transition-all mb-2 relative cursor-pointer group
                ${item.isCurrent
                    ? 'bg-primary/15 border-2 border-primary shadow-lg ring-2 ring-primary/20'
                    : item.isHistory
                        ? 'bg-muted/20 opacity-70 border border-muted/30 hover:opacity-85 hover:bg-muted/30 hover:scale-[1.02]'
                        : 'bg-card hover:bg-muted/50 border border-transparent hover:border-muted hover:shadow-md hover:scale-[1.02]'
                }
            `}
            onClick={() => onSongClick(item)}
            title={item.isCurrent ? "Currently playing" : item.isHistory ? "Click to play this song from history" : "Click to skip to this song"}
        >
            {/* Position indicator for history */}
            {item.isHistory && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-muted-foreground/30 rounded-r"></div>
            )}

            {/* Status Indicator */}
            <div className="flex-shrink-0 w-4 flex justify-center">
                {item.isCurrent ? (
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg border-2 border-primary/30 relative">
                        <div className="absolute inset-0 bg-primary/50 rounded-full animate-ping"></div>
                    </div>
                ) : item.isHistory ? (
                    <div className="w-3 h-3 bg-muted-foreground/60 rounded-full border border-muted-foreground/30"></div>
                ) : (
                    <div className="w-2 h-2 bg-primary/40 rounded-full"></div>
                )}
            </div>

            {/* Album Art */}
            <div className="flex-shrink-0">
                {item.sourceAnime?.coverImage?.medium ? (
                    <img
                        src={item.sourceAnime.coverImage.medium}
                        alt={item.sourceAnime.title?.english || item.song.animeENName || 'Anime cover'}
                        className="w-12 h-15 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation()
                            onImageClick(item.sourceAnime?.coverImage?.large || item.sourceAnime?.coverImage?.medium || '')
                        }}
                    />
                ) : (
                    <div className="w-12 h-15 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">♪</span>
                    </div>
                )}
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm truncate ${item.isCurrent ? 'text-primary' : ''}`}>
                    {item.song.songName}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                    {item.song.songArtist}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    {item.sourceAnime?.title?.english || item.song.animeENName ||
                        item.sourceAnime?.title?.romaji || item.song.animeJPName}
                </p>
            </div>

            {/* Song Type and Status */}
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                    {item.song.songType}
                </span>
                {item.isCurrent && (
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded font-medium">
                        Now Playing
                    </span>
                )}
                {/* Click indicator - only show on hover for non-current items */}
                {!item.isCurrent && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.isHistory ? '↺ Replay' : '▶ Skip to'}
                    </span>
                )}
            </div>
        </div>
    )
})

PlaylistItem.displayName = 'PlaylistItem'
