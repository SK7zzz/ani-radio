import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User } from '@/types/anilist'

interface UserState {
    selectedUser: User | null
    searchQuery: string
    searchResults: User[]
    shouldShowResults: boolean
    isSearchingUser: boolean
    hasError: boolean
    errorMessage: string | null
}

interface UserActions {
    setSelectedUser: (user: User | null) => void
    setSearchQuery: (query: string) => void
    setSearchResults: (results: User[]) => void
    setShouldShowResults: (show: boolean) => void
    setSearchingUser: (isSearching: boolean) => void
    setError: (hasError: boolean, errorMessage?: string) => void
    clearSearch: () => void
    clearUser: () => void
    hideResults: () => void
    selectUser: (user: User) => void
    selectFirstUser: () => boolean
}

type UserStore = UserState & UserActions

const initialState: UserState = {
    selectedUser: null,
    searchQuery: '',
    searchResults: [],
    shouldShowResults: false,
    isSearchingUser: false,
    hasError: false,
    errorMessage: null,
}

export const useUserStore = create<UserStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setSelectedUser: (selectedUser) => set({ selectedUser }),
            setSearchQuery: (searchQuery) => {
                set({ searchQuery })
                // Clear selection when query changes
                const state = get()
                if (state.selectedUser && !searchQuery.toLowerCase().includes(state.selectedUser.name.toLowerCase())) {
                    set({ selectedUser: null })
                }
            },
            setSearchResults: (searchResults) => set({ searchResults }),
            setShouldShowResults: (shouldShowResults) => set({ shouldShowResults }),
            setSearchingUser: (isSearchingUser) => set({ isSearchingUser }),
            setError: (hasError, errorMessage = undefined) => set({ hasError, errorMessage }),

            clearSearch: () => set({
                searchQuery: '',
                searchResults: [],
                selectedUser: null,
                shouldShowResults: false,
                hasError: false,
                errorMessage: null,
            }),

            clearUser: () => set({ selectedUser: null }),

            hideResults: () => set({
                searchResults: [],
                shouldShowResults: false,
            }),

            selectUser: (user) => {
                set({
                    selectedUser: user,
                    searchQuery: user.name,
                    searchResults: [],
                    shouldShowResults: false,
                })
            },

            selectFirstUser: () => {
                const state = get()
                if (state.searchResults.length > 0) {
                    get().selectUser(state.searchResults[0])
                    return true
                }
                return false
            },
        }),
        {
            name: 'user-store',
        }
    )
) 