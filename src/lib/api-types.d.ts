/* ============================= MastoAPI Types ============================= */

/* Date string like 2025-01-01T10:34:12.000000Z */
export type Timestamp = string

export type Visibility = 'public' | 'unlisted' | 'private' | 'direct' | 'draft'

export type MediaType = 'unknown' | 'image' | 'gifv' | 'video' | 'audio'

export type PreviewCardType = 'link' | 'photo' | 'video' | 'rich'

export type Application = {
  name: string
  website: string | undefined
  scopes: Array<string>
  redirect_uris: Array<string>
  // Deprecated:
  redirect_uri: string | undefined
  vapid_key: string | undefined
}

export type MediaAttachment = {
  id: string
  type: MediaType
  url: string
  preview_url: string | null
  remote_url: string | null
  meta: MediaMetadata
  description: string | null
  blurhash: string | null
  // Deprecated:
  text_url: string | undefined
}

export type MediaMetadata = any // TODO

export type Mention = {
  id: string
  username: string
  url: string
  acct: string
}

export type Tag = {
  name: string
  url: string
}

export type CustomEmoji = {
  shortcode: string
  url: string
  static_url: string
  visible_in_picker: boolean
  category: string | null
}

export type PreviewCard = {
  url: string
  title: string
  description: string
  type: PreviewCardType
  authors: Array<PreviewCardAuthor>
  author_name: string
  author_url: string
  provider_name: string
  provider_url: string
  html: string
  width: number
  height: number
  image: string | null
  embed_url: string
  blurhash: string | null
}

export type PreviewCardAuthor = {
  name: string
  url: string
  account: Account | null
}

export type Poll = {
  id: string
  expires_at: Timestamp | null
  expired: boolean
  multiple: boolean
  votes_count: number
  voters_count: number | null
  options: PollOptions
  emojis: Array<CustomEmoji>
  voted: boolean
  own_votes: Array<number>
}

export type PollOptions = {
  title: string
  votes_count: number | null
}

export type Relationship = {
  blocking: boolean
  domain_blocking
  endorsed: boolean
  followed_by?: boolean
  following: boolean
  following_since
  id
  muting: boolean
  muting_notifications
  requested: boolean
  showing_reblogs
}

export type RelationshipFromFollowAPIResponse = {
  blocking: boolean
  domain_blocking: any | null
  endorsed: boolean
  followed_by?: boolean
  following: boolean
  id: string
  muting: boolean
  muting_notifications: any | null
  requested: boolean
  showing_reblogs: any | null
}

export type Account = {
  /** value is username */
  acct: string
  avatar: string
  created_at: Timestamp
  discoverable: boolean
  display_name: string
  followers_count: number
  following_count: number
  header_bg: string | null
  id: string
  is_admin: boolean
  last_fetched_at: null
  local //: true,
  location // : null
  locked: boolean
  /** bio */
  note: string
  /** bio */
  note_text: string
  pronouns: string[]
  source: LoginUserSource
  /** url of profile, for pixelfed: https://<instance>/<username> */
  url: string
  username: string
  website: string
}

/** this is saved */
export interface LoginUserResponse extends Account {
  statuses_count: number
  settings: LoginUserSettings
}

export type LoginUserSettings = {
  crawlable: boolean
  disable_embeds: boolean
  high_contrast_mode: boolean
  indexable: boolean
  is_suggestable: boolean
  media_descriptions: boolean
  public_dm: boolean
  reduce_motion: boolean
  show_atom: boolean
  show_profile_follower_count: boolean
  show_profile_following_count: boolean
  video_autoplay: boolean
}

export type LoginUserSource = {
  privacy: Visibility
  sensitive: boolean
  /** language code like 'en' */
  language: string
  /** bio */
  note: string
  fields: any[]
}

export type Status = {
  id: string
  created_at: Timestamp
  in_reply_to_id: string | null
  in_reply_to_account_id: string | null
  sensitive: boolean
  spoiler_text: string
  visibility: Visibility
  language: string | null
  uri: string
  url: string | null
  replies_count: number
  reblogs_count: number
  favourites_count: number
  edited_at: Timestamp | null
  favourited: boolean | undefined
  liked_at: Timestamp | null
  reblogged: boolean | undefined
  muted: boolean | undefined
  bookmarked: boolean | undefined
  pinned: boolean | undefined
  filtered: boolean | undefined
  content: string
  reblog: Status | null
  application: Application | undefined
  account: Account
  media_attachments: Array<MediaAttachment>
  mentions: Array<Mention>
  tags: Array<Tag>
  emojis: Array<CustomEmoji>
  card: Array<PreviewCard>
  poll: Poll | null
  local: boolean | undefined
  liked_by: StatusLikedBy | null
  pf_type: string | undefined
}

export type StatusLikedBy = {
  id: string
  others: boolean
  total_count: number
  total_count_pretty: number
  url: string
  username: string
}

type UpdateCredentialsParams = {
  bio: string
  website: string
  display_name: string
  note: string
  avatar
  locked: boolean
  show_profile_follower_count: boolean
  show_profile_following_count: boolean
  crawlable: boolean
  public_dm: boolean
  disable_embeds: boolean
  show_atom: boolean
  is_suggestable: boolean
}

/* ========================== Infinite query types ========================== */

export type PaginatedStatus = {
  data: Array<Status>
  nextPage: string | undefined
  prevPage: string | undefined
}
