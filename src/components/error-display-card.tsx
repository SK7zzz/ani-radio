import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface ErrorDisplayCardProps {
    errorMessage?: string
    onRetry?: () => void
    retryButtonText?: string
}

export const ErrorDisplayCard = memo(({
    errorMessage = 'An error occurred with the music queue',
    onRetry,
    retryButtonText = 'Try Another User'
}: ErrorDisplayCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 shadow-lg">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{errorMessage}</span>
                        </div>
                        {onRetry && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRetry}
                                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                            >
                                {retryButtonText}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
})

ErrorDisplayCard.displayName = 'ErrorDisplayCard' 