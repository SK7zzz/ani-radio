import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  AniListResponse,
  UserMediaListResponse,
  UserSearchResponse,
  UserMediaListVariables,
  UserSearchVariables
} from '@/types/anilist'
import { MediaType, MediaListStatus } from '@/types/anilist'

const baseURL = 'https://graphql.anilist.co'
let isRateLimited = false
const rateLimitRetryDelay = 60000 // 1 minute

const client: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 30000
})

client.interceptors.request.use(
  async (config) => {
    if (isRateLimited) {
      throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.')
    }
    return config
  },
  (error) => {
    console.error('❌ AniList API Request Error:', error)
    return Promise.reject(error)
  }
)

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('❌ AniList API Response Error:', error)
    if (error.response?.status === 429) {
      console.error('🚨 RATE LIMIT HIT - STOPPING ALL PROCESSES')
      isRateLimited = true
      setTimeout(() => {
        console.log('⏰ Auto-resetting rate limit after 1 minute')
        isRateLimited = false
      }, rateLimitRetryDelay)
      throw new Error(
        'AniList API rate limit exceeded. The system will automatically retry in 1 minute.'
      )
    }
    throw error
  }
)

export function resetRateLimit(): void {
  isRateLimited = false
  console.log('✅ Rate limit flag reset')
}

export function isCurrentlyRateLimited(): boolean {
  return isRateLimited
}

async function executeQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<AniListResponse<T>> {
  try {
    const response: AxiosResponse<AniListResponse<T>> = await client.post('', {
      query,
      variables
    })

    if (response.data.errors && response.data.errors.length > 0) {
      console.error('❌ AniList GraphQL Errors:', response.data.errors)
      throw new Error(response.data.errors[0].message)
    }

    return response.data
  } catch (error) {
    console.error('❌ executeQuery failed:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`AniList API Error: ${error.message}`)
    }
    throw error
  }
}

export async function searchUser(username: string): Promise<UserSearchResponse> {
  const query = `
    query SearchUser($search: String!) {
      User(search: $search) {
        id
        name
        avatar {
          large
          medium
        }
        bannerImage
        about
        options {
          titleLanguage
          displayAdultContent
          profileColor
        }
        mediaListOptions {
          scoreFormat
          rowOrder
        }
      }
    }
  `

  const variables: UserSearchVariables = { search: username }
  const response = await executeQuery<UserSearchResponse>(query, variables)
  return response.data
}

export async function getUserAnimeList(
  username: string,
  status?: MediaListStatus
): Promise<UserMediaListResponse> {
  console.log(`🚀 === FETCHING ANIME LIST FOR USER: ${username} ===`)
  console.log(`📦 Status: ${status || 'ALL'}`)

  const query = `
    query GetUserAnimeList($userName: String!, $type: MediaType!, $status: MediaListStatus) {
      User(name: $userName) {
        id
        name
      }
      MediaListCollection(userName: $userName, type: $type, status: $status) {
        lists {
          name
          status
          entries {
            id
            status
            score
            progress
            media {
              id
              title {
                romaji
                english
                native
                userPreferred
              }
              coverImage {
                extraLarge
                large
                medium
              }
              popularity
              meanScore
              genres
              seasonYear
              season
              format
              startDate {
                year
                month
                day
              }
            }
          }
        }
        user {
          id
          name
        }
      }
    }
  `

  const variables: UserMediaListVariables = {
    userName: username,
    type: MediaType.ANIME,
    status
  }

  try {
    const response = await executeQuery<UserMediaListResponse>(query, variables)

    const totalEntries =
      response.data.MediaListCollection?.lists?.reduce(
        (sum, list) => sum + (list.entries?.length || 0),
        0
      ) || 0

    console.log(`✅ Successfully fetched ${totalEntries} anime entries`)

    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch anime list for ${username}:`, error)
    throw error
  }
}