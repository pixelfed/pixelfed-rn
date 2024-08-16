declare module '*.png'
declare module '*.gif'

declare interface Keyframe {
  composite?: 'accumulate' | 'add' | 'auto' | 'replace'
  easing?: string
  offset?: number | null
  [property: string]: string | number | null | undefined
}
