import { memo } from 'react'
import { Button } from '@/components/ui/button'
import type { UserAnimeListData } from '@/hooks/use-user-anime-list'

interface UserProfileSectionProps {
    username: string
    userAnimeData?: UserAnimeListData
    onImageClick: (imageUrl: string) => void
    onChangeUser: () => void
    totalSongsInQueue?: number
}

export const UserProfileSection = memo(({
    username,
    userAnimeData,
    onImageClick,
    onChangeUser,
    totalSongsInQueue = 0
}: UserProfileSectionProps) => {
    return (
        <div className="text-center space-y-6 flex sm:flex-col sm:items-center sm:justify-center sm:space-y-4 sm:space-x-0">
            <div className='w-1/2 sm:w-full'>
                {/* User Avatar */}
                <div className="relative  h-40 w-40 sm:h-40 sm:w-40 xl:w-60 xl:h-60 mx-auto">
                    {userAnimeData?.user?.avatar?.large ? (
                        <img
                            src={userAnimeData.user.avatar.large}
                            alt={userAnimeData.user.name}
                            className="w-full h-full object-cover rounded-full border-4 border-primary shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onImageClick(userAnimeData.user.avatar?.large || '')}
                        />
                    ) : (
                        <div className="w-full h-full bg-primary/20 rounded-full border-4 border-primary flex items-center justify-center">
                            <span className="text-5xl font-bold text-primary">
                                {username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className='flex flex-col gap-3 w-1/2 sm:w-full items-center justify-center'>
                {/* Username */}
                <h1 className="text-3xl sm:text-4xl font-bold">{userAnimeData?.user?.name || username}</h1>

                {/* Songs in Queue Count */}
                {totalSongsInQueue > 0 && (
                    <p className="text-md text-muted-foreground">
                        {totalSongsInQueue} canciones en cola
                    </p>
                )}

                {/* Change User Button */}
                <Button
                    onClick={onChangeUser}
                    variant="outline-themed"
                    className='w-full hover:shadow-md'
                >
                    Cambiar usuario
                </Button>
            </div>
        </div>
    )
})

UserProfileSection.displayName = 'UserProfileSection'
