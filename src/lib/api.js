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

async function fetchPaginatedData(url) {
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

async function fetchData(url) {
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

  return data
}

export async function searchQuery(query) {
  if (!query || query.trim() === '') return []
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const url = `https://${instance}/api/v2/search?q=${encodeURIComponent(
    query
  )}&_pe=1&resolve=1`
  const response = await fetch(url, {
    method: 'get',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  const data = await response.json()
  let mapd = [
    ...data.accounts.map((a) => {
      a._type = 'account'
      return a
    }),
    ...data.hashtags.map((a) => {
      a._type = 'hashtag'
      return a
    }),
  ]
  return mapd
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

export async function fetchHomeFeed({ pageParam = false }) {
  let url
  if (!pageParam) {
    const instance = Storage.getString('app.instance')
    url = `https://${instance}/api/v1/timelines/home?_pe=1`
  } else {
    url = pageParam + '&_pe=1'
  }
  return await fetchPaginatedData(url)
}

export async function fetchNetworkFeed({ pageParam = false }) {
  let url
  if (!pageParam) {
    const instance = Storage.getString('app.instance')
    url = `https://${instance}/api/v1/timelines/public?_pe=1`
  } else {
    url = pageParam + '&_pe=1'
  }

  return await fetchPaginatedData(url)
}

export async function getAccountFollowers(id, cursor) {
  let url
  const instance = Storage.getString('app.instance')
  url = cursor
    ? `https://${instance}/api/v1/accounts/${id}/followers?_pe=1&limit=20&cursor=${cursor}`
    : `https://${instance}/api/v1/accounts/${id}/followers?_pe=1&limit=20`
  return await fetchPaginatedData(url)
}

export async function getAccountFollowing(id, cursor) {
  let url
  const instance = Storage.getString('app.instance')
  url = cursor
    ? `https://${instance}/api/v1/accounts/${id}/following?_pe=1&limit=20&cursor=${cursor}`
    : `https://${instance}/api/v1/accounts/${id}/following?_pe=1&limit=20`
  return await fetchPaginatedData(url)
}

export async function getStatusById({ queryKey }) {
  const instance = Storage.getString('app.instance')
  const url = `https://${instance}/api/v1/statuses/${queryKey[1]}?_pe=1`
  return await fetchData(url)
}

export async function getAccountById({ queryKey }) {
  const instance = Storage.getString('app.instance')
  const url = `https://${instance}/api/v1/accounts/${queryKey[1]}?_pe=1`
  return await fetchData(url)
}

export async function getAccountStatusesById(id, page) {
  const instance = Storage.getString('app.instance')
  const url = `https://${instance}/api/v1/accounts/${id}/statuses?_pe=1&max_id=${page}`
  return await fetchData(url)
}

export async function getHashtagByName(id) {
  const instance = Storage.getString('app.instance')
  const url = `https://${instance}/api/v1/tags/${id}/?_pe=1`
  return await fetchData(url)
}

export async function getHashtagByNameFeed(id, page) {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/timelines/tag/${id}?_pe=1&max_id=${page}`
  return await fetchPaginatedData(url)
}

export async function getConversations(params) {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/conversations`
  return await fetchData(url)
}

export async function getStatusRepliesById(id, page) {
  const instance = Storage.getString('app.instance')
  const url = `https://${instance}/api/v1/statuses/${id}/context?_pe=1&max_id=${page}`
  let res = await fetchPaginatedData(url)

  res.data = res.data.descendants
  return res
}

export async function getOpenServers() {
  const response = await fetch(
    'https://pixelfed.org/api/v1/mobile-app/servers/open.json',
    {
      method: 'get',
      headers: new Headers({
        Accept: 'application/json',
        'X-Pixelfed-App': 1,
        'Content-Type': 'application/json',
      }),
    }
  )
  return await response.json()
}

export async function getStatusLikes(id, cursor) {
  let url
  const instance = Storage.getString('app.instance')
  url = cursor
    ? `https://${instance}/api/v1/statuses/${id}/favourited_by?_pe=1&limit=20&cursor=${cursor}`
    : `https://${instance}/api/v1/statuses/${id}/favourited_by?_pe=1&limit=20`
  return await fetchPaginatedData(url)
}
