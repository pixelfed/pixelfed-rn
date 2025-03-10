import { Storage } from 'src/state/cache'
import { parseLinkHeader } from 'src/utils'
import { randomKey } from './randomKey'

type ApiRequestOptions = {
  idempotency?: true
  searchParams?: Record<string, string | number | boolean | undefined>
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

  // TODO: private
  async request(
    path: string,
    fetch_options: RequestInit,
    options?: ApiRequestOptions
  ): Promise<Response> {
    const url = new URL(`${path}`, `https://${this.instanceHostName}`)

    if (options?.searchParams) {
      let { searchParams } = options
      for (const key in searchParams) {
        if (Object.prototype.hasOwnProperty.call(searchParams, key)) {
          if (typeof searchParams[key] !== 'undefined') {
            url.searchParams.append(key, String(searchParams[key]))
          }
        }
      }
    }

    // Tell the API that we want the extra pixelfed specific fields
    // (that would not be in the mastodon api)
    url.searchParams.append('_pe', '1')

    fetch_options.headers = {
      ...fetch_options.headers,
      Accept: 'application/json',
      Authorization: `Bearer ${this.token}`,
      'X-PIXELFED-APP': '1',
      ...(options?.idempotency ? { 'Idempotency-Key': randomKey(40) } : {}),
    }

    let response = await fetch(url, fetch_options)
    if (!response.ok) {
      let errorResponse
      try {
        errorResponse = await response.json()
        console.warn('API Request Failed', { errorResponse })
        if (
          !errorResponse.error_code &&
          (typeof errorResponse.error === 'undefined' || errorResponse.error.length === 0)
        ) {
          throw new Error('request failed, but error field is empty')
        }
      } catch (error) {
        console.error('API Request Failed - Failed to decode error:', error)
        throw new Error('API Request Failed without error message')
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
    searchParams: ApiRequestOptions['searchParams'] = {},
    idempotency?: true
  ) {
    return await (
      await this.request(
        path,
        {
          method,
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        { searchParams, idempotency }
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

  async getPaginated<ResponseType>(
    url: string,
    searchParams: ApiRequestOptions['searchParams'] = {}
  ): Promise<{ data: ResponseType; nextPage?: string; prevPage?: string }> {
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
    const data = await response.json()

    if (!data.data) {
      console.warn(`getPaginated for this did not return pagination cursor info`, response.url)
      return { data, nextPage: undefined, prevPage: undefined }
    }

    return { data: data.data, nextPage: data?.links?.next, prevPage: data?.links?.prev }
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
; (global as any).API = ContextFromStorage
