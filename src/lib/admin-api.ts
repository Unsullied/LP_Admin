import { getApiBase } from './api-base';
import type { ApiResult } from './api-result';

export type Persona = {
  id: string;
  slug: string;
  displayName?: string | null;
  isSystem: boolean;
  visible?: boolean;
  updatedAt: string;
};

export type PersonaVersionStatus = 'draft' | 'published' | 'archived';

export type PersonaVersion = {
  id: string;
  personaId: string;
  version: number;
  status: PersonaVersionStatus;
  label?: string | null;
  displayName?: string | null;
  bio?: string | null;
  viewersLabel?: string | null;
  isOnline?: boolean;
  systemPrompt: string;
  styleTone: string;
  traits: string[];
  hardBoundaries: string[];
  exampleDialogue: Array<{ role: 'user' | 'assistant'; content: string }>;
  createdAt: string;
  avatarUrl?: string | null;
};

export type CreatePersonaInput = {
  displayName: string;
  bio: string;
  viewersLabel: string;
  isOnline: boolean;
  systemPrompt: string;
  styleTone?: string;
  traits: string[];
  hardBoundaries: string[];
  isSystem?: boolean;
  exampleDialogue?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

async function authHeaders(token: string): Promise<Record<string, string>> {
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function getJson<T>(token: string, path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${getApiBase()}${path}`, { headers: await authHeaders(token) });
    const data: unknown = await res.json().catch(() => ({}));
    const msg =
      typeof data === 'object' && data && 'message' in data ? String((data as { message: unknown }).message) : res.statusText;
    if (!res.ok) return { ok: false, error: { message: msg } };
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: { message: e instanceof Error ? e.message : 'Request failed' } };
  }
}

async function sendJson<T>(
  token: string,
  path: string,
  method: 'POST' | 'PATCH',
  body: unknown,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${getApiBase()}${path}`, {
      method,
      headers: { 'content-type': 'application/json', ...(await authHeaders(token)) },
      body: JSON.stringify(body),
    });
    const data: unknown = await res.json().catch(() => ({}));
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText;
    if (!res.ok) return { ok: false, error: { message: msg } };
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: { message: e instanceof Error ? e.message : 'Request failed' } };
  }
}

async function deleteJson<T>(token: string, path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${getApiBase()}${path}`, { method: 'DELETE', headers: await authHeaders(token) });
    const data: unknown = await res.json().catch(() => ({}));
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText;
    if (!res.ok) return { ok: false, error: { message: msg } };
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: { message: e instanceof Error ? e.message : 'Request failed' } };
  }
}

export const adminApi = {
  listPersonas: (token: string) => getJson<{ personas: Persona[] }>(token, '/admin/personas'),
  getPersona: (token: string, personaId: string) =>
    getJson<{ persona: Persona; versions: PersonaVersion[] }>(token, `/admin/personas/${personaId}`),

  createPersona: (token: string, input: CreatePersonaInput) =>
    sendJson<{ persona: Persona; version: PersonaVersion }>(token, '/admin/personas', 'POST', input),

  updatePersonaVisibility: (token: string, personaId: string, visible: boolean) =>
    sendJson<{ persona: Persona }>(token, `/admin/personas/${personaId}`, 'PATCH', { visible }),

  createDraftVersion: (token: string, personaId: string) =>
    sendJson<{ version: PersonaVersion }>(token, `/admin/personas/${personaId}/versions`, 'POST', {}),

  getPersonaVersion: (token: string, versionId: string) =>
    getJson<{ version: PersonaVersion }>(token, `/admin/persona-versions/${versionId}`),

  updatePersonaVersion: (
    token: string,
    versionId: string,
    patch: Partial<Omit<PersonaVersion, 'id' | 'personaId' | 'createdAt'>>,
  ) => sendJson<{ version: PersonaVersion }>(token, `/admin/persona-versions/${versionId}`, 'PATCH', patch),

  uploadPersonaVersionAvatar: (token: string, versionId: string, imageBase64: string) =>
    sendJson<{ version: PersonaVersion; avatarUrl: string }>(token, `/admin/persona-versions/${versionId}/avatar-upload`, 'POST', {
      imageBase64,
    }),

  publishPersonaVersion: (token: string, versionId: string) =>
    sendJson<{ version: PersonaVersion }>(token, `/admin/persona-versions/${versionId}/publish`, 'POST', {}),

  deletePersonaVersion: (token: string, versionId: string) =>
    deleteJson<{ ok: boolean; deletedId: string }>(token, `/admin/persona-versions/${versionId}`),
};

