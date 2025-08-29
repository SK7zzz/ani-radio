import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserSearch } from '@/components/user-search'
import { User } from 'lucide-react'
import { motion } from 'framer-motion'
import type { User as AniListUser } from '@/types/anilist'

interface UserSearchSectionProps {
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
}

export const UserSearchSection = memo(({
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
}: UserSearchSectionProps) => {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="bg-card/70 backdrop-blur-sm border-primary/20 border shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center justify-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>Buscar usuario de AniList</span>
                            </CardTitle>
                            <CardDescription className="text-center">
                                Ingresa un nombre de usuario de AniList para comenzar a descubrir música de su lista de anime
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserSearch
                                searchQuery={searchQuery}
                                onSearchQueryChange={onSearchQueryChange}
                                onSelectUser={onSelectUser}
                                onSelectFirstUser={onSelectFirstUser}
                                onClear={onClear}
                                onHideResults={onHideResults}
                                searchResults={searchResults}
                                shouldShowResults={shouldShowResults}
                                isLoading={isLoading}
                                hasError={hasError}
                                errorMessage={errorMessage}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
})

UserSearchSection.displayName = 'UserSearchSection' 