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
    ...data.hashtags.map((a) => {
      a._type = 'hashtag'
      return a
    }),
    ...data.accounts.map((a) => {
      a._type = 'account'
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

export async function getHashtagByName({queryKey}) {
  const instance = Storage.getString('app.instance')
  const url = `https://${instance}/api/v1/tags/${queryKey[1]}/?_pe=1`
  return await fetchData(url)
}

export async function getHashtagByNameFeed(id, page) {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/timelines/tag/${id}?_pe=1&max_id=${page}`
  return await fetchPaginatedData(url)
}

export async function getHashtagRelated(id) {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/tags/${id}/related`
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

export async function getTrendingHashtags() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1.1/discover/posts/hashtags`
  return await fetchData(url)
}

export async function getTrendingPopularAccounts() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1.1/discover/accounts/popular`
  return await fetchData(url)
}

export async function getTrendingPopularPosts() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1.1/discover/posts/trending?range=daily`
  return await fetchData(url)
}

export async function getAccountRelationship({ queryKey }) {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/accounts/relationships?id[]=${queryKey[1]}`
  const res = await fetchData(url)
  return res[0]
}

export async function postComment({postId, commentText}) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const params = new URLSearchParams({
    in_reply_to_id: postId,
    status: commentText
  })
  const url = `https://${instance}/api/v1/statuses?${params}`
  const response = await fetch(url, {
    method: 'post',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  return await response.json()
}

export async function likeStatus({id}) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const url = `https://${instance}/api/v1/statuses/${id}/favourite`
  const response = await fetch(url, {
    method: 'post',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  return await response.json()
}

export async function unlikeStatus({id}) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const url = `https://${instance}/api/v1/statuses/${id}/unfavourite`
  const response = await fetch(url, {
    method: 'post',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  return await response.json()
}

export async function reportStatus({id, type}) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const params = new URLSearchParams({
    report_type: type,
    object_type: 'post',
    object_id: id
  })
  const url = `https://${instance}/api/v1.1/report?${params}`
  const response = await fetch(url, {
    method: 'post',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  return await response.json()
}

export async function deleteStatus({id}) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const url = `https://${instance}/api/v1/statuses/${id}`
  const response = await fetch(url, {
    method: 'delete',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  return await response.json()
}

export async function getMutes() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/mutes`
  return await fetchData(url)
}

export async function getBlocks() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/blocks`
  return await fetchData(url)
}

export async function getSelfCollections() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1.1/collections/self`
  return await fetchData(url)
}

export async function getFollowedTags() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/followed_tags`
  return await fetchData(url)
}

export async function getInstanceV1() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/instance`
  return await fetchData(url)
}

export async function getAppSettings() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/pixelfed/v1/app/settings`
  return await fetchData(url)
}

export async function getSelfAccount() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/accounts/verify_credentials?_pe=1`
  return await fetchData(url)
}

export async function updateCredentials(data) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  const params = new URLSearchParams(data)
  let url = `https://${instance}/api/v1/accounts/update_credentials?${params.toString()}`
  const response = await fetch(url, {
    method: 'patch',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  return await response.json();
}
