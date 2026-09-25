import { appConfig } from '@/constants/config'
import type { ApiResult, ApiSource, HttpMethod } from '@/types/api.types'

type RequestOptions = {
  source?: ApiSource
  path: string
  method?: HttpMethod
  body?: unknown
  signal?: AbortSignal
}

function resolveBaseUrl(source: ApiSource = 'api'): string {
  if (source === 's2') return appConfig.s2.baseUrl || appConfig.api.baseUrl
  if (source === 's3') return appConfig.s3.baseUrl || appConfig.api.baseUrl
  return appConfig.api.baseUrl || appConfig.s3.baseUrl || appConfig.s2.baseUrl
}

export async function apiRequest<T>({
  source = 'api',
  path,
  method = 'GET',
  body,
  signal,
}: RequestOptions): Promise<ApiResult<T>> {
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
        message: `Request failed with status ${response.status}.`,
        status: response.status,
      }
    }

    const data = (await response.json()) as T
    return { ok: true, data }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Network error.',
      status: 0,
    }
  }
}
