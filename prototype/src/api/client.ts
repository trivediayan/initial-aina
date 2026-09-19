import { appConfig } from '@/constants/config'
import type { ApiResult, ApiSource, HttpMethod } from '@/types/api.types'

type RequestOptions = {
  source: ApiSource
  path: string
  method?: HttpMethod
  body?: unknown
  signal?: AbortSignal
}

function resolveBaseUrl(source: ApiSource): string {
  return source === 's2' ? appConfig.s2.baseUrl : appConfig.s3.baseUrl
}

export async function apiRequest<T>({
  source,
  path,
  method = 'GET',
  body,
  signal,
}: RequestOptions): Promise<ApiResult<T>> {
  if (appConfig.useMock) {
    return {
      ok: false,
      message: 'Mock mode is on. Services should use mocks instead of the HTTP client.',
      status: 0,
    }
  }

  const baseUrl = resolveBaseUrl(source)
  if (!baseUrl) {
    return {
      ok: false,
      message: `${source.toUpperCase()} API base URL is not configured yet.`,
      status: 0,
    }
  }

  const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`

  try {
    const response = await fetch(url, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (!response.ok) {
      return {
        ok: false,
        message: 'Request failed.',
        status: response.status,
      }
    }

    const data = (await response.json()) as T
    return { ok: true, data }
  } catch {
    return {
      ok: false,
      message: 'Network error.',
      status: 0,
    }
  }
}
