import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { adminApi, type PersonaVersion } from '@/lib/admin-api'
import ui from '@/styles/ui.module.css'

export function VersionAvatarPanel({
  token,
  version,
  disabled,
  onAvatarSaved,
  onError,
}: {
  token: string
  version: PersonaVersion
  disabled?: boolean
  onAvatarSaved: (v: PersonaVersion) => void
  onError: (msg: string | null) => void
}) {
  const [uploading, setUploading] = useState(false)

  async function onPickFile(file: File | null) {
    if (!file) return
    setUploading(true)
    onError(null)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Failed to read image'))
        reader.onload = () => resolve(String(reader.result || ''))
        reader.readAsDataURL(file)
      })

      const res = await adminApi.uploadPersonaVersionAvatar(token, version.id, dataUrl)
      if (!res.ok) {
        onError(res.error.message)
        return
      }
      onAvatarSaved(res.data.version)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={ui.card}>
      <div className={ui.rowBetween}>
        <div>
          <div style={{ fontWeight: 900 }}>Avatar</div>
          <div className={ui.muted}>Required before publish.</div>
        </div>
      </div>
      <div className={ui.divider} />
      <div className={ui.avatarRow}>
        {version.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={ui.avatarImg} src={version.avatarUrl} alt="avatar" />
        ) : (
          <div className={ui.avatarImg} />
        )}
        <label>
          <input
            type="file"
            accept="image/*"
            disabled={disabled || uploading}
            style={{ display: 'none' }}
            onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
          />
          <Button disabled={disabled || uploading}>
            {uploading ? 'Uploading…' : 'Upload image'}
          </Button>
        </label>
      </div>
    </div>
  )
}
