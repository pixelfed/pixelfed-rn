import { objectToForm } from 'src/requests'
import { Storage } from 'src/state/cache'
import { parseLinkHeader } from 'src/utils'
import { ContextFromStorage } from './api-context'
import type {
  Account,
  AdminInstancesOptions,
  OpenServersResponse,
  PaginatedStatus,
  PushState,
  PushStateCompareParams,
  PushStateCompareResponse,
  PushStateParams,
  PushStateResponse,
  Relationship,
  RelationshipFromFollowAPIResponse,
  Status,
  UpdateCredentialsParams,
  UploadV2Params,
  UploadV2ResponseOrError,
} from './api-types'
import { randomKey } from './randomKey'

function removeDuplicateObjects(array: any[], keyProps: string[]) {
  return array.filter(
    (obj, index, self) =>
      index ===
      self.findIndex((t) => {
        return keyProps.every((prop) => t[prop] === obj[prop])
      })
  )
}

export async function selfPost<
  AsForm extends boolean = false,
  ParamsType = AsForm extends true ? { [key: string | number]: any } : Object,
  ResponseType = Object,
  RawRes extends Boolean = false,
  ActualResponse = RawRes extends false ? Promise<ResponseType> : Response,
>(
  path: string,
  params: ParamsType = {} as ParamsType,
  asForm: AsForm = false as AsForm,
  rawRes: RawRes = false as RawRes,
  idempotency = false,
  appHeader = false
) {
  let headers: Record<string, string> = {}
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
  const url = `https://${instance}/${path}`

  headers['Authorization'] = `Bearer ${token}`
  headers['Accept'] = 'application/json'
  headers['Content-Type'] = asForm ? 'multipart/form-data' : 'application/json'

  if (idempotency) {
    headers['Idempotency-Key'] = randomKey(40)
  }

  if (appHeader) {
    headers['X-PIXELFED-APP'] = '1'
  }

  const resp = await fetch(url, {
    method: 'POST',
    body: asForm
      ? objectToForm(params as { [key: string | number]: any })
      : JSON.stringify(params),
    headers,
  })

  return (rawRes ? resp : resp.json()) as ActualResponse
}

async function fetchPaginatedData(url: string) {
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

async function fetchCursorPagination(url: string) {
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

export async function searchQuery(query: string) {
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
    ...data.statuses.slice(0, 1).map((a) => {
      a._type = 'status'
      return a
    }),
    ...data.accounts.slice(0, 2).map((a) => {
      a._type = 'account'
      return a
    }),
    ...data.hashtags.slice(0, 6).map((a) => {
      a._type = 'hashtag'
      return a
    }),
    ...data.accounts.slice(2).map((a) => {
      a._type = 'account'
      return a
    }),
    ...data.hashtags.slice(6).map((a) => {
      a._type = 'hashtag'
      return a
    }),
  ]
  return mapd
}

export enum NotificationType {
  all = 'all',
  likes = 'favourite',
  follows = 'follow',
  mentions = 'mention',
  reblogs = 'reblog',
}
export async function fetchNotifications(filter_type?: NotificationType, cursor?: string) {
  const api = ContextFromStorage()

  let query: { cursor?: string, "types[]"?: string } = { cursor }

  if (filter_type && filter_type != NotificationType.all) {
    query["types[]"] = filter_type
  }

  return await api.getPaginated("/api/v1/notifications", query)
}

export async function fetchTimeline(feed: 'home' | 'public', cursor?: string): Promise<PaginatedStatus> {
  const api = ContextFromStorage()

  return await api.getPaginated(`/api/v1/timelines/${feed}`, { limit: 20, cursor }) as PaginatedStatus
}

export async function getAccountFollowers(id: string, cursor?: string) {
  const api = ContextFromStorage()
  return await api.getPaginated(`/api/v1/accounts/${id}/followers`, {
    limit: 20,
    cursor,
  })
}

export async function getAccountFollowing(id: string, cursor?: string) {
  const api = ContextFromStorage()
  return await api.getPaginated(`/api/v1/accounts/${id}/following`, {
    limit: 20,
    cursor,
  })
}

export async function getStatusById(id: string) {
  const api = ContextFromStorage()
  return await api.get(`api/v1/statuses/${id}`)
}

export async function getAccountById(id: string) {
  const api = ContextFromStorage()
  return await api.get(`api/v1/accounts/${id}`)
}

export async function followAccountById(
  id: string
): Promise<RelationshipFromFollowAPIResponse> {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/accounts/${id}/follow`)
}

export async function unfollowAccountById(
  id: string
): Promise<RelationshipFromFollowAPIResponse> {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/accounts/${id}/unfollow`)
}

