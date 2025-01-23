/** Date string like 2025-01-01T10:34:12.000000Z */
export type Timestamp = string

export type Visibility = 'public' | 'unlisted' | 'private' | 'direct' | 'draft'

export type Application = {}

export type MediaAttachment = {}

export type Mention = {}

export type Tag = {}

export type CustomEmoji = {}

export type PreviewCard = {}

export type Poll = {}

export type Relationship = {
  blocking: boolean
  domain_blocking
  endorsed: boolean
  followed_by?
  following
  following_since
  id
  muting
  muting_notifications
  requested
  showing_reblogs
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

export type PaginatedStatus = {
  data: Array<Status>,
  nextPage: string | undefined,
  prevPage: string | undefined
}

export type Status = {
  id: string,
  created_at: Timestamp,
  in_reply_to_id: string | null,
  in_reply_to_account_id: string | null,
  sensitive: boolean,
  spoiler_text: string,
  visibility: Visibility,
  language: string | null,
  uri: string,
  url: string | null,
  replies_count: number,
  reblogs_count: number,
  favourites_count: number,
  edited_at: Timestamp | null,
  favourited: boolean | undefined,
  reblogged: boolean | undefined,
  muted: boolean | undefined,
  bookmarked: boolean | undefined,
  pinned: boolean | undefined,
  filtered: boolean | undefined,
  content: string,
  reblog: Status | null,
  application: Application | undefined,
  account: Account,
  media_attachments: Array<MediaAttachment>,
  mentions: Array<Mention>,
  tags: Array<Tag>,
  emojis: Array<CustomEmoji>,
  card: Array<PreviewCard>,
  poll: Poll | null
}
