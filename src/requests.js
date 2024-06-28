import { Alert } from 'react-native'
import { Storage } from './state/cache'

export function objectToForm(obj) {
  let form = new FormData()

  Object.keys(obj).forEach((key) => form.append(key, obj[key]))

  return form
}

export async function postForm(url, data = false, token = false, contentType = false) {
  // Send a POST request with data formatted with FormData returning JSON
  let headers = {}

  if (token) headers['Authorization'] = `Bearer ${token}`
  if (contentType) headers['Content-Type'] = contentType

  const resp = await fetch(url, {
    method: 'POST',
    body: data ? objectToForm(data) : undefined,
    headers,
  })

  return resp
}

export async function postJson(url, data = false, token = false, customHeaders = false) {
  // Send a POST request with data formatted with FormData returning JSON
  let headers = customHeaders ? customHeaders : {}

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

export async function post(url, token = false) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  return resp
}

export async function get(url, token = false, data = false) {
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

export async function getJSON(url, token = false, data = false, customHeaders = false) {
  let completeURL
  if (data) {
    let params = new URLSearchParams(data)
    completeURL = `${url}?${params.toString()}`
  } else {
    completeURL = url
  }

  let reqHeaders = token ? { Authorization: `Bearer ${token}` } : {}

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
  url,
  token = false,
  data = false,
  customHeaders = false,
  timeout = 5000
) {
  let completeURL
  if (data) {
    let params = new URLSearchParams(data)
    completeURL = `${url}?${params.toString()}`
  } else {
    completeURL = url
  }

  let reqHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  if (customHeaders) {
    reqHeaders = { ...reqHeaders, ...customHeaders }
  }

  return Promise.race([
    fetch(completeURL, {
      method: 'GET',
      redirect: 'follow',
      headers: reqHeaders,
    }),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request for ${url} timed out after ${timeout} milliseconds`))
      }, timeout)
    }),
  ])
}

export async function loginPreflightCheck(server) {
  let url = 'https://' + server + '/api/nodeinfo/2.0.json'

  try {
    let res = await getJsonWithTimeout(url, false, false, false, 5000)
    let json = await res.json()
    if (!json) {
      Alert.alert('Error', 'Cannot reach server.')
      return false
    }

    if (!json.software || !json.software.name || !json.software.version) {
      Alert.alert('Error', 'Cannot reach server. Invalid software')
      return false
    }

    if (json.software.name != 'pixelfed') {
      Alert.alert(
        'Error',
        'Invalid server type, this app is only compatible with Pixelfed'
      )
      return false
    }
  } catch (e) {
    Alert.alert('Error', 'Cannot reach server.')
    return false
  }

  return true
}

export async function verifyCredentials(domain, token) {
  const resp = await get(
    `https://${domain}/api/v1/accounts/verify_credentials?_pe=1`,
    token
  )

  return resp.json()
}

export async function queryApi(endpoint, params = null) {
  let server = Storage.getString('app.instance')
  let token = Storage.getString('app.token')

  let url = `https://${server}/${endpoint}`

  return await getJSON(url, token, params)
}
