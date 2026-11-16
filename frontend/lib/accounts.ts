export async function accountRequest<T>(path: string, method = 'GET', data?: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/users${path}`, {
    method, signal, cache: 'no-store',
    headers: data && { 'Content-Type': 'application/json' },
    body: data && JSON.stringify(data),
  })
  if (response.status === 204) return undefined as T
  const body = await response.json()
  if (!response.ok) {
    if (response.status === 401) window.location.assign('/login')
    throw new Error(body.details?.[0]?.message || body.message || 'Impossible de modifier le compte.')
  }
  return body
}
