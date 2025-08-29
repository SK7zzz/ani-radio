import { Github, Menu, X, Home, Music, Info } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <>
            <motion.nav
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
            >
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="flex h-[4rem] items-center justify-between">
                        {/* Logo and Brand */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center cursor-pointer"
                        >
                            <Link to="/" className="relative" onClick={closeMobileMenu}>
                                <img
                                    src="/src/assets/aniradio-logo.png"
                                    alt="AniRadio Logo"
                                    className="w-24 h-24 object-contain"
                                />
                            </Link>
                        </motion.div>

                        {/* Navigation Links - Desktop */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link
                                to="/"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Inicio
                            </Link>
                            <Link
                                to="/playlist"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Playlist
                            </Link>
                            <Link
                                to="/about"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                About
                            </Link>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-2">
                            {/* GitHub Link */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full hover:bg-accent"
                                aria-label="View on GitHub"
                                asChild
                            >
                                <a
                                    href="https://github.com/SK7zzz/ani-radio"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Github className="h-4 w-4" />
                                </a>
                            </Button>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full hover:bg-accent md:hidden"
                                aria-label="Toggle mobile menu"
                                onClick={toggleMobileMenu}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-[4rem] left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b supports-[backdrop-filter]:bg-background/80 md:hidden"
                    >
                        <div className="container mx-auto px-4 py-6">
                            <div className="flex flex-col space-y-2">
                                <Link
                                    to="/"
                                    className="flex items-center space-x-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-accent/50"
                                    onClick={closeMobileMenu}
                                >
                                    <Home className="h-4 w-4" />
                                    <span>Inicio</span>
                                </Link>
                                <Link
                                    to="/playlist"
                                    className="flex items-center space-x-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-accent/50"
                                    onClick={closeMobileMenu}
                                >
                                    <Music className="h-4 w-4" />
                                    <span>Playlist</span>
                                </Link>
                                <Link
                                    to="/about"
                                    className="flex items-center space-x-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-accent/50"
                                    onClick={closeMobileMenu}
                                >
                                    <Info className="h-4 w-4" />
                                    <span>About</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
} 