import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { motion } from 'framer-motion'

const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
]

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme()

    const handleToggleTheme = () => {
        const currentIndex = themes.findIndex(t => t.value === theme)
        const nextIndex = (currentIndex + 1) % themes.length
        setTheme(themes[nextIndex].value)
    }

    const currentTheme = themes.find(t => t.value === theme) || themes[0]
    const Icon = currentTheme.icon

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            className="relative h-9 w-9 rounded-full hover:bg-accent transition-colors"
            aria-label={`Switch to next theme (current: ${currentTheme.label})`}
            title={`Current: ${currentTheme.label} • Click to cycle`}
        >
            <motion.div
                key={theme}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Icon className="h-4 w-4" />
            </motion.div>
        </Button>
    )
} 