export type NewReport = {
  object_id: string
  report_type: string
  object_type: 'user' | 'post'
}

export async function report(report: NewReport) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', 'api/v1.1/report', {}, report)
}

export async function getAccountByUsername(username: string): Promise<Account> {
  const api = ContextFromStorage()
  let account = await api.get(`api/v1.1/accounts/username/${username}`)
  if (Array.isArray(account) && account.length === 0) {
    throw new Error(`Account "${username}" not found`)
  }
  return account
}

interface getAccountStatusesByIdParameters {
  // https://github.com/pixelfed/pixelfed/blob/fa4474bc38d64b1d96272f9d45e90289020fcb11/app/Http/Controllers/Api/ApiV1Controller.php#L699
  only_media?: true
  pinned?: true
  exclude_replies?: true
  media_type?: 'photo' | 'video'
  limit?: number
  max_id?: number
  since_id?: number
  min_id?: number
}

export async function getAccountStatusesById(
  id: string,
  parameters: getAccountStatusesByIdParameters
): Promise<Status[]> {
  const api = ContextFromStorage()
  return await api.get(`api/v1/accounts/${id}/statuses`, {
    ...parameters,
  })
}

export async function getHashtagByName(id: string) {
  const api = ContextFromStorage()
  return await api.get(`api/v1/tags/${id}/`)
}

export async function getHashtagByNameFeed(id: string, page: number) {
  const api = ContextFromStorage()
  return await api.getPaginated(`/api/v1/timelines/tag/${id}`, {
    max_id: page,
  })
}

export async function getHashtagRelated(id: string) {
  const api = ContextFromStorage()
  // TODO do we need pagination here? it is not used currently
  return await api.getPaginated(`api/v1/tags/${id}/related`)
}

export async function getConversations() {
  const api = ContextFromStorage()
  return await api.get('api/v1/conversations')
}

export async function getComposeSettings() {
  const api = ContextFromStorage()
  return await api.get('api/v1.1/compose/settings')
}

export async function getConfig() {
  const api = ContextFromStorage()
  return await api.get('api/v2/config')
}

export async function getStatusRepliesById(id: string, page: number) {
  const api = ContextFromStorage()
  let res = await api.getPaginated(`api/v1/statuses/${id}/context`, {
    max_id: page,
  })
  // TODO: investigate - link header is also empty
  //  -> does this need really paginated or could use plain api.get instead?
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
        'X-Pixelfed-App': '1',
        'Content-Type': 'application/json',
      }),
    }
  )
  return (await response.json()) as OpenServersResponse
}

export async function getRegisterServers() {
  const response = await fetch(
    'https://pixelfed.org/api/v1/mobile-app/servers/register.json',
    {
      method: 'get',
      headers: new Headers({
        Accept: 'application/json',
        'X-Pixelfed-App': '1',
        'Content-Type': 'application/json',
      }),
    }
  )
  return (await response.json()) as OpenServersResponse
}

export async function getStatusLikes(id: string, cursor?: number) {
  const api = ContextFromStorage()
  // TODO: investigate - link header is also empty
  //  -> does this need really paginated or could use plain api.get instead?
  return await api.getPaginated(`api/v1/statuses/${id}/favourited_by`, {
    limit: 20,
    cursor,
  })
}

export async function getStatusReblogs(id: string, cursor?: number) {
  const api = ContextFromStorage()
  return await api.getPaginated(`api/v1/statuses/${id}/reblogged_by`, {
    limit: 10,
    cursor,
  })
}

