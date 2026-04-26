import type { AuthUser as AuthedUser } from '@/types/auth'

import { getApiBase } from './api-base'
import type { ApiResult } from './api-result'

export async function requestOtp(
  phone: string,
): Promise<ApiResult<{ phoneE164: string; message: string }>> {
  try {
    const res = await fetch(`${getApiBase()}/auth/otp/request`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data: unknown = await res.json().catch(() => ({}))
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText
    if (!res.ok) return { ok: false, error: { message: msg } }
    const phoneE164 =
      typeof data === 'object' && data && 'phoneE164' in data
        ? String((data as { phoneE164: unknown }).phoneE164)
        : ''
    return { ok: true, data: { phoneE164, message: msg } }
  } catch (e) {
    return { ok: false, error: { message: e instanceof Error ? e.message : 'Request failed' } }
  }
}

export async function verifyOtp(params: {
  phone: string
  code: string
}): Promise<ApiResult<{ token: string; user: AuthedUser }>> {
  try {
    const res = await fetch(`${getApiBase()}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: params.phone, code: params.code }),
    })
    const data: unknown = await res.json().catch(() => ({}))
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText
    if (!res.ok) return { ok: false, error: { message: msg } }
    const token =
      typeof data === 'object' && data && 'token' in data
        ? String((data as { token: unknown }).token)
        : ''
    const u =
      typeof data === 'object' && data && 'user' in data ? (data as { user: unknown }).user : null
    const userObj = typeof u === 'object' && u ? (u as Record<string, unknown>) : {}
    return {
      ok: true,
      data: {
        token,
        user: {
          id: String(userObj.id || ''),
          phoneE164: String(userObj.phoneE164 || ''),
          onboardingCompleted: !!userObj.onboardingCompleted,
          isAdmin: !!userObj.isAdmin,
          firstName: userObj.firstName != null ? String(userObj.firstName) : null,
          nickname: userObj.nickname != null ? String(userObj.nickname) : null,
          dob: userObj.dob != null ? String(userObj.dob) : null,
          gender: userObj.gender != null ? String(userObj.gender) : null,
          fantasy: userObj.fantasy != null ? String(userObj.fantasy) : null,
          languageIds: Array.isArray(userObj.languageIds)
            ? userObj.languageIds.map((x) => String(x)).filter(Boolean)
            : [],
        },
      },
    }
  } catch (e) {
    return { ok: false, error: { message: e instanceof Error ? e.message : 'Request failed' } }
  }
}

export async function me(token: string): Promise<ApiResult<{ user: AuthedUser }>> {
  try {
    const res = await fetch(`${getApiBase()}/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
    })
    const data: unknown = await res.json().catch(() => ({}))
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText
    if (!res.ok) return { ok: false, error: { message: msg } }
    const u =
      typeof data === 'object' && data && 'user' in data ? (data as { user: unknown }).user : null
    const userObj = typeof u === 'object' && u ? (u as Record<string, unknown>) : {}
    return {
      ok: true,
      data: {
        user: {
          id: String(userObj.id || ''),
          phoneE164: String(userObj.phoneE164 || ''),
          onboardingCompleted: !!userObj.onboardingCompleted,
          isAdmin: !!userObj.isAdmin,
          firstName: userObj.firstName != null ? String(userObj.firstName) : null,
          nickname: userObj.nickname != null ? String(userObj.nickname) : null,
          dob: userObj.dob != null ? String(userObj.dob) : null,
          gender: userObj.gender != null ? String(userObj.gender) : null,
          fantasy: userObj.fantasy != null ? String(userObj.fantasy) : null,
          languageIds: Array.isArray(userObj.languageIds)
            ? userObj.languageIds.map((x) => String(x)).filter(Boolean)
            : [],
        },
      },
    }
  } catch (e) {
    return { ok: false, error: { message: e instanceof Error ? e.message : 'Request failed' } }
  }
}

export async function logout(token: string): Promise<void> {
  try {
    await fetch(`${getApiBase()}/auth/logout`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    })
  } catch {
    // ignore
  }
}
