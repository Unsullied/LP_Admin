import { useMemo, useState } from 'react';

import styles from './create-persona-modal.module.css';
import form from '@/styles/form.module.css';
import ui from '@/styles/ui.module.css';
import { Button } from '@/components/ui/button';
import { adminApi, type CreatePersonaInput } from '@/lib/admin-api';

function parseLines(s: string): string[] {
  return s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

export type CreatePersonaModalProps = {
  token: string;
  visible: boolean;
  onClose: () => void;
  onCreated: (args: { versionId: string }) => void;
};

export function CreatePersonaModal({ token, visible, onClose, onCreated }: CreatePersonaModalProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [viewersLabel, setViewersLabel] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [traitsInput, setTraitsInput] = useState('');
  const [boundariesInput, setBoundariesInput] = useState('');

  const canSubmit = useMemo(() => {
    const input: CreatePersonaInput = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      viewersLabel: viewersLabel.trim(),
      isOnline,
      systemPrompt: systemPrompt.trim(),
      traits: parseLines(traitsInput),
      hardBoundaries: parseLines(boundariesInput),
    };
    return (
      !!input.displayName &&
      !!input.bio &&
      !!input.viewersLabel &&
      !!input.systemPrompt &&
      input.traits.length > 0 &&
      input.hardBoundaries.length > 0
    );
  }, [bio, boundariesInput, displayName, isOnline, systemPrompt, traitsInput, viewersLabel]);

  async function createPersona() {
    if (creating) return;
    setError(null);

    const input: CreatePersonaInput = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      viewersLabel: viewersLabel.trim(),
      isOnline,
      systemPrompt: systemPrompt.trim(),
      traits: parseLines(traitsInput),
      hardBoundaries: parseLines(boundariesInput),
    };

    if (!canSubmit) {
      setError('Please fill all fields (name, bio, viewers label, system prompt, traits, hard boundaries).');
      return;
    }

    setCreating(true);
    const res = await adminApi.createPersona(token, input);
    if (!res.ok) {
      setError(res.error.message);
      setCreating(false);
      return;
    }

    const versionId = res.data.version.id;
    setCreating(false);

    // Reset after success.
    setDisplayName('');
    setBio('');
    setViewersLabel('');
    setIsOnline(true);
    setSystemPrompt('');
    setTraitsInput('');
    setBoundariesInput('');
    setError(null);

    onClose();
    onCreated({ versionId });
  }

  if (!visible) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Create persona (v1 draft)</div>
            <div className={styles.hint}>All fields required. After creation, edit/publish from the draft version page.</div>
          </div>
          <Button onClick={onClose} disabled={creating}>
            Close
          </Button>
        </div>

        <div className={styles.body}>
          {!!error && <div className={ui.error}>{error}</div>}

          <input
            className={form.control}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name (unique)"
          />
          <input className={form.control} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
          <input
            className={form.control}
            value={viewersLabel}
            onChange={(e) => setViewersLabel(e.target.value)}
            placeholder="Viewers label (e.g. AI)"
          />

          <div className={styles.row}>
            <div className={ui.btnRow}>
              <Button onClick={() => setIsOnline((v) => !v)} disabled={creating}>
                {isOnline ? 'Online: yes' : 'Online: no'}
              </Button>
              <Button variant="primary" onClick={createPersona} disabled={creating || !canSubmit}>
                {creating ? 'Creating…' : 'Create persona'}
              </Button>
            </div>
            <div className={ui.muted}>Name must be unique.</div>
          </div>

          <textarea
            className={[form.control, form.textareaLg].join(' ')}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="System prompt"
          />
          <textarea
            className={[form.control, form.textarea].join(' ')}
            value={traitsInput}
            onChange={(e) => setTraitsInput(e.target.value)}
            placeholder="Traits (one per line)"
          />
          <textarea
            className={[form.control, form.textarea].join(' ')}
            value={boundariesInput}
            onChange={(e) => setBoundariesInput(e.target.value)}
            placeholder="Hard boundaries (one per line)"
          />
        </div>
      </div>
    </div>
  );
}

