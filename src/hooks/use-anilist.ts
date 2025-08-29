import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo, useEffect } from 'react'
import * as aniListService from '@/services/anilist-service'
import type {
    UserSearchResponse,
    User
} from '@/types/anilist'

/**
 * Custom hook for managing AniList user search with real-time search and debounce
 */
export const useAniList = () => {
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [debouncedQuery, setDebouncedQuery] = useState<string>('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [searchResults, setSearchResults] = useState<User[]>([])

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim())
        }, 300) // 300ms debounce

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Query for searching users
    const {
        data: searchResponse,
        isLoading: isSearchingUser,
        error: searchUserError,
        refetch: refetchUser,
    } = useQuery({
        queryKey: ['anilist-user-search', debouncedQuery],
        queryFn: async (): Promise<UserSearchResponse> => {
            if (!debouncedQuery) {
                throw new Error('Search query is required')
            }
            return aniListService.searchUser(debouncedQuery)
        },
        enabled: Boolean(debouncedQuery.length >= 2), // Only search if at least 2 characters
        retry: 1,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    })

    // Update search results when query response changes
    useEffect(() => {
        if (searchResponse?.User) {
            // For now, AniList API only returns one user, but we structure it as array for future expansion
            setSearchResults([searchResponse.User])
        } else if (debouncedQuery && !isSearchingUser && searchUserError) {
            setSearchResults([])
        } else if (!debouncedQuery) {
            setSearchResults([])
        }
    }, [searchResponse, debouncedQuery, isSearchingUser, searchUserError])

    // Mutation for clearing all cached data
    const clearCacheMutation = useMutation({
        mutationFn: async () => {
            await queryClient.clear()
        },
        onSuccess: () => {
            setSearchQuery('')
            setDebouncedQuery('')
            setSelectedUser(null)
            setSearchResults([])
        },
    })

    // Callback functions using useCallback for performance
    const handleSearchQueryChange = useCallback((query: string) => {
        setSearchQuery(query)
        // Clear selection when query changes
        if (selectedUser && !query.toLowerCase().includes(selectedUser.name.toLowerCase())) {
            setSelectedUser(null)
        }
    }, [selectedUser])

    const handleSelectUser = useCallback((user: User) => {
        setSelectedUser(user)
        setSearchQuery(user.name) // Update search query to selected user name
        setSearchResults([]) // Hide dropdown after selection
        console.log(`✅ User selected: ${user.name}`)
    }, [])

    const handleSelectFirstUser = useCallback(() => {
        if (searchResults.length > 0) {
            handleSelectUser(searchResults[0])
        }
    }, [searchResults, handleSelectUser])

    const handleClearSearch = useCallback(() => {
        clearCacheMutation.mutate()
    }, [clearCacheMutation])

    const handleHideResults = useCallback(() => {
        setSearchResults([])
    }, [])

    // Computed values
    const hasSearchResults = useMemo(() => searchResults.length > 0, [searchResults])
    const shouldShowResults = useMemo(() =>
        hasSearchResults && searchQuery.length >= 2 && !selectedUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
        , [hasSearchResults, searchQuery, selectedUser])

    // Error handling
    const hasError = Boolean(searchUserError)
    const errorMessage = searchUserError instanceof Error
        ? searchUserError.message
        : 'An unknown error occurred'

    return {
        // State
        selectedUser,
        searchQuery,
        searchResults,
        shouldShowResults,

        // Loading states
        isSearchingUser,

        // Error states
        hasError,
        errorMessage,

        // Actions
        handleSearchQueryChange,
        handleSelectUser,
        handleSelectFirstUser,
        handleClearSearch,
        handleHideResults,

        // Utils
        refetchUser,
        hasSearchResults,
    }
}

