export type ApiSource = 's2' | 's3'

export type ApiResult<T> = {
  data: T
  ok: true
} | {
  ok: false
  message: string
  status: number
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
