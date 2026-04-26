export type ApiErrorShape = { message: string; code?: string }
export type ApiSuccess<T> = { ok: true; data: T }
export type ApiError = { ok: false; error: ApiErrorShape }
export type ApiResult<T> = ApiSuccess<T> | ApiError