export async function getTrendingHashtags() {
  const api = ContextFromStorage()
  return await api.get('api/v1.1/discover/posts/hashtags')
}

export async function getTrendingPopularAccounts() {
  const api = ContextFromStorage()
  return await api.get('api/v1.1/discover/accounts/populars')
}

export async function getTrendingPopularPosts(range: 'daily' | 'monthly' | 'yearly') {
  const api = ContextFromStorage()
  return await api.get('api/v1.1/discover/posts/trending', { range })
}

export async function getAccountRelationship(id: string): Promise<Relationship> {
  const api = ContextFromStorage()
  return (await api.get('api/v1/accounts/relationships', { 'id[]': id }))[0]
}

export async function postComment({ postId, commentText, scope = 'public', cw = false }) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')

  const params = new URLSearchParams({
    in_reply_to_id: postId,
    status: commentText,
    visibility: scope,
    sensitive: String(cw),
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

export async function likeStatus({ id }: { id: string }) {
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

export async function unlikeStatus({ id }: { id: string }) {
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

export async function reblogStatus({ id }: { id: string }) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/statuses/${id}/reblog`)
}

export async function unreblogStatus({ id }: { id: string }) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/statuses/${id}/unreblog`)
}

export async function deleteStatus({ id }: { id: string }) {
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
  const api = ContextFromStorage()
  return await api.get('api/v1/mutes')
}

export async function muteProfileById(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/accounts/${id}/mute`)
}

export async function unmuteProfileById(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/accounts/${id}/unmute`)
}

export async function getBlocks() {
  const api = ContextFromStorage()
  return await api.get('api/v1/blocks')
}

export async function blockProfileById(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/accounts/${id}/block`)
}

export async function unblockProfileById(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/accounts/${id}/unblock`)
}

export async function getSelfCollections({ pageParam = 1 }) {
  const api = ContextFromStorage()
  return await api.get('api/v1.1/collections/self', { page: pageParam })
}

export async function getFollowedTags() {
  const api = ContextFromStorage()
  return await api.get('api/v1/followed_tags')
}

export async function getInstanceV1() {
  const api = ContextFromStorage()
  return await api.get('api/v1/instance')
}

export async function getAppSettings() {
  const api = ContextFromStorage()
  return await api.get('api/pixelfed/v1/app/settings')
}

export async function getFollowRequests() {
  const api = ContextFromStorage()
  return await api.get('api/v1/follow_requests')
}

export async function getSelfAccount() {
  const api = ContextFromStorage()
  return await api.get('api/v1/accounts/verify_credentials')
}

export async function updateCredentials(params: URLSearchParams) {
  const instance = Storage.getString('app.instance')
  const token = Storage.getString('app.token')
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

export async function updateAvatar(data: {
  avatar: {
    payload: {
      uri: string
      type: string | null
      name: string
    }
  }
}) {
  const api = ContextFromStorage()
  return await api.request(`api/v1/accounts/update_credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: objectToForm(data as { [key: string | number]: any }),
  })
}

export async function accountFollowRequestAccept(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/follow_requests/${id}/authorize`)
}

export async function accountFollowRequestReject(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/follow_requests/${id}/reject`)
}

export async function deleteAvatar() {
  const api = ContextFromStorage()
  return await api.jsonRequest('DELETE', 'api/v1.1/accounts/avatar')
}

export async function fetchChatThread(pid: string) {
  const api = ContextFromStorage()
  return await api.get('api/v1.1/direct/thread', { pid })
}

export async function deleteChatMessage(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('DELETE', 'api/v1.1/direct/thread/message', undefined, {
    id,
  })
}

export async function sendChatMessage(id: string, message: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1.1/direct/thread/send`, {
    to_id: id,
    message: message,
    type: 'text',
  })
}

export async function uploadMediaV2(params: UploadV2Params) {
  const path = `api/v2/media`
  return await selfPost<true, UploadV2Params, UploadV2ResponseOrError>(
    path,
    params,
    true,
    false,
    true
  )
}

