import { Button } from '@/components/ui/button'
import form from '@/styles/form.module.css'
import ui from '@/styles/ui.module.css'
import type { PersonaVersion } from '@/types/admin'

import { VersionAvatarPanel } from './VersionAvatarPanel'

export const DraftVersionEditor = ({
  token,
  version,
  dirty,
  saving,
  deleting,
  lastAutosaveIso,
  draftLabel,
  setDraftLabel,
  displayName,
  setDisplayName,
  bio,
  setBio,
  viewersLabel,
  setViewersLabel,
  isOnline,
  toggleIsOnline,
  systemPrompt,
  setSystemPrompt,
  traitsInput,
  setTraitsInput,
  boundariesInput,
  setBoundariesInput,
  onSave,
  onPublish,
  onConfirmDelete,
  onAvatarSaved,
  onError,
}: {
  token: string
  version: PersonaVersion
  dirty: boolean
  saving: boolean
  deleting: boolean
  lastAutosaveIso: string | null
  draftLabel: string
  setDraftLabel: (s: string) => void
  displayName: string
  setDisplayName: (s: string) => void
  bio: string
  setBio: (s: string) => void
  viewersLabel: string
  setViewersLabel: (s: string) => void
  isOnline: boolean
  toggleIsOnline: () => void
  systemPrompt: string
  setSystemPrompt: (s: string) => void
  traitsInput: string
  setTraitsInput: (s: string) => void
  boundariesInput: string
  setBoundariesInput: (s: string) => void
  onSave: () => void
  onPublish: () => void
  onConfirmDelete: () => void
  onAvatarSaved: (v: PersonaVersion) => void
  onError: (msg: string | null) => void
}) => {
  return (
    <>
      <div className={ui.card}>
        <div className={ui.rowBetween}>
          <div>
            <div style={{ fontWeight: 900 }}>Draft editor</div>
            <div className={ui.muted}>
              {dirty ? 'Unsaved changes' : 'Up to date'}
              {lastAutosaveIso
                ? ` · autosaved ${new Date(lastAutosaveIso).toLocaleTimeString()}`
                : ''}
            </div>
          </div>
          <div className={ui.btnRow}>
            <Button onClick={onSave} disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="primary" onClick={onPublish} disabled={saving || deleting}>
              Publish
            </Button>
            <Button onClick={onConfirmDelete} disabled={saving || deleting}>
              {deleting ? 'Deleting…' : 'Delete draft'}
            </Button>
          </div>
        </div>
      </div>

      <VersionAvatarPanel
        token={token}
        version={version}
        disabled={saving || deleting}
        onAvatarSaved={onAvatarSaved}
        onError={onError}
      />

      <div className={ui.card}>
        <div className={ui.grid2}>
          <input
            className={form.control}
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Draft label (optional)"
            onBlur={onSave}
          />
          <div className={ui.btnRow} style={{ justifyContent: 'flex-end' }}>
            <Button onClick={toggleIsOnline}>{isOnline ? 'Online: yes' : 'Online: no'}</Button>
          </div>
        </div>

        <div className={ui.divider} />

        <input
          className={form.control}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          onBlur={onSave}
        />
        <input
          className={form.control}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          onBlur={onSave}
        />
        <input
          className={form.control}
          value={viewersLabel}
          onChange={(e) => setViewersLabel(e.target.value)}
          placeholder="Viewers label"
          onBlur={onSave}
        />

        <div className={ui.divider} />

        <textarea
          className={[form.control, form.textareaLg].join(' ')}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="System prompt"
          onBlur={onSave}
        />
        <textarea
          className={[form.control, form.textarea].join(' ')}
          value={traitsInput}
          onChange={(e) => setTraitsInput(e.target.value)}
          placeholder="Traits (one per line)"
          onBlur={onSave}
        />
        <textarea
          className={[form.control, form.textarea].join(' ')}
          value={boundariesInput}
          onChange={(e) => setBoundariesInput(e.target.value)}
          placeholder="Hard boundaries (one per line)"
          onBlur={onSave}
        />
      </div>
    </>
  )
}
