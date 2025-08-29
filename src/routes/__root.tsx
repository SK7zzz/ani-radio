import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ThemeProvider } from '@/contexts/theme-context'
import { Navbar } from '@/components/navbar'
import { GlobalMusicPlayer } from '@/components/global-music-player'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="ani-radio-theme">
      <div className="bg-background text-foreground">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <GlobalMusicPlayer />
      </div>
    </ThemeProvider>
  ),
})
