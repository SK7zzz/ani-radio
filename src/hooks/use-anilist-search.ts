import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useUserStore } from '@/lib/stores/user-store'
import { usePlayerStore } from '@/lib/stores/player-store'
import * as aniListService from '@/services/anilist-service'
import type { UserSearchResponse, User } from '@/types/anilist'

/**
 * Custom hook that integrates TanStack Query with Zustand for AniList user search
 * Handles navigation to /playlist when user is selected
 */
export const useAniListSearch = () => {
    const navigate = useNavigate()
    const [debouncedQuery, setDebouncedQuery] = useState<string>('')

    // Zustand store actions and state
    const {
        // State
        selectedUser,
        searchQuery,
        searchResults,
        shouldShowResults,
        isSearchingUser,
        hasError,
        errorMessage,

        // Actions
        setSearchQuery,
        setSearchResults,
        setShouldShowResults,
        setSearchingUser,
        setError,
        clearSearch,
        clearUser,
        hideResults,
        selectUser,
        selectFirstUser,
    } = useUserStore()

    // Player store for initializing music queue
    const { setCurrentUser, clearQueue } = usePlayerStore()

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
            setSearchingUser(false)
            setError(false)
        } else if (debouncedQuery && searchUserError) {
            setSearchResults([])
            setSearchingUser(false)
            setError(true, searchUserError instanceof Error ? searchUserError.message : 'Search failed')
        } else if (!debouncedQuery) {
            setSearchResults([])
            setSearchingUser(false)
            setError(false)
        }
    }, [searchResponse, debouncedQuery, searchUserError, setSearchResults, setSearchingUser, setError])

    // Update searching state
    useEffect(() => {
        setSearchingUser(Boolean(debouncedQuery.length >= 2))
    }, [debouncedQuery, setSearchingUser])

    // Compute shouldShowResults
    useEffect(() => {
        const hasSearchResults = searchResults.length > 0
        const show = hasSearchResults &&
            searchQuery.length >= 2 &&
            !selectedUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
        setShouldShowResults(show)
    }, [searchResults, searchQuery, selectedUser, setShouldShowResults])

    // Callback functions using useCallback for performance
    const handleSearchQueryChange = useCallback((query: string) => {
        setSearchQuery(query)
    }, [setSearchQuery])

    const handleSelectUser = useCallback((user: User) => {
        selectUser(user)
        console.log(`✅ User selected: ${user.name}`)

        // Initialize music player with selected user
        setCurrentUser(user.name)
        clearQueue() // Clear any existing queue

        console.log(`🎵 Initializing music player for user: ${user.name}`)

        // Navigate to playlist route with user parameter
        navigate({
            to: '/playlist',
            search: { user: user.name },
        })
    }, [selectUser, navigate, setCurrentUser, clearQueue])

    const handleSelectFirstUser = useCallback(() => {
        if (selectFirstUser()) {
            const firstUser = searchResults[0]
            if (firstUser) {
                console.log(`✅ First user selected: ${firstUser.name}`)

                // Initialize music player with selected user
                setCurrentUser(firstUser.name)
                clearQueue() // Clear any existing queue

                console.log(`🎵 Initializing music player for user: ${firstUser.name}`)

                // Navigate to playlist route with user parameter
                navigate({
                    to: '/playlist',
                    search: { user: firstUser.name },
                })
            }
        }
    }, [selectFirstUser, searchResults, navigate, setCurrentUser, clearQueue])

    const handleClearSearch = useCallback(() => {
        clearSearch()

        // Navigate back to home
        navigate({ to: '/' })
    }, [clearSearch, navigate])

    const handleHideResults = useCallback(() => {
        hideResults()
    }, [hideResults])

    // Computed values
    const hasSearchResults = useMemo(() => searchResults.length > 0, [searchResults])

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
        clearUser,
    }
}