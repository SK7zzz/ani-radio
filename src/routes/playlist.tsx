import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PlaylistPage } from '@/components/playlist-page'

const playlistSearchSchema = z.object({
    user: z.string().min(1).catch(''),
})

export const Route = createFileRoute('/playlist')({
    validateSearch: playlistSearchSchema,
    component: PlaylistPage,
}) 