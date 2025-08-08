import { Alert } from 'react-native'
import { Storage } from './state/cache'
import { compareSemver } from './utils'

export function objectToForm(obj: { [key: string | number]: any }) {
  let form = new FormData()

  Object.keys(obj).forEach((key) => form.append(key, obj[key]))

  return form
}

export async function postForm(
  url: string,
  data?: { [key: string | number]: any },
  token?: string,
  contentType?: string
) {
  // Send a POST request with data formatted with FormData returning JSON
  let headers: { [key: string]: string } = {}

  if (token) headers['Authorization'] = `Bearer ${token}`
  if (contentType) headers['Content-Type'] = contentType

  const resp = await fetch(url, {
    method: 'POST',
    body: data ? objectToForm(data) : undefined,
    headers,
  })

  return resp
}

export async function postJson(
  url: string,
  data?: any,
  token?: string,
  customHeaders?: { [key: string]: string }
) {
  // Send a POST request with data formatted with FormData returning JSON
  let headers: { [key: string]: string } = customHeaders ? customHeaders : {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  headers['Accept'] = 'application/json'
  headers['Content-Type'] = 'application/json'

  const resp = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers,
  })

  return resp
}

export async function post(url: string, token?: string) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  return resp
}

export async function get(url: string, token?: string, data?: any) {
  let completeURL
  if (data) {
    let params = new URLSearchParams(data)
    completeURL = `${url}?${params.toString()}`
  } else {
    completeURL = url
  }

  const resp = await fetch(completeURL, {
    method: 'GET',
    redirect: 'follow',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  return resp
}

export async function getJSON(
  url: string,
  token?: string,
  data?: any,
  customHeaders?: { [key: string]: string }
) {
  let completeURL
  if (data) {
    let params = new URLSearchParams(data)
    completeURL = `${url}?${params.toString()}`
  } else {
    completeURL = url
  }

  let reqHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

  if (customHeaders) {
    reqHeaders = { ...reqHeaders, ...customHeaders }
  }

  const resp = await fetch(completeURL, {
    method: 'GET',
    redirect: 'follow',
    headers: reqHeaders,
  })

  return resp.json()
}

export function getJsonWithTimeout(
  url: string,
  token?: string,
  data?: any,
  customHeaders?: { [key: string]: string },
  timeout = 5000
): Promise<Response> {
  let completeURL
  if (data) {
    let params = new URLSearchParams(data)
    completeURL = `${url}?${params.toString()}`
  } else {
    completeURL = url
  }

  let reqHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

  if (customHeaders) {
    reqHeaders = { ...reqHeaders, ...customHeaders }
  }

  return Promise.race([
    fetch(completeURL, {
      method: 'GET',
      redirect: 'follow',
      headers: reqHeaders,
    }),
    new Promise<Response>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request for ${url} timed out after ${timeout} milliseconds`))
      }, timeout)
    }),
  ])
}

export async function loginPreflightCheck(server: string) {
  let url = 'https://' + server + '/api/nodeinfo/2.0.json'

  try {
    let res = await getJsonWithTimeout(url, undefined, false, undefined, 5000)
    let json = await res.json()
    if (!json) {
      Alert.alert('Error', 'This server is not compatible or is unavailable.')
      return false
    }

    if (!json.software || !json.software.name || !json.software.version) {
      Alert.alert('Error', 'Cannot reach server. Invalid software')
      return false
    }

    const validVersion = compareSemver(json.software.version, '0.12.3')
    if (validVersion === -1) {
      Alert.alert(
        'Error',
        'Invalid or outdated version, please ask your admin to update.'
      )
      return false
    }

    if (json.software.name != 'pixelfed') {
      Alert.alert(
        'Error',
        'Invalid server type, this app is only compatible with Pixelfed'
      )
      return false
    }
  } catch (_e) {
    Alert.alert('Error', 'This server is not compatible or is unavailable.')
    return false
  }

  return true
}

export async function verifyCredentials(domain: string, token: string) {
  const resp = await get(
    `https://${domain}/api/v1/accounts/verify_credentials?_pe=1`,
    token
  )

  return resp.json()
}

export async function queryApi(endpoint: string, params = null) {
  let server = Storage.getString('app.instance')
  let token = Storage.getString('app.token')

  let url = `https://${server}/${endpoint}`

  return await getJSON(url, token, params)
}