export async function postNewStatus(params) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/statuses`, params, undefined, true)
}

export async function getAdminStats() {
  const api = ContextFromStorage()
  return await api.get('api/admin/stats')
}

export async function adminInstances(options: AdminInstancesOptions) {
  const api = ContextFromStorage()
  return await api.getPaginated('api/admin/instances/list', { ...options })
}

export async function adminInstanceGet() {
  const api = ContextFromStorage()
  return await api.get('api/admin/instances/get')
}

export async function getDomainBlocks() {
  const api = ContextFromStorage()
  return await api.get('api/v1/domain_blocks')
}

export async function deleteStatusV1(id: string) {
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

export async function editPostMedia(id: string, description: string) {
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
  const api = ContextFromStorage()
  const res = await api.get('api/v1.1/discover/posts/network/trending')
  const accounts = removeDuplicateObjects(
    res.map((s) => s.account),
    ['id']
  )
  return {
    accounts: accounts,
    posts: res.filter((s) => s.pf_type === 'photo'),
  }
}

export async function postBookmark(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/statuses/${id}/bookmark`)
}

export async function postUnBookmark(id: string) {
  return await selfPost(`api/v1/statuses/${id}/unbookmark`)
}

export async function followHashtag(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/tags/${id}/follow`)
}

export async function unfollowHashtag(id: string) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', `api/v1/tags/${id}/unfollow`)
}

export async function getAdminConfig() {
  const api = ContextFromStorage()
  return await api.get('api/admin/config')
}

export async function updateAdminConfig(params) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', 'api/admin/config/update', params)
}

export async function getAdminUsers(cursor) {
  let url
  const instance = Storage.getString('app.instance')
  url = cursor != null ? cursor : `https://${instance}/api/admin/users/list?sort=desc`
  return await fetchCursorPagination(url)
}

export async function getAdminUser(user_id: string) {
  const api = ContextFromStorage()
  return await api.get('api/admin/users/get', { user_id })
}

export async function getModReports() {
  const api = ContextFromStorage()
  return await api.get('api/admin/mod-reports/list')
}

export async function getAutospamReports() {
  const api = ContextFromStorage()
  return await api.get('api/admin/autospam/list')
}

export async function postUserHandle(params) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', 'api/admin/users/action', params)
}

export async function postReportHandle(params) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', 'api/admin/mod-reports/handle', params)
}

export async function postAutospamHandle(params) {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', 'api/admin/autospam/handle', params)
}

export async function getStatusHistory(id: number) {
  const api = ContextFromStorage()
  return await api.get(`api/v1/statuses/${id}/history`)
}

export async function getMutualFollowing(userId: string) {
  const api = ContextFromStorage()
  return await api.get(`api/v1.1/accounts/mutuals/${userId}`)
}

export async function getSelfLikes(cursor?: string) {
  const api = ContextFromStorage()
  return await api.getPaginated('api/v1/favourites', { cursor })
}

export async function getSelfBookmarks(cursor?: string) {
  const api = ContextFromStorage()
  return await api.getPaginated('api/v1/bookmarks', { cursor })
}

export async function putEditPost(id: string, params) {
  let api = ContextFromStorage()
  return await api.jsonRequest('PUT', `api/v1/statuses/${id}`, params)
}

export async function getStoryCarousel() {
  const api = ContextFromStorage()
  return await api.get(`api/v1.1/stories/carousel`)
}

export async function pushNotificationSupported(): Promise<{ active: boolean }> {
  const api = ContextFromStorage()
  return await api.get(`api/v1.1/nag/state`)
}

export async function pushState(): Promise<PushState> {
  const api = ContextFromStorage()
  return await api.get('api/v1.1/push/state')
}

export async function pushStateDisable(): Promise<PushState> {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', 'api/v1.1/push/disable')
}

export async function pushStateCompare(
  params: PushStateCompareParams
): Promise<PushStateCompareResponse> {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', 'api/v1.1/push/compare', params)
}

export async function pushStateUpdate(
  params: PushStateParams
): Promise<PushStateResponse> {
  const api = ContextFromStorage()
  return await api.jsonRequest('POST', 'api/v1.1/push/update', params)
}
