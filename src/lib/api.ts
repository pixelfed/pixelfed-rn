import { Storage } from 'src/state/cache'

export function parseLinkHeader(header) {
  if (!header || header.length === 0) {
    return null
  }

  const parts = header.split(',')
  const links = {}
  parts.forEach((p) => {
    const section = p.split(';')
    const url = section[0].replace(/<(.*)>/, '$1').trim()
    const name = section[1].replace(/rel="(.*)"/, '$1').trim()
    links[name] = url
  })

  return links
}

async function fetchPaginatedData(url: any) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const response = await fetch(url, {
    method: 'get',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  const data = await response.json()

  const linkHeader = response.headers.get('Link')
  const links = parseLinkHeader(linkHeader)

  return { data, nextPage: links?.next, prevPage: links?.prev }
}

export async function fetchNotifications({ pageParam = false }) {
  let url
  if (!pageParam) {
    const instance = Storage.getString('app.instance')
    url = `https://${instance}/api/v1/notifications`
  } else {
    url = pageParam
  }

  return await fetchPaginatedData(url)
}

export async function fetchNetworkFeed({ pageParam = false }) {
  let url
  if (!pageParam) {
    const instance = Storage.getString('app.instance')
    url = `https://${instance}/api/v1/timelines/public`
  } else {
    url = pageParam
  }

  return await fetchPaginatedData(url)
}
