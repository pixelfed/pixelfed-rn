import { Storage } from 'src/state/cache'

export function randomKey(length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

function removeDuplicateObjects(array, keyProps) {
  return array.filter(
    (obj, index, self) =>
      index ===
      self.findIndex((t) => {
        return keyProps.every((prop) => t[prop] === obj[prop])
      })
  )
}

export function objectToForm(obj) {
  let form = new FormData()

  Object.keys(obj).forEach((key) => form.append(key, obj[key]))

  return form
}

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

export async function _selfPost(
  url,
  token,
  params = {},
  asForm = false,
  rawRes = false,
  idempotency = false
) {
  let headers = {}
  headers['Authorization'] = `Bearer ${token}`
  headers['Accept'] = 'application/json'
  headers['Content-Type'] = asForm ? 'multipart/form-data' : 'application/json'

  if (idempotency) {
    headers['Idempotency-Key'] = randomKey(40)
  }

  const resp = await fetch(url, {
    method: 'POST',
    body: asForm ? objectToForm(params) : JSON.stringify(params),
    headers,
  })

  return rawRes ? resp : resp.json()
}

export async function selfPost(
  path,
  params = {},
  asForm = false,
  rawRes = false,
  idempotency = false
) {
  let headers = {}
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  const url = `https://${instance}/${path}`

  headers['Authorization'] = `Bearer ${token}`
  headers['Accept'] = 'application/json'
  headers['Content-Type'] = asForm ? 'multipart/form-data' : 'application/json'

  if (idempotency) {
    headers['Idempotency-Key'] = randomKey(40)
  }

  const resp = await fetch(url, {
    method: 'POST',
    body: asForm ? objectToForm(params) : JSON.stringify(params),
    headers,
  })

  return rawRes ? resp : resp.json()
}

export async function selfPut(
  path,
  params = {},
  asForm = false,
  rawRes = false,
  idempotency = false
) {
  let headers = {}
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  const url = `https://${instance}/${path}`

  headers['Authorization'] = `Bearer ${token}`
  headers['Accept'] = 'application/json'
  headers['Content-Type'] = asForm ? 'multipart/form-data' : 'application/json'

  if (idempotency) {
    headers['Idempotency-Key'] = randomKey(40)
  }

  const resp = await fetch(url, {
    method: 'PUT',
    body: asForm ? objectToForm(params) : JSON.stringify(params),
    headers,
  })

  return rawRes ? resp : resp.json()
}

export async function selfDelete(path, params = {}, rawRes = false, idempotency = false) {
  let headers = {}
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  const url = `https://${instance}/${path}`

  headers['Authorization'] = `Bearer ${token}`
  headers['Accept'] = 'application/json'
  headers['Content-Type'] = 'application/json'

  if (idempotency) {
    headers['Idempotency-Key'] = randomKey(40)
  }

  const resp = await fetch(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
    headers,
  })

  return rawRes ? resp : resp.json()
}

export async function selfGet(path, params = {}, rawRes = false, idempotency = false) {
  let headers = {}
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  const url = `https://${instance}/${path}`

  headers['Authorization'] = `Bearer ${token}`
  headers['Accept'] = 'application/json'
  headers['Content-Type'] = 'application/json'

  if (idempotency) {
    headers['Idempotency-Key'] = randomKey(40)
  }

  const resp = await fetch(url, {
    method: 'GET',
    headers,
  })

  return rawRes ? resp : resp.json()
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

async function fetchCursorPagination(url) {
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

  return { data: data.data, nextPage: data?.links?.next, prevPage: data?.links?.prev }
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
    ...data.statuses.map((a) => {
      a._type = 'status'
      return a
    }),
  ]
  return mapd
}

export async function fetchNotifications({ queryKey, pageParam = false }) {
  let url
  const filterMap = {
    likes: 'favourite',
    follows: 'follow',
    mentions: 'mention',
    reblogs: 'reblog',
  }
  if (!pageParam) {
    const instance = Storage.getString('app.instance')
    if (queryKey[1] != 'all') {
      url = `https://${instance}/api/v1/notifications?types[]=${filterMap[queryKey[1]]}`
    } else {
      url = `https://${instance}/api/v1/notifications`
    }
  } else {
    url = pageParam
  }
  return await fetchPaginatedData(url)
}

