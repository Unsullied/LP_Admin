/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import ui from '@/styles/ui.module.css';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { adminApi, type PersonaVersion } from '@/lib/admin-api';
import { parseLines } from '@/modules/admin/versions/helpers';
import { DraftVersionEditor } from '@/modules/admin/versions/DraftVersionEditor';
import { ReadOnlyVersionViewer } from '@/modules/admin/versions/ReadOnlyVersionViewer';

function paramToString(v: string | string[] | undefined): string {
  if (v == null) return '';
  return Array.isArray(v) ? v[0] ?? '' : v;
}

export default function PersonaVersionPage() {
  const router = useRouter();
  const { token } = useAuth();
  const id = paramToString(router.query.versionId as string | string[] | undefined);

  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState<PersonaVersion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatingDraft, setCreatingDraft] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lastAutosaveIso, setLastAutosaveIso] = useState<string | null>(null);
  const [existingDraftId, setExistingDraftId] = useState<string | null>(null);
  const [checkingDraft, setCheckingDraft] = useState(false);

  const [draftLabel, setDraftLabel] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [viewersLabel, setViewersLabel] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [traitsInput, setTraitsInput] = useState('');
  const [boundariesInput, setBoundariesInput] = useState('');

  const canEdit = version?.status === 'draft';

  const computedDefaultLabel = version ? `v${version.version} · ${version.status}` : '';
  const baseLabel = (version?.label ?? computedDefaultLabel) || '';
  const baseDisplayName = version?.displayName ?? '';
  const baseBio = version?.bio ?? '';
  const baseViewersLabel = version?.viewersLabel ?? '';
  const baseIsOnline = version?.isOnline ?? true;
  const baseSystemPrompt = version?.systemPrompt ?? '';
  const baseTraitsText = useMemo(() => (version?.traits ?? []).join('\n'), [version?.traits]);
  const baseBoundariesText = useMemo(() => (version?.hardBoundaries ?? []).join('\n'), [version?.hardBoundaries]);

  const dirty = useMemo(() => {
    if (!canEdit) return false;
    return (
      draftLabel !== baseLabel ||
      displayName !== baseDisplayName ||
      bio !== baseBio ||
      viewersLabel !== baseViewersLabel ||
      isOnline !== baseIsOnline ||
      systemPrompt !== baseSystemPrompt ||
      traitsInput !== baseTraitsText ||
      boundariesInput !== baseBoundariesText
    );
  }, [
    baseBio,
    baseBoundariesText,
    baseDisplayName,
    baseIsOnline,
    baseLabel,
    baseSystemPrompt,
    baseTraitsText,
    baseViewersLabel,
    boundariesInput,
    bio,
    canEdit,
    displayName,
    draftLabel,
    isOnline,
    systemPrompt,
    traitsInput,
    viewersLabel,
  ]);

  const dirtyRef = useRef(dirty);
  const formRef = useRef({
    draftLabel,
    displayName,
    bio,
    viewersLabel,
    isOnline,
    systemPrompt,
    traitsInput,
    boundariesInput,
  });
  useEffect(() => {
    dirtyRef.current = dirty;
    formRef.current = { draftLabel, displayName, bio, viewersLabel, isOnline, systemPrompt, traitsInput, boundariesInput };
  }, [bio, boundariesInput, dirty, displayName, draftLabel, isOnline, systemPrompt, traitsInput, viewersLabel]);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    const res = await adminApi.getPersonaVersion(token, id);
    if (!res.ok) {
      setError(res.error.message);
      setVersion(null);
    } else {
      setVersion(res.data.version);
    }
    setLoading(false);
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!version) return;
    setDraftLabel((version.label ?? computedDefaultLabel) || '');
    setDisplayName(version.displayName ?? '');
    setBio(version.bio ?? '');
    setViewersLabel(version.viewersLabel ?? '');
    setIsOnline(version.isOnline ?? true);
    setSystemPrompt(version.systemPrompt ?? '');
    setTraitsInput((version.traits ?? []).join('\n'));
    setBoundariesInput((version.hardBoundaries ?? []).join('\n'));
    setLastAutosaveIso(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version?.id]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      if (!token || !version?.personaId) return;
      if (version.status === 'draft') {
        setExistingDraftId(version.id);
        return;
      }
      setCheckingDraft(true);
      const res = await adminApi.getPersona(token, version.personaId);
      if (!mounted) return;
      if (!res.ok) {
        setExistingDraftId(null);
        setCheckingDraft(false);
        return;
      }
      const draft = res.data.versions.find((v) => v.status === 'draft') ?? null;
      setExistingDraftId(draft?.id ?? null);
      setCheckingDraft(false);
    })();
    return () => {
      mounted = false;
    };
  }, [token, version?.id, version?.personaId, version?.status]);

  const saveDraft = useCallback(
    async (mode: 'auto' | 'manual') => {
      if (!token || !id || !canEdit) return;
      if (saving) return;

      const current = formRef.current;
      const patch: Partial<PersonaVersion> = {};

      if (current.draftLabel !== baseLabel) patch.label = current.draftLabel;
      if (current.displayName !== baseDisplayName) patch.displayName = current.displayName;
      if (current.bio !== baseBio) patch.bio = current.bio;
      if (current.viewersLabel !== baseViewersLabel) patch.viewersLabel = current.viewersLabel;
      if (current.isOnline !== baseIsOnline) patch.isOnline = current.isOnline;
      if (current.systemPrompt !== baseSystemPrompt) patch.systemPrompt = current.systemPrompt;
      if (current.traitsInput !== baseTraitsText) patch.traits = parseLines(current.traitsInput);
      if (current.boundariesInput !== baseBoundariesText) patch.hardBoundaries = parseLines(current.boundariesInput);

      if (Object.keys(patch).length === 0) return;

      setSaving(true);
      setError(null);
      const res = await adminApi.updatePersonaVersion(token, id, patch);
      if (!res.ok) {
        setError(res.error.message);
      } else {
        setVersion(res.data.version);
        if (mode === 'auto') setLastAutosaveIso(new Date().toISOString());
      }
      setSaving(false);
    },
    [
      baseBoundariesText,
      baseBio,
      baseDisplayName,
      baseIsOnline,
      baseLabel,
      baseSystemPrompt,
      baseTraitsText,
      baseViewersLabel,
      canEdit,
      id,
      saving,
      token,
    ],
  );

  useEffect(() => {
    if (!canEdit || !id) return;
    const handle = setInterval(() => {
      if (!dirtyRef.current) return;
      void saveDraft('auto');
    }, 5000);
    return () => clearInterval(handle);
  }, [canEdit, id, saveDraft]);

  async function publish() {
    if (!token || !id || !canEdit) return;
    setSaving(true);
    setError(null);
    const res = await adminApi.publishPersonaVersion(token, id);
    if (!res.ok) setError(res.error.message);
    else setVersion(res.data.version);
    setSaving(false);
  }

  async function createDraftToEdit() {
    if (!token || !version?.personaId) return;
    if (existingDraftId) {
      void router.replace(`/admin/versions/${existingDraftId}`);
      return;
    }
    setCreatingDraft(true);
    setError(null);
    const res = await adminApi.createDraftVersion(token, version.personaId);
    if (!res.ok) {
      setError(res.error.message);
      setCreatingDraft(false);
      return;
    }
    const newId = res.data.version.id;
    setCreatingDraft(false);
    void router.replace(`/admin/versions/${newId}`);
  }

  function confirmDeleteDraft() {
    if (!id || !version?.personaId || !canEdit) return;
    const ok =
      typeof window !== 'undefined' &&
      window.confirm('Delete this draft?\n\nThis cannot be undone. Published and archived versions are not affected.');
    if (ok) void deleteDraft();
  }

  async function deleteDraft() {
    if (!token || !id || !version?.personaId) return;
    setDeleting(true);
    setError(null);
    const res = await adminApi.deletePersonaVersion(token, id);
    if (!res.ok) {
      setError(res.error.message);
      setDeleting(false);
      return;
    }
    setDeleting(false);
    if (window.history.length > 1) router.back();
    else void router.replace(`/admin/personas/${version.personaId}`);
  }

  const statusTone =
    version?.status === 'draft'
      ? { bg: 'rgba(226,232,240,0.18)', fg: 'rgba(255,255,255,0.92)' }
      : version?.status === 'published'
        ? { bg: '#22C55E', fg: '#070E17' }
        : { bg: 'rgba(100,116,139,0.9)', fg: '#070E17' };

  return (
    <div className={ui.page}>
      <div className={ui.topbar}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => router.back()}>Back</Button>
          {version ? (
            <span className={ui.statusPill} style={{ background: statusTone.bg, color: statusTone.fg }}>
              {version.status.toUpperCase()}
            </span>
          ) : null}
          <div className={ui.muted}>{version ? `v${version.version} · ${version.personaId}` : ''}</div>
        </div>
        <div className={ui.btnRow}>
          {!canEdit && (
            <Button onClick={createDraftToEdit} disabled={creatingDraft || saving || checkingDraft}>
              {checkingDraft ? 'Checking drafts…' : existingDraftId ? 'Open draft' : creatingDraft ? 'Creating draft…' : 'Create draft to edit'}
            </Button>
          )}
        </div>
      </div>

      <div className={ui.container}>
        {loading && <div className={ui.muted}>Loading…</div>}
        {!!error && <div className={ui.error}>{error}</div>}

        {!!version && token && (
          <>
            {canEdit ? (
              <DraftVersionEditor
                token={token}
                version={version}
                dirty={dirty}
                saving={saving}
                deleting={deleting}
                lastAutosaveIso={lastAutosaveIso}
                draftLabel={draftLabel}
                setDraftLabel={setDraftLabel}
                displayName={displayName}
                setDisplayName={setDisplayName}
                bio={bio}
                setBio={setBio}
                viewersLabel={viewersLabel}
                setViewersLabel={setViewersLabel}
                isOnline={isOnline}
                toggleIsOnline={() => setIsOnline((v) => !v)}
                systemPrompt={systemPrompt}
                setSystemPrompt={setSystemPrompt}
                traitsInput={traitsInput}
                setTraitsInput={setTraitsInput}
                boundariesInput={boundariesInput}
                setBoundariesInput={setBoundariesInput}
                onSave={() => void saveDraft('manual')}
                onPublish={() => void publish()}
                onConfirmDelete={confirmDeleteDraft}
                onAvatarSaved={(v) => {
                  setVersion(v);
                  setError(null);
                }}
                onError={setError}
              />
            ) : (
              <ReadOnlyVersionViewer
                version={version}
                existingDraftId={existingDraftId}
                checkingDraft={checkingDraft}
                creatingDraft={creatingDraft}
                onCreateOrOpenDraft={() => void createDraftToEdit()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

