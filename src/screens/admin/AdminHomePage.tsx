/* eslint-disable react-hooks/set-state-in-effect */
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { adminApi, type Persona } from '@/lib/admin-api'
import { CreatePersonaModal } from '@/modules/admin/personas/CreatePersonaModal'
import ui from '@/styles/ui.module.css'

import styles from './admin.module.css'

export default function AdminHomePage() {
  const router = useRouter()
  const { ready, token, user, isAuthenticated, signOut } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [createOpen, setCreateOpen] = useState(false)

  const phone = user?.phoneE164 || ''

  const sorted = useMemo(
    () =>
      [...personas].sort((a, b) => {
        const an = (a.displayName ?? a.slug).toLowerCase()
        const bn = (b.displayName ?? b.slug).toLowerCase()
        return an.localeCompare(bn)
      }),
    [personas],
  )

  const refresh = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    const res = await adminApi.listPersonas(token)
    if (!res.ok) {
      setError(res.error.message)
      setPersonas([])
    } else {
      setPersonas(res.data.personas || [])
    }
    setLoading(false)
  }, [token])

  useEffect(() => {
    if (!ready) return
    if (!isAuthenticated || !token) void router.replace('/login')
  }, [ready, isAuthenticated, token, router])

  useEffect(() => {
    void refresh()
  }, [refresh, token])

  const subtitle = useMemo(() => {
    if (!phone) return 'Signed in'
    return `Signed in as ${phone}`
  }, [phone])

  return (
    <div className={ui.page}>
      <div className={ui.topbar}>
        <div>
          <div className={ui.title}>Personas</div>
          <div className={ui.muted}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" onClick={() => setCreateOpen(true)} disabled={!token}>
            New persona
          </Button>
          <Button
            onClick={async () => {
              await signOut()
              void router.replace('/login')
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <div className={ui.container}>
        <div className={ui.card}>
          <div className={ui.muted} style={{ marginBottom: 10 }}>
            API: {process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8787'}
          </div>

          {!!token && (
            <CreatePersonaModal
              token={token}
              visible={createOpen}
              onClose={() => setCreateOpen(false)}
              onCreated={async ({ versionId }) => {
                await refresh()
                void router.push(`/admin/versions/${versionId}`)
              }}
            />
          )}

          {loading && <div className={ui.muted}>Loading…</div>}
          {!loading && personas.length === 0 && !error && (
            <div className={ui.muted}>No personas yet.</div>
          )}

          {sorted.map((p) => (
            <Link key={p.id} className={styles.row} href={`/admin/personas/${p.id}`}>
              <div style={{ minWidth: 0 }}>
                <div className={styles.rowTitle}>{p.displayName || p.slug}</div>
                <div className={ui.muted}>{p.slug}</div>
              </div>
              <div className={ui.muted}>{p.isSystem ? 'system' : 'custom'}</div>
            </Link>
          ))}

          {!!error && <div className={ui.error}>{error}</div>}
        </div>
      </div>
    </div>
  )
}
