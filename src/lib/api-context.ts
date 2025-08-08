import { Storage } from 'src/state/cache'
import { randomKey } from './randomKey'

type ApiRequestOptions = {
  idempotency?: true
  searchParams?: Record<string, string | number | boolean>
}

// Global logout function that can be set by AuthProvider
let globalLogoutFunction: (() => void) | null = null

export function setGlobalLogoutFunction(logoutFn: () => void) {
  globalLogoutFunction = logoutFn
}

export class ApiContext {
  constructor(
    public readonly instanceHostName: string,
    public readonly token: string
  ) {
    if (instanceHostName.length === 0) {
      throw new Error('failed to create ApiContext: instance host name missing')
    }
    if (token.length === 0) {
      throw new Error('failed to create ApiContext: token missing')
    }
  }

  private handleUnauthorized() {
    // Clear credentials cache since we got unauthorized
    Storage.delete('app.credentials_verified_at')

    // Trigger logout if available
    if (globalLogoutFunction) {
      globalLogoutFunction()
    } else {
    }
  }

  async request(
    path: string,
    fetch_options: RequestInit,
    options?: ApiRequestOptions
  ): Promise<Response> {
    const url = new URL(`${path}`, `https://${this.instanceHostName}`)

    if (options?.searchParams) {
      let { searchParams } = options
      for (const key in searchParams) {
        if (Object.hasOwn(searchParams, key)) {
          url.searchParams.append(key, String(searchParams[key]))
        }
      }
    }

    fetch_options.headers = {
      ...fetch_options.headers,
      Accept: 'application/json',
      Authorization: `Bearer ${this.token}`,
      ...(options?.idempotency ? { 'Idempotency-Key': randomKey(40) } : {}),
    }

    let response = await fetch(url, fetch_options)

    // Handle unauthorized responses (401 or 403)
    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized()
      throw new Error('Authentication failed - user has been logged out')
    }

    if (!response.ok) {
      let errorResponse
      try {
        errorResponse = await response.json()
        if (
          !errorResponse.error_code &&
          (typeof errorResponse.error === 'undefined' || errorResponse.error.length === 0)
        ) {
          throw new Error(
            `Request failed with status ${response.status}, but error field is empty`
          )
        }
      } catch (_error) {
        throw new Error(
          `API Request Failed with status ${response.status} without error message`
        )
      }
      if (errorResponse.error_code) {
        throw new Error(
          `API Request Failed: ${errorResponse.error_code}: ${errorResponse.msg}`
        )
      }
      throw new Error(`API Request Failed: ${errorResponse.error}`)
    }

    return response
  }

  /** request in json data and gets back json data */
  async jsonRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data = {},
    searchParams: ApiRequestOptions['searchParams'] = {}
  ) {
    return await (
      await this.request(
        path,
        {
          method,
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        { searchParams }
      )
    ).json()
  }

  async get(url: string, searchParams: ApiRequestOptions['searchParams'] = {}) {
    const response = await this.request(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { searchParams }
    )
    return await response.json()
  }
}

export function ContextFromStorage(): ApiContext {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  if (!instance || !token) {
    throw new Error('api token or instance undefined')
  }
  return new ApiContext(instance, token)
}
// For debugging
;(global as any).API = ContextFromStorage
