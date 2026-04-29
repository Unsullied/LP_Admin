/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { logout as apiLogout, me as apiMe } from '@/lib/auth-api'
import { clearSessionToken, getSessionToken, setSessionToken } from '@/lib/session'
import type { AuthUser } from '@/types/auth'
import type { AuthContextValue } from '@/types/auth-context'

type AuthProviderProps = {
  children: React.ReactNode
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [ready, setReady] = useState(() => typeof window !== 'undefined')
  const [token, setToken] = useState<string | null>(() => getSessionToken())
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    // On first client tick, mark ready for any consumers that gated on it.
    if (!ready) setReady(true)
  }, [])

  const refreshMe = useCallback(async () => {
    const t = getSessionToken()
    if (!t) {
      setToken(null)
      setUser(null)
      return
    }
    const res = await apiMe(t)
    if (!res.ok) {
      clearSessionToken()
      setToken(null)
      setUser(null)
      return
    }
    setToken(t)
    setUser(res.data.user)
  }, [])

  useEffect(() => {
    if (!ready) return
    void refreshMe()
  }, [ready])

  const signIn = useCallback(async (nextToken: string) => {
    setSessionToken(nextToken)
    setToken(nextToken)
    setUser(null)
    await refreshMe()
  }, [])

  const signOut = useCallback(async () => {
    const t = getSessionToken()
    if (t) await apiLogout(t)
    clearSessionToken()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      ready,
      token,
      user,
      isAuthenticated: !!token,
      signIn,
      signOut,
      refreshMe,
    }),
    [ready, token, user, signIn, signOut, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
