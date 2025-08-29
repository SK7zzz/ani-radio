import { memo } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageModalProps {
    isOpen: boolean
    imageUrl: string
    altText?: string
    onClose: () => void
}

export const ImageModal = memo(({
    isOpen,
    imageUrl,
    altText = 'Image Full Size',
    onClose
}: ImageModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pb-24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="relative max-w-4xl max-h-[calc(100vh-8rem)] p-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-background rounded-full shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border"
                            aria-label="Close image modal"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Image */}
                        <motion.img
                            src={imageUrl}
                            alt={altText}
                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
})

ImageModal.displayName = 'ImageModal' 