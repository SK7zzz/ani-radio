import { memo, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { ErrorDisplayCard } from '@/components/error-display-card'
import { ImageModal } from '@/components/image-modal'
import { useNavigate } from '@tanstack/react-router'
import { usePlayerStore } from '@/lib/stores/player-store'
import { useUserAnimeList } from '@/hooks/use-user-anime-list'
import { usePlaylistNavigation } from '@/hooks/use-playlist-navigation'
import { usePlaylistData } from '@/hooks/use-playlist-data'
import { usePlayerInitialization } from '@/hooks/use-player-initialization'
import { UserProfileSection } from '@/components/user-profile-section'
import { VirtualizedPlaylist } from '@/components/virtualized-playlist'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

export const PlaylistPage = memo(() => {
    const navigate = useNavigate()
    const search = useSearch({ from: '/playlist' })
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [modalImageUrl, setModalImageUrl] = useState('')

    // Get player state and queue
    const {
        currentSong,
        hasError,
        errorMessage,
        currentUsername,
    } = usePlayerStore()

    const username = search.user?.trim() || currentUsername.trim() || ''

    // Custom hooks - must be called before any early returns
    const { navigateToSong } = usePlaylistNavigation()
    const { combinedPlaylist, totalSongsInQueue, isInitializing, isPreloading } = usePlaylistData()

    // Get user info for avatar (only if username exists)
    const { data: userAnimeData } = useUserAnimeList({
        username,
        enabled: !!username
    })

    // Initialize player if user exists in IndexedDB cache
    const {
        isCheckingUser,
        userExistsInCache,
        isPlayerInitialized,
    } = usePlayerInitialization({
        username,
        autoInitialize: !!username
    })

    // Handlers
    const handleOpenImageModal = (imageUrl: string) => {
        setIsImageModalOpen(true)
        setModalImageUrl(imageUrl)
    }

    const handleCloseImageModal = () => {
        setIsImageModalOpen(false)
        setModalImageUrl('')
    }

    const handleChangeUser = () => {
        navigate({ to: '/' })
    }

    // Check if user parameter exists and redirect if not (unless we have a currentUsername)
    if (!search.user && !currentUsername) {
        navigate({ to: '/' })
        return null
    }

    // Show loading state while checking if user exists in cache
    if (isCheckingUser) {
        return (
            <div className="min-h-[calc(100vh-4.1rem)] bg-gradient-to-br from-primary/15 via-background to-primary/10 dark:from-primary/3 dark:via-background dark:to-primary/5 pb-32">
                <div className="container mx-auto px-4 pt-8 h-full">
                    {/* Mobile Layout Skeleton */}
                    <div className="lg:hidden max-w-2xl mx-auto space-y-4">
                        {/* User Header Skeleton */}
                        <div className="text-center space-y-6 flex sm:flex-col sm:items-center sm:justify-center sm:space-y-4 sm:space-x-0">
                            <div className='w-1/2 sm:w-full'>
                                {/* User Avatar Skeleton */}
                                <div className="relative h-40 w-40 sm:h-40 sm:w-40 xl:w-60 xl:h-60 mx-auto">
                                    <div className="w-full h-full bg-muted rounded-full border-4 border-primary/20 animate-pulse flex items-center justify-center">
                                        <span className="text-4xl font-bold text-primary animate-pulse">
                                            {username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col gap-3 w-1/2 sm:w-full items-center justify-center'>
                                {/* Username */}
                                <h2 className="text-3xl sm:text-4xl font-bold">{username}</h2>
                                {/* Loading text */}
                                <p className="text-md text-muted-foreground animate-pulse">Comprobando el cache...</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout Skeleton */}
                    <div className="hidden lg:flex gap-8">
                        {/* Left Side - User Profile */}
                        <div className="w-1/2 flex flex-col items-center justify-start pt-12 space-y-8">
                            <div className="text-center space-y-6 flex sm:flex-col sm:items-center sm:justify-center sm:space-y-4 sm:space-x-0">
                                <div className='w-1/2 sm:w-full'>
                                    {/* User Avatar Skeleton */}
                                    <div className="relative h-40 w-40 sm:h-40 sm:w-40 xl:w-60 xl:h-60 mx-auto">
                                        <div className="w-full h-full bg-muted rounded-full border-4 border-primary/20 animate-pulse flex items-center justify-center">
                                            <span className="text-6xl font-bold text-primary animate-pulse">
                                                {username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3 w-1/2 sm:w-full items-center justify-center'>
                                    {/* Username */}
                                    <h2 className="text-3xl sm:text-4xl font-bold">{username}</h2>
                                    {/* Loading text */}
                                    <p className="text-md text-muted-foreground animate-pulse">Comprobando cache...</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Empty for now */}
                        <div className="w-1/2">
                            <div className="space-y-4">
                                <div className="text-center space-y-2">
                                    <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto"></div>
                                    <div className="h-4 w-64 bg-muted rounded animate-pulse mx-auto"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show loading skeleton for users found in cache
    if (userExistsInCache && isInitializing && !isPlayerInitialized) {
        return (
            <div className="min-h-[calc(100vh-4.1rem)] bg-gradient-to-br from-primary/15 via-background to-primary/10 dark:from-primary/3 dark:via-background dark:to-primary/5 pb-32">
                <div className="container mx-auto px-4 pt-8 h-full">
                    {/* Mobile Layout Skeleton */}
                    <div className="lg:hidden max-w-2xl mx-auto space-y-4">
                        {/* User Header Skeleton */}
                        <div className="text-center space-y-6 flex sm:flex-col sm:items-center sm:justify-center sm:space-y-4 sm:space-x-0">
                            <div className='w-1/2 sm:w-full'>
                                {/* User Avatar Skeleton */}
                                <div className="relative h-40 w-40 sm:h-40 sm:w-40 xl:w-60 xl:h-60 mx-auto">
                                    <div className="w-full h-full bg-muted rounded-full border-4 border-primary/20 animate-pulse"></div>
                                </div>
                            </div>
                            <div className='flex flex-col gap-3 w-1/2 sm:w-full items-center justify-center'>
                                {/* Username Skeleton */}
                                <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
                                {/* Songs count Skeleton */}
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                                {/* Change User Button Skeleton */}
                                <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Playlist Skeleton - Mobile */}
                        <div className="space-y-2">
                            {/* Header - exactly like VirtualizedPlaylist */}
                            <div className="hidden sm:block text-center space-y-1">
                                <h2 className="text-xl font-bold">Playlist actual</h2>
                                <p className="text-sm text-muted-foreground">Canciones reproducidas recientemente y próximas pistas</p>
                            </div>

                            <div className="h-[calc(100vh-30rem)] sm:h-[calc(100vh-18rem)] overflow-y-auto rounded-lg border bg-card/50 p-2 px-4 scrollbar-custom">
                                <div className="space-y-0">
                                    {/* Loading indicator - exact structure from VirtualizedPlaylist */}
                                    <div className="flex items-center justify-center py-4">
                                        <div className="flex items-center space-x-3 text-sm text-muted-foreground bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </motion.div>
                                            <span>Cargando canciones de la lista de anime de {username}...</span>
                                        </div>
                                    </div>
                                    {[...Array(7)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`
                                                flex items-center gap-4 p-3 rounded-lg transition-all mb-2 relative
                                                ${i === 0
                                                    ? 'bg-primary/15 border-2 border-primary shadow-lg ring-2 ring-primary/20'
                                                    : 'bg-card hover:bg-muted/50 border border-transparent'
                                                }
                                            `}
                                        >
                                            {/* Status Indicator - exact structure */}
                                            <div className="flex-shrink-0 w-4 flex justify-center">
                                                {i === 0 ? (
                                                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg border-2 border-primary/30 relative">
                                                        <div className="absolute inset-0 bg-primary/50 rounded-full animate-ping"></div>
                                                    </div>
                                                ) : (
                                                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
                                                )}
                                            </div>

                                            {/* Album Art - exact structure */}
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-15 bg-muted rounded animate-pulse"></div>
                                            </div>

                                            {/* Song Info - exact structure */}
                                            <div className="flex-1 min-w-0">
                                                <div className={`h-4 bg-muted rounded animate-pulse mb-1 ${i === 0 ? 'w-3/4' : 'w-2/3'}`}></div>
                                                <div className="h-3 bg-muted rounded animate-pulse w-1/2 mb-1"></div>
                                                <div className="h-3 bg-muted rounded animate-pulse w-3/5"></div>
                                            </div>

                                            {/* Song Type and Status - exact structure */}
                                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                                <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                                                {i === 0 && (
                                                    <div className="h-6 w-20 bg-primary/20 rounded animate-pulse"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout Skeleton */}
                    <div className="hidden lg:flex gap-8">
                        {/* Left Side - User Profile Skeleton */}
                        <div className="w-1/2 flex flex-col items-center justify-start pt-12 space-y-8">
                            <div className="text-center space-y-6 flex sm:flex-col sm:items-center sm:justify-center sm:space-y-4 sm:space-x-0">
                                <div className='w-1/2 sm:w-full'>
                                    {/* User Avatar Skeleton */}
                                    <div className="relative h-40 w-40 sm:h-40 sm:w-40 xl:w-60 xl:h-60 mx-auto">
                                        <div className="w-full h-full bg-muted rounded-full border-4 border-primary/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3 w-1/2 sm:w-full items-center justify-center'>
                                    {/* Username Skeleton */}
                                    <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
                                    {/* Songs count Skeleton */}
                                    <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
                                    {/* Change User Button Skeleton */}
                                    <div className="h-12 w-36 bg-muted rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Playlist Skeleton */}
                        <div className="w-1/2">
                            <div className="space-y-2">
                                {/* Header - exactly like VirtualizedPlaylist */}
                                <div className="hidden sm:block text-center space-y-1">
                                    <h2 className="text-xl font-bold">Playlist actual</h2>
                                    <p className="text-sm text-muted-foreground">Canciones reproducidas recientemente y próximas pistas</p>
                                </div>

                                {/* Playlist container - exactly like VirtualizedPlaylist */}
                                <div className="h-[calc(100vh-30rem)] sm:h-[calc(100vh-18rem)] overflow-y-auto rounded-lg border bg-card/50 p-2 px-4 scrollbar-custom">
                                    <div className="space-y-0">
                                        {/* Loading indicator - exact structure from VirtualizedPlaylist */}
                                        <div className="flex items-center justify-center py-4">
                                            <div className="flex items-center space-x-3 text-sm text-muted-foreground bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </motion.div>
                                                <span>Cargando canciones de la lista de anime de {username}...</span>
                                            </div>
                                        </div>
                                        {[...Array(7)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`
                                                    flex items-center gap-4 p-3 rounded-lg transition-all mb-2 relative
                                                    ${i === 0
                                                        ? 'bg-primary/15 border-2 border-primary shadow-lg ring-2 ring-primary/20'
                                                        : 'bg-card hover:bg-muted/50 border border-transparent'
                                                    }
                                                `}
                                            >
                                                {/* Status Indicator - exact structure */}
                                                <div className="flex-shrink-0 w-4 flex justify-center">
                                                    {i === 0 ? (
                                                        <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg border-2 border-primary/30 relative">
                                                            <div className="absolute inset-0 bg-primary/50 rounded-full animate-ping"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
                                                    )}
                                                </div>

                                                {/* Album Art - exact structure */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-15 bg-muted rounded animate-pulse"></div>
                                                </div>

                                                {/* Song Info - exact structure */}
                                                <div className="flex-1 min-w-0">
                                                    <div className={`h-4 bg-muted rounded animate-pulse mb-1 ${i === 0 ? 'w-3/4' : 'w-2/3'}`}></div>
                                                    <div className="h-3 bg-muted rounded animate-pulse w-1/2 mb-1"></div>
                                                    <div className="h-3 bg-muted rounded animate-pulse w-3/5"></div>
                                                </div>

                                                {/* Song Type and Status - exact structure */}
                                                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                                    <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                                                    {i === 0 && (
                                                        <div className="h-6 w-20 bg-primary/20 rounded animate-pulse"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state handling
    if (hasError) {
        return (
            <div className="min-h-[calc(100vh-4.1rem)] bg-gradient-to-br from-primary/15 via-background to-primary/10 dark:from-primary/3 dark:via-background dark:to-primary/5">
                <div className="container mx-auto px-4 py-8 h-full">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                            <div className="w-32 h-32 mx-auto rounded-full bg-muted"></div>
                            <h2 className="text-xl font-semibold">{username}</h2>
                            <Button onClick={handleChangeUser} variant="outline">
                                Change User
                            </Button>
                        </div>
                        <ErrorDisplayCard
                            errorMessage={errorMessage || 'An error occurred'}
                            onRetry={() => window.location.reload()}
                            retryButtonText="Retry"
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4.1rem)] bg-gradient-to-br from-primary/15 via-background to-primary/10 dark:from-primary/3 dark:via-background dark:to-primary/5 pb-32">
            <div className="container mx-auto px-4 pt-8 h-full">
                {/* Mobile Layout */}
                <div className="lg:hidden max-w-2xl mx-auto space-y-4">
                    {/* User Header */}
                    <UserProfileSection
                        username={username}
                        userAnimeData={userAnimeData}
                        onImageClick={handleOpenImageModal}
                        onChangeUser={handleChangeUser}
                        totalSongsInQueue={totalSongsInQueue}
                    />

                    {/* Playlist - Mobile */}
                    <VirtualizedPlaylist
                        combinedPlaylist={combinedPlaylist}
                        currentSong={currentSong}
                        onImageClick={handleOpenImageModal}
                        onSongClick={navigateToSong}
                        onChangeUser={handleChangeUser}
                        isInitializing={isInitializing}
                        isPreloading={isPreloading}
                        username={username}
                    />
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex gap-8">
                    {/* Left Side - User Profile */}
                    <div className="w-1/2 flex flex-col items-center justify-start pt-12 space-y-8">
                        <UserProfileSection
                            username={username}
                            userAnimeData={userAnimeData}
                            onImageClick={handleOpenImageModal}
                            onChangeUser={handleChangeUser}
                            totalSongsInQueue={totalSongsInQueue}
                        />
                    </div>

                    {/* Right Side - Playlist */}
                    <div className="w-1/2">
                        <VirtualizedPlaylist
                            combinedPlaylist={combinedPlaylist}
                            currentSong={currentSong}
                            onImageClick={handleOpenImageModal}
                            onSongClick={navigateToSong}
                            onChangeUser={handleChangeUser}
                            isInitializing={isInitializing}
                            isPreloading={isPreloading}
                            username={username}
                        />
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            <ImageModal
                isOpen={isImageModalOpen}
                imageUrl={modalImageUrl}
                altText="Image"
                onClose={handleCloseImageModal}
            />
        </div>
    )
})

PlaylistPage.displayName = 'PlaylistPage'
