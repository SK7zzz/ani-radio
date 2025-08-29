import { memo, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Search, User, Loader2, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User as AniListUser } from '@/types/anilist'
import { motion, AnimatePresence } from 'framer-motion'

interface UserSearchProps {
    searchQuery: string
    onSearchQueryChange: (query: string) => void
    onSelectUser: (user: AniListUser) => void
    onSelectFirstUser: () => void
    onClear: () => void
    onHideResults: () => void
    searchResults: AniListUser[]
    shouldShowResults: boolean
    isLoading?: boolean
    hasError?: boolean
    errorMessage?: string
    className?: string
}

const UserSearch = memo<UserSearchProps>(({
    searchQuery,
    onSearchQueryChange,
    onSelectUser,
    onSelectFirstUser,
    onClear,
    onHideResults,
    searchResults,
    shouldShowResults,
    isLoading,
    hasError,
    errorMessage,
    className
}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchQueryChange(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (shouldShowResults && searchResults.length > 0) {
                onSelectFirstUser()
            }
        } else if (e.key === 'Escape') {
            onHideResults()
            inputRef.current?.blur()
        }
    }

    const handleClear = () => {
        onClear()
        inputRef.current?.focus()
    }

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onHideResults()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onHideResults])

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar usuario de AniList..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-10"
                    autoComplete="off"
                    spellCheck={false}
                />

                {/* Loading indicator */}
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}

                {/* Clear button */}
                {searchQuery && !isLoading && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Error Message */}
            {hasError && errorMessage && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Dropdown Results */}
            <AnimatePresence>
                {shouldShowResults && searchResults.length > 0 && (
                    <motion.div
                        className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut",
                            type: "spring",
                            stiffness: 300,
                            damping: 25
                        }}
                    >
                        {searchResults.map((user, index) => (
                            <motion.button
                                key={user.id}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors duration-150 text-left border-b border-border last:border-b-0"
                                onClick={() => onSelectUser(user)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.15,
                                    delay: index * 0.05,
                                    ease: "easeOut"
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* User Avatar */}
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage
                                        src={user.avatar?.large || user.avatar?.medium}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="text-sm font-medium bg-primary/80 dark:bg-primary/40 text-primary-foreground dark:text-primary">
                                        {getUserInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-foreground truncate">
                                            {user.name}
                                        </h4>

                                        {/* Donator Badge */}
                                        {user.donatorTier && user.donatorTier > 0 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/80 dark:bg-primary/40 text-primary-foreground dark:text-primary border border-primary/60 dark:border-primary/40">
                                                Donator
                                            </span>
                                        )}
                                    </div>

                                    {/* User Stats */}
                                    {user.statistics?.anime && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {user.statistics.anime.count} anime • {user.statistics.anime.episodesWatched} episodes
                                        </p>
                                    )}
                                </div>

                                {/* Selection Indicator */}
                                <div className="flex items-center text-muted-foreground">
                                    <User className="h-4 w-4" />
                                </div>
                            </motion.button>
                        ))}

                        {/* Help Text */}
                        <motion.div
                            className="px-4 py-2 bg-muted/30 border-t border-border"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <p className="text-xs text-muted-foreground">
                                Enter para seleccionar el primer resultado
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
})

UserSearch.displayName = 'UserSearch'

export { UserSearch } 