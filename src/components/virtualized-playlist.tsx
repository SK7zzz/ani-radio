import { memo, useRef, useEffect, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { PlaylistItem } from '@/components/playlist-item'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface VirtualizedPlaylistProps {
    combinedPlaylist: any[]
    currentSong: any
    onImageClick: (imageUrl: string) => void
    onSongClick: (item: any) => void
    onChangeUser: () => void
    isInitializing?: boolean
    isPreloading?: boolean
    username?: string
}

export const VirtualizedPlaylist = memo(({
    combinedPlaylist,
    currentSong,
    onImageClick,
    onSongClick,
    onChangeUser,
    isInitializing = false,
    isPreloading = false,
    username
}: VirtualizedPlaylistProps) => {
    const parentRef = useRef<HTMLDivElement>(null)

    // Memorizar la función de scroll para mejorar el rendimiento
    const scrollToCurrentSong = useCallback((songIndex: number) => {
        const scrollElement = parentRef.current
        if (!scrollElement) return

        const containerHeight = scrollElement.clientHeight
        const itemHeight = 80
        const targetScrollTop = (songIndex * itemHeight) - (containerHeight / 2) + (itemHeight / 2)

        const currentScrollTop = scrollElement.scrollTop
        const tolerance = containerHeight * 0.1

        if (Math.abs(currentScrollTop - targetScrollTop) > tolerance) {
            scrollElement.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth'
            })
        }
    }, [])

    // Virtualization setup
    const virtualizer = useVirtualizer({
        count: combinedPlaylist.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80, // Altura estimada de cada item
        overscan: 8, // Aumentamos el overscan para mejor rendimiento visual
    })

    // Find the index of the current song in the combined playlist
    const currentSongIndex = combinedPlaylist.findIndex(item => item.isCurrent)

    // Auto-scroll to current song when it changes (mejorado para evitar bugs visuales)
    useEffect(() => {
        if (currentSongIndex >= 0 && currentSong) {
            // Pequeño delay para asegurar que el DOM se ha actualizado
            const timer = setTimeout(() => {
                scrollToCurrentSong(currentSongIndex)
            }, 150)

            return () => clearTimeout(timer)
        }
    }, [currentSong?.id, currentSongIndex, scrollToCurrentSong])

    // Show loading state when initializing or when no songs are loaded yet
    if (isInitializing || (combinedPlaylist.length === 0 && isPreloading)) {
        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Playlist actual</h2>
                    <p className="text-muted-foreground">Canciones reproducidas recientemente y próximas pistas</p>
                </div>

                {/* Loading content with realistic skeleton */}
                <div className="space-y-2">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-card border border-muted/30">
                            {/* Status indicator */}
                            <div className="flex-shrink-0 w-4 flex justify-center">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${i === 0 ? 'bg-primary/40' : 'bg-muted'}`}></div>
                            </div>

                            {/* Album art skeleton */}
                            <div className="flex-shrink-0">
                                <div className="w-12 h-15 bg-muted rounded animate-pulse"></div>
                            </div>

                            {/* Song info skeleton */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                                <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                                <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                            </div>

                            {/* Song type and status skeleton */}
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                                {i === 0 && (
                                    <div className="h-6 w-20 bg-primary/20 rounded animate-pulse"></div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    <div className="flex items-center justify-center py-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <RefreshCw className="h-6 w-6 text-primary" />
                        </motion.div>
                        <span className="ml-2 text-sm text-muted-foreground">Cargando canciones de la lista de anime de {username}...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (combinedPlaylist.length === 0) {
        return (
            <div className="text-center p-12 border-2 border-dashed border-muted rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No hay canciones aún</h3>
                <p className="text-muted-foreground mb-4">
                    Regresa para comenzar a reproducir música
                </p>
                <Button onClick={onChangeUser} variant="secondary">
                    Regresar
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {/* Header - Reducido el espaciado */}
            <div className="hidden sm:block text-center space-y-1">
                <h2 className="text-xl font-bold">Playlist actual</h2>
                <p className="text-sm text-muted-foreground">Canciones reproducidas recientemente y próximas pistas</p>
            </div>

            {/* Playlist */}
            <div
                ref={parentRef}
                className="h-[calc(100vh-30rem)] sm:h-[calc(100vh-18rem)] overflow-y-auto rounded-lg border bg-card/50 p-2 px-4 scrollbar-custom"
                style={{
                    // Mejorar el scroll suave y rendimiento
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                    // Mejoras de rendimiento para la virtualización
                    contain: 'layout style paint',
                    transform: 'translateZ(0)', // Forzar aceleración hardware
                }}
            >
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                        const item = combinedPlaylist[virtualItem.index]
                        return (
                            <div
                                key={`${item.id}-${item.position}`}
                                data-index={virtualItem.index}
                                ref={virtualizer.measureElement}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`,
                                    // Añadir will-change para mejorar el rendimiento
                                    willChange: 'transform',
                                }}
                            >
                                <PlaylistItem
                                    item={item}
                                    onImageClick={onImageClick}
                                    onSongClick={onSongClick}
                                />
                            </div>
                        )
                    })}

                    {/* Loading indicator at the bottom - Dentro del contenedor virtualizado */}
                    {isPreloading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                position: 'absolute',
                                top: `${virtualizer.getTotalSize()}px`,
                                left: 0,
                                width: '100%',
                                height: '60px',
                            }}
                            className="flex items-center justify-center py-4"
                        >
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </motion.div>
                                <span>Cargando más canciones...</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
})

VirtualizedPlaylist.displayName = 'VirtualizedPlaylist'
