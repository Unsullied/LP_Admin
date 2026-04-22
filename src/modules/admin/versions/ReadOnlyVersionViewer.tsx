import ui from '@/styles/ui.module.css';
import { Button } from '@/components/ui/button';
import type { PersonaVersion } from '@/lib/admin-api';

function toMultiline(items: string[] | null | undefined): string {
  return (items ?? []).map((s) => String(s ?? '').trim()).filter(Boolean).join('\n');
}

export function ReadOnlyVersionViewer({
  version,
  existingDraftId,
  checkingDraft,
  creatingDraft,
  onCreateOrOpenDraft,
}: {
  version: PersonaVersion;
  existingDraftId: string | null;
  checkingDraft: boolean;
  creatingDraft: boolean;
  onCreateOrOpenDraft: () => void;
}) {
  const hint =
    version.status === 'published'
      ? 'Published versions are read-only. Create a draft to edit, then publish when ready.'
      : version.status === 'archived'
        ? 'Archived versions are read-only. Create a new draft to continue editing.'
        : null;

  return (
    <>
      {!!hint && (
        <div className={ui.card}>
          <div className={ui.rowBetween}>
            <div className={ui.muted}>{hint}</div>
            <Button onClick={onCreateOrOpenDraft} disabled={checkingDraft || creatingDraft}>
              {checkingDraft
                ? 'Checking drafts…'
                : existingDraftId
                  ? 'Open draft'
                  : creatingDraft
                    ? 'Creating draft…'
                    : 'Create draft to edit'}
            </Button>
          </div>
        </div>
      )}

      <div className={ui.card}>
        <div className={ui.rowBetween}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>
              {version.displayName ?? `v${version.version}`}
            </div>
            <div className={ui.muted}>
              {version.label ? `${version.label} · ` : ''}
              v{version.version} · status: {version.status} · personaId: {version.personaId}
            </div>
          </div>
          <span
            className={ui.statusPill}
            style={{
              background:
                version.status === 'published'
                  ? 'rgba(73, 255, 167, 0.22)'
                  : version.status === 'archived'
                    ? 'rgba(148, 163, 184, 0.18)'
                    : 'rgba(226, 232, 240, 0.18)',
              color: version.status === 'published' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.92)',
            }}
          >
            {version.status.toUpperCase()}
          </span>
        </div>

        {(version.avatarUrl || version.viewersLabel || version.bio) && <div className={ui.divider} />}

        {version.avatarUrl ? (
          <div className={ui.avatarRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={ui.avatarImg} src={version.avatarUrl} alt="avatar" />
            <div className={ui.muted}>Avatar</div>
          </div>
        ) : null}

        <div className={ui.grid2} style={{ marginTop: 10 }}>
          <div>
            <div className={ui.muted}>Viewers label</div>
            <div>{version.viewersLabel ?? '—'}</div>
          </div>
          <div>
            <div className={ui.muted}>Online</div>
            <div>{version.isOnline ? 'yes' : 'no'}</div>
          </div>
        </div>

        {version.bio ? (
          <div style={{ marginTop: 10 }}>
            <div className={ui.muted} style={{ marginBottom: 6 }}>
              Bio
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{version.bio}</div>
          </div>
        ) : null}

        <div className={ui.divider} />
        <div className={ui.muted} style={{ marginBottom: 6 }}>
          System prompt
        </div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{version.systemPrompt}</div>

        <div className={ui.divider} />
        <div className={ui.grid2}>
          <div>
            <div className={ui.muted} style={{ marginBottom: 6 }}>
              Style tone
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{version.styleTone || '—'}</div>
          </div>
          <div>
            <div className={ui.muted} style={{ marginBottom: 6 }}>
              Traits
            </div>
            <div className={ui.muted} style={{ whiteSpace: 'pre-wrap' }}>
              {toMultiline(version.traits) || '—'}
            </div>
          </div>
        </div>

        <div className={ui.divider} />
        <div className={ui.muted} style={{ marginBottom: 6 }}>
          Hard boundaries
        </div>
        <div className={ui.muted} style={{ whiteSpace: 'pre-wrap' }}>
          {toMultiline(version.hardBoundaries) || '—'}
        </div>
{/* 
        {version.exampleDialogue?.length ? (
          <>
            <div className={ui.divider} />
            <div className={ui.muted} style={{ marginBottom: 6 }}>
              Example dialogue
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {version.exampleDialogue.map((t, idx) => (
                <div key={idx}>
                  <div className={ui.muted} style={{ marginBottom: 4 }}>
                    {(t.role ?? '').toUpperCase()}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{t.content}</div>
                </div>
              ))}
            </div>
          </>
        ) : null} */}
      </div>
    </>
  );
}

