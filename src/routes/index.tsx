import { createFileRoute } from '@tanstack/react-router'
import { UserSearchSection } from '@/components/user-search-section'
import { useAniListSearch } from '@/hooks/use-anilist-search'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const {
    // State
    searchQuery,
    searchResults,
    shouldShowResults,

    // Actions
    handleSearchQueryChange,
    handleSelectUser,
    handleSelectFirstUser,
    handleClearSearch,
    handleHideResults,

    // Loading states
    isSearchingUser,
    hasError,
    errorMessage,
  } = useAniListSearch()

  return (
    <div className="min-h-[calc(100vh-4.1rem)] bg-gradient-to-br from-primary/15 via-background to-primary/10 dark:from-primary/3 dark:via-background dark:to-primary/5">
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* User Search Section - Always centered since we removed the selected user content */}
        <UserSearchSection
          searchQuery={searchQuery}
          onSearchQueryChange={handleSearchQueryChange}
          onSelectUser={handleSelectUser}
          onSelectFirstUser={handleSelectFirstUser}
          onClear={handleClearSearch}
          onHideResults={handleHideResults}
          searchResults={searchResults}
          shouldShowResults={shouldShowResults}
          isLoading={isSearchingUser}
          hasError={hasError}
          errorMessage={errorMessage || undefined}
        />

        {/* Compatibility Notice */}
        <div className="mt-6 max-w-2xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Compatibilidad con plataformas
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  Actualmente solo tenemos compatibilidad con <strong>AniList</strong>. Estamos trabajando para
                  implementar soporte para <strong>MyAnimeList</strong> próximamente.
                </p>
                <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  Mientras tanto, puedes migrar tu lista de MyAnimeList a AniList siguiendo{' '}
                  <a
                    href="https://edimakor.hitpaw.com/video-editing-footage/how-to-import-anime-list-to-other-websites.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600 dark:hover:text-blue-200 font-medium"
                  >
                    este tutorial
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