export async function fetchHomeFeed({ pageParam = false }) {
  let url
  if (!pageParam) {
    const instance = Storage.getString('app.instance')
    url = `https://${instance}/api/v1/timelines/home?_pe=1&limit=20`
  } else {
    url = pageParam + '&_pe=1&limit=20'
  }
  return await fetchPaginatedData(url)
}

export async function fetchNetworkFeed({ pageParam = false }) {
  let url
  if (!pageParam) {
    const instance = Storage.getString('app.instance')
    url = `https://${instance}/api/v1/timelines/public?_pe=1&limit=20`
  } else {
    url = pageParam + '&_pe=1&limit=20'
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

export async function followAccountById(id) {
  let path = `api/v1/accounts/${id}/follow`
  return await selfPost(path)
}

export async function unfollowAccountById(id) {
  let path = `api/v1/accounts/${id}/unfollow`
  return await selfPost(path)
}

export async function reportProfile({ id, type }) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const params = new URLSearchParams({
    report_type: type,
    object_type: 'user',
    object_id: id,
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

export async function getAccountByUsername({ queryKey }) {
  const instance = Storage.getString('app.instance')
  const url = `https://${instance}/api/v1.1/accounts/username/${queryKey[1]}?_pe=1`
  return await fetchData(url)
}

export async function getAccountStatusesById(id, page) {
  const instance = Storage.getString('app.instance')
  const url = `https://${instance}/api/v1/accounts/${id}/statuses?_pe=1&limit=24&max_id=${page}`
  return await fetchData(url)
}

export async function getHashtagByName({ queryKey }) {
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

export async function getComposeSettings() {
  const path = `api/v1.1/compose/settings`
  return await selfGet(path)
}

export async function getConfig() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v2/config`
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

export async function getStatusReblogs(id, cursor) {
  let url
  const instance = Storage.getString('app.instance')
  url = cursor
    ? `https://${instance}/api/v1/statuses/${id}/reblogged_by?_pe=1&limit=20&cursor=${cursor}`
    : `https://${instance}/api/v1/statuses/${id}/reblogged_by?_pe=1&limit=20`
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

export async function getTrendingPopularPostsMonthly() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1.1/discover/posts/trending?range=monthly`
  return await fetchData(url)
}

export async function getTrendingPopularPostsYearly() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1.1/discover/posts/trending?range=yearly`
  return await fetchData(url)
}

export async function getAccountRelationship({ queryKey }) {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/accounts/relationships?id[]=${queryKey[1]}&_pe=1`
  const res = await fetchData(url)
  return res[0]
}

export async function postComment({ postId, commentText }) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const params = new URLSearchParams({
    in_reply_to_id: postId,
    status: commentText,
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

export async function likeStatus({ id }) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const url = `https://${instance}/api/v1/statuses/${id}/favourite?_pe=1`
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

export async function unlikeStatus({ id }) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const url = `https://${instance}/api/v1/statuses/${id}/unfavourite?_pe=1`
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

export async function reportStatus({ id, type }) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const params = new URLSearchParams({
    report_type: type,
    object_type: 'post',
    object_id: id,
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

export async function deleteStatus({ id }) {
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

export async function muteProfileById(id) {
  let path = `api/v1/accounts/${id}/mute`
  return await selfPost(path)
}

export async function unmuteProfileById(id) {
  let path = `api/v1/accounts/${id}/unmute`
  return await selfPost(path)
}

export async function getBlocks() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/blocks`
  return await fetchData(url)
}

export async function blockProfileById(id) {
  let path = `api/v1/accounts/${id}/block`
  return await selfPost(path)
}

export async function unblockProfileById(id) {
  let path = `api/v1/accounts/${id}/unblock`
  return await selfPost(path)
}

export async function getSelfCollections({ pageParam = 1 }) {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1.1/collections/self?page=${pageParam}`
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

export async function getFollowRequests() {
  const instance = Storage.getString('app.instance')
  let url = `https://${instance}/api/v1/follow_requests`
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
  return await response.json()
}

export async function updateAvatar(data) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  let url = `https://${instance}/api/v1/accounts/update_credentials`
  return await _selfPost(url, token, data, true)
}

export async function accountFollowRequestAccept(id) {
  let path = `api/v1/follow_requests/${id}/authorize`
  return await selfPost(path)
}

export async function accountFollowRequestReject(id) {
  let path = `api/v1/follow_requests/${id}/reject`
  return await selfPost(path)
}

export async function deleteAvatar() {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  let url = `https://${instance}/api/v1.1/accounts/avatar`
  const response = await fetch(url, {
    method: 'DELETE',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  return await response.json()
}

export async function fetchChatThread(id) {
  const path = `api/v1.1/direct/thread?pid=${id}`
  return await selfGet(path)
}

export async function deleteChatMessage(id) {
  const path = `api/v1.1/direct/thread/message?id=${id}`
  return await selfDelete(path)
}

export async function sendChatMessage(id, message) {
  const path = `api/v1.1/direct/thread/send`
  return await selfPost(path, {
    to_id: id,
    message: message,
    type: 'text',
  })
}

export async function uploadMediaV2(params) {
  const path = `api/v2/media`
  return await selfPost(path, params, true, false, true)
}

export async function postNewStatus(params) {
  const path = `api/v1/statuses`
  return await selfPost(path, params, false, false, true)
}

export async function getAdminStats() {
  const path = `api/admin/stats`
  return await selfGet(path)
}

export async function adminInstances(queryKey = false, sort, sortBy) {
  const instance = Storage.getString('app.instance')
  let path = queryKey.pageParam
    ? queryKey.pageParam
    : `https://${instance}/api/admin/instances/list?order_by=sort=${sort}&sort_by=${sortBy}`
  const res = await fetchData(path)
  return { data: res.data, nextPage: res.links?.next, prevPage: res.links?.prev }
}

export async function adminInstanceGet(params) {
  return await selfGet('api/admin/instances/get', params)
}

export async function getDomainBlocks(params) {
  return await selfGet('api/v1/domain_blocks', params)
}

export async function deleteStatusV1(id) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  let url = `https://${instance}/api/v1/statuses/${id}`
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

export async function editPostMedia(id, description) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  const params = new URLSearchParams({
    description: description,
  })
  let url = `https://${instance}/api/v1/media/${id}?${params}`
  const response = await fetch(url, {
    method: 'put',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
  return await response.json()
}

export async function getTrendingPostsV1() {
  const res = await selfGet('api/v1.1/discover/posts/network/trending')
  const accounts = removeDuplicateObjects(
    res.map((s) => s.account),
    ['id']
  )
  return {
    accounts: accounts,
    posts: res.filter((s) => s.pf_type === 'photo'),
  }
}

export async function postBookmark(id) {
  return await selfPost(`api/v1/statuses/${id}/bookmark`)
}

export async function followHashtag(id) {
  return await selfPost(`api/v1/tags/${id}/follow`)
}

export async function unfollowHashtag(id) {
  return await selfPost(`api/v1/tags/${id}/unfollow`)
}

export async function getAdminConfig() {
  return await selfGet('api/admin/config')
}

export async function updateAdminConfig(params) {
  return await selfPost('api/admin/config/update', params)
}

export async function getAdminUsers(cursor) {
  let url
  const instance = Storage.getString('app.instance')
  url = cursor != null ? cursor : `https://${instance}/api/admin/users/list?sort=desc`
  return await fetchCursorPagination(url)
}

export async function getAdminUser(id) {
  return await selfGet(`api/admin/users/get?user_id=${id}`)
}

export async function getModReports() {
  return await selfGet('api/admin/mod-reports/list')
}

export async function getAutospamReports() {
  return await selfGet('api/admin/autospam/list')
}

export async function postUserHandle(params) {
  return await selfPost('api/admin/users/action', params)
}

export async function postReportHandle(params) {
  return await selfPost('api/admin/mod-reports/handle', params)
}

export async function postAutospamHandle(params) {
  return await selfPost('api/admin/autospam/handle', params)
}

export async function getStatusHistory(id) {
  return await selfGet(`api/v1/statuses/${id}/history`)
}

export async function getMutualFollowing({ queryKey }) {
  return await selfGet(`api/v1.1/accounts/mutuals/${queryKey[1]}`)
}

export async function getSelfLikes({ pageParam = false }) {
  let url
  const instance = Storage.getString('app.instance')
  if (!pageParam) {
    url = `https://${instance}/api/v1/favourites`
  } else {
    url = pageParam
  }
  return await fetchPaginatedData(url)
}

export async function getSelfBookmarks({ pageParam = false }) {
  let url
  const instance = Storage.getString('app.instance')
  if (!pageParam) {
    url = `https://${instance}/api/v1/bookmarks`
  } else {
    url = pageParam
  }
  return await fetchPaginatedData(url)
}

export async function putEditPost(id, params) {
  return await selfPut(`api/v1/statuses/${id}`, params)
}
