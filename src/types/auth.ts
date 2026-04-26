export type AuthUser = {
  id: string
  phoneE164: string
  onboardingCompleted: boolean
  isAdmin?: boolean
  firstName?: string | null
  nickname?: string | null
  dob?: string | null
  gender?: string | null
  fantasy?: string | null
  languageIds?: string[]
}
