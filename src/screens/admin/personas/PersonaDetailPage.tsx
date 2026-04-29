/* eslint-disable react-hooks/set-state-in-effect */
import Link from 'next/link'
import { useRouter } from 'next/router'
import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { useAuth } from '@/contexts/auth-context'
import { adminApi } from '@/lib/admin-api'
import ui from '@/styles/ui.module.css'
import { Persona, PersonaVersion } from '@/types/admin'

import styles from './persona-detail.module.css'

const ribbonClass = (status: PersonaVersion['status']) => {
  if (status === 'draft') return [styles.ribbon, styles.ribbonDraft].join(' ')
  if (status === 'published') return [styles.ribbon, styles.ribbonPublished].join(' ')
  return [styles.ribbon, styles.ribbonArchived].join(' ')
}

const pickLatest = (versions: PersonaVersion[]) => {
  const sorted = [...versions].sort((a, b) => b.version - a.version)
  const published = sorted.find((v) => v.status === 'published') ?? null
  const draft = sorted.find((v) => v.status === 'draft') ?? null
  return { sorted, published, draft }
}

const PersonaDetailPage: React.FC = () => {
  const router = useRouter()
  const { token } = useAuth()
  const personaId = typeof router.query.id === 'string' ? router.query.id : ''

  const [loading, setLoading] = useState(true)
  const [persona, setPersona] = useState<Persona | null>(null)
  const [versions, setVersions] = useState<PersonaVersion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [togglingVisible, setTogglingVisible] = useState(false)

  const meta = useMemo(() => pickLatest(versions), [versions])

  const refresh = useCallback(async () => {
    if (!token || !personaId) return
    setLoading(true)
    setError(null)
    const res = await adminApi.getPersona(token, personaId)
    if (!res.ok) {
      setError(res.error.message)
      setPersona(null)
      setVersions([])
    } else {
      setPersona(res.data.persona)
      setVersions(res.data.versions)
    }
    setLoading(false)
  }, [personaId, token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createDraft = async () => {
    if (!token || !personaId) return
    const res = await adminApi.createDraftVersion(token, personaId)
    if (!res.ok) {
      setError(res.error.message)
      return
    }
    await refresh()
  }

  const toggleVisible = async () => {
    if (!token || !personaId || !persona) return
    if (togglingVisible) return
    setError(null)
    setTogglingVisible(true)
    const next = !(persona.visible ?? true)
    const res = await adminApi.updatePersonaVisibility(token, personaId, next)
    setTogglingVisible(false)
    if (!res.ok) {
      setError(res.error.message)
      return
    }
    setPersona((p) => (p ? { ...p, visible: res.data.persona.visible } : p))
  }

  return (
    <div className={ui.page}>
      <div className={ui.topbar}>
        <div>
          <div className={ui.title}>{persona?.displayName ?? persona?.slug ?? 'Persona'}</div>
          <div className={ui.muted}>slug: {persona?.slug ?? '—'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button onClick={() => router.push('/admin')}>Back</Button>
          {meta.draft ? (
            <Button
              variant="primary"
              onClick={() => router.push(`/admin/versions/${meta.draft!.id}`)}
            >
              Open draft
            </Button>
          ) : (
            <Button variant="primary" onClick={createDraft} disabled={!token || !personaId}>
              New draft
            </Button>
          )}
        </div>
      </div>

      <div className={ui.container}>
        {loading && <div className={ui.muted}>Loading…</div>}
        {!!error && <div className={ui.error}>{error}</div>}

        {!!persona && (
          <>
            <div className={ui.card}>
              <div className={ui.rowBetween}>
                <div>
                  <div style={{ fontWeight: 800 }}>Visibility</div>
                  <div className={ui.muted}>
                    If hidden, this persona won’t be returned by the chat personas API and won’t
                    show up in the client.
                  </div>
                </div>
                <Toggle
                  label={(persona.visible ?? true) ? 'Visible' : 'Hidden'}
                  checked={persona.visible ?? true}
                  disabled={togglingVisible}
                  onChange={() => void toggleVisible()}
                />
              </div>
            </div>

            <div className={ui.rowBetween}>
              <div style={{ fontWeight: 900 }}>Versions</div>
            </div>

            <div className={styles.versions}>
              {meta.sorted.map((v) => (
                <Link key={v.id} className={styles.versionCard} href={`/admin/versions/${v.id}`}>
                  <div className={ribbonClass(v.status)}>
                    {v.status === 'draft'
                      ? 'DRAFT'
                      : v.status === 'published'
                        ? 'PUBLISHED'
                        : 'ARCHIVED'}
                  </div>
                  <div className={styles.versionTitle}>
                    {v.status === 'draft' && v.label ? v.label : `v${v.version} · ${v.status}`}
                  </div>
                  <div className={styles.promptPreview}>{v.systemPrompt}</div>
                </Link>
              ))}
            </div>

            <div className={ui.card}>
              <div className={ui.rowBetween}>
                <div>
                  <div style={{ fontWeight: 900 }}>Metrics</div>
                  <div className={ui.muted}>Coming next (after core CRUD parity).</div>
                </div>
                <Button disabled>View metrics</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PersonaDetailPage
