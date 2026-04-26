import type { AuthUser } from '@/types/auth'

export type AuthContextValue = {
  ready: boolean
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (token: string) => Promise<void>
  signOut: () => Promise<void>
  refreshMe: () => Promise<void>
}
