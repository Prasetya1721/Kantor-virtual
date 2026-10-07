import { LOCKED_EVENT } from './access.ts'

export type RequestState<T> =
  | { status: 'pending' }
  | { status: 'ready'; data: T; stale?: boolean }
  | { status: 'failed'; httpStatus?: number; message?: string }

/** Explains a failed request in terms the operator can act on. */
export function describeFailure(httpStatus: number | undefined, serverMessage?: string): string {
  if (httpStatus === undefined) return 'API Ruang tidak dapat dijangkau. Apakah server berjalan (npm start atau npm run dev)?'
  if (httpStatus === 404 && (!serverMessage || serverMessage === 'Not found')) return 'Server Ruang tidak mengenali endpoint ini, jadi kodenya lebih lama daripada halaman ini. Hentikan lalu jalankan ulang (npm run build, lalu npm start) untuk memuat versi terbaru.'
  return serverMessage ? `${serverMessage} (HTTP ${httpStatus})` : `API Ruang menjawab HTTP ${httpStatus}.`
}

export async function loadSnapshot<T>(path: string, request: typeof fetch = fetch): Promise<RequestState<T>> {
  let response: Response
  try {
    response = await request(path)
  } catch {
    return { status: 'failed', message: describeFailure(undefined) }
  }
  if (!response.ok) {
    const body = await response.json().catch(() => undefined) as { error?: unknown; locked?: unknown } | undefined
    if (response.status === 401 && body?.locked === true && typeof window !== 'undefined') window.dispatchEvent(new Event(LOCKED_EVENT))
    const serverMessage = typeof body?.error === 'string' ? body.error : undefined
    return { status: 'failed', httpStatus: response.status, message: describeFailure(response.status, serverMessage) }
  }
  try {
    return { status: 'ready', data: await response.json() as T }
  } catch {
    return { status: 'failed', httpStatus: response.status, message: 'API Ruang mengembalikan respons yang bukan JSON. Apakah ada program lain yang memakai port 3001?' }
  }
}

/** Keeps the last good data visible (marked stale) when a background refresh fails. */
export function mergeRefresh<T>(previous: RequestState<T>, next: RequestState<T>): RequestState<T> {
  if (next.status === 'failed' && previous.status === 'ready') return { ...previous, stale: true }
  return next
}
