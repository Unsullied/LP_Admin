const KEY = 'lp.sessionToken'

export const getSessionToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export const setSessionToken = (token: string): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, token)
  } catch {}
}

export const clearSessionToken = (): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {}
}
