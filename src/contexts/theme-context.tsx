import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeContextType = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeContextType = {
    theme: 'system',
    setTheme: () => null,
}

const ThemeContext = createContext<ThemeContextType>(initialState)

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext)

    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }

    return context
}

export const ThemeProvider = ({
    children,
    defaultTheme = 'system',
    storageKey = 'ani-radio-theme',
    ...props
}: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return defaultTheme;
        try {
            return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
        } catch {
            return defaultTheme;
        }
    })

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove('light', 'dark')

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
                .matches
                ? 'dark'
                : 'light'

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeContext.Provider {...props} value={value}>
            {children}
        </ThemeContext.Provider>
    )
} 