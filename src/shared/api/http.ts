export class HttpError extends Error {
  readonly status: number
  readonly url: string

  constructor(status: number, statusText: string, url: string) {
    super(`Сервер ответил ${status} ${statusText} на ${url}`)
    this.name = 'HttpError'
    this.status = status
    this.url = url
  }
}

export class NetworkError extends Error {
  readonly url: string

  constructor(url: string, cause: unknown) {
    super(`Сеть недоступна. Не удалось запросить ${url}`, { cause })
    this.name = 'NetworkError'
    this.url = url
  }
}

export async function requestJson(
  url: string,
  init?: RequestInit,
): Promise<unknown> {
  let response: Response

  try {
    response = await fetch(url, init)
  } catch (error) {
    throw new NetworkError(url, error)
  }

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText, url)
  }

  try {
    const payload: unknown = await response.json()
    return payload
  } catch {
    throw new Error(`Ответ сервера не JSON: ${url}`)
  }
}
