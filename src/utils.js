import * as WebBrowser from 'expo-web-browser'

export const openBrowserAsync = async (url) => {
  await WebBrowser.openBrowserAsync(url, {
    toolbarColor: '#000000',
    enableBarCollapsing: true,
    dismissButtonStyle: 'close',
    presentationStyle: 'popover',
  })
}

export function formatTimestamp(iso8601String) {
  const now = new Date()
  const timestamp = new Date(iso8601String)
  const diffInSeconds = Math.floor((now - timestamp) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)

  // Formatting for less than 24 hours
  if (diffInHours < 24) {
    if (diffInHours > 0) {
      return `${diffInHours}h ago`
    }
    if (diffInMinutes > 0) {
      return `${diffInMinutes}m ago`
    }
    return `Just now`
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const year = timestamp.getFullYear()
  const month = monthNames[timestamp.getMonth()]
  const day = timestamp.getDate()

  return `${month} ${day}, ${year}`
}

export function formatTimestampMonthYear(iso8601String) {
  const now = new Date()
  const timestamp = new Date(iso8601String)

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const year = timestamp.getFullYear()
  const month = monthNames[timestamp.getMonth()]

  return `${month} ${year}`
}

export function _timeAgo(ts) {
  let date = Date.parse(ts)
  let seconds = Math.floor((new Date() - date) / 1000)
  let interval = Math.floor(seconds / 63072000)
  if (interval < 0) {
    return '0s'
  }
  if (interval >= 1) {
    return interval + 'y'
  }
  interval = Math.floor(seconds / 604800)
  if (interval >= 1) {
    return interval + 'w'
  }
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return interval + 'd'
  }
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return interval + 'h'
  }
  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return interval + 'm'
  }
  return Math.floor(seconds) + 's'
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

export function prettyCount(number) {
  if (!number) {
    return 0
  }
  if (number < 1000) return number
  if (number < 1000000) {
    return (number / 1000).toFixed(number % 1000 === 0 ? 0 : 1) + 'K'
  }
  if (number < 1000000000) {
    return (number / 1000000).toFixed(number % 1000000 === 0 ? 0 : 1) + 'M'
  }
  return (number / 1000000000).toFixed(number % 1000000000 === 0 ? 0 : 1) + 'B'
}

export function likeCountLabel(number) {
  if (!number) {
    return ''
  }

  if (number == 1) {
    return '1 Like'
  }

  return `${prettyCount(number)} Likes`
}

export function postCountLabel(number) {
  if (!number) {
    return '0 Posts'
  }

  if (number == 1) {
    return '1 Post'
  }

  return `${prettyCount(number)} Posts`
}

export function enforceLen(str, len, ellipsis = false, mode = 'end') {
  str = str || ''
  if (str.length > len) {
    if (ellipsis && mode === 'end') {
      return str.slice(0, len) + '…'
    }
    if (ellipsis && mode === 'middle') {
      const half = Math.floor(len / 2)
      return str.slice(0, half) + '…' + str.slice(-half)
    }
    return str.slice(0, len)
  }
  return str
}

export function htmlToTextWithLineBreaks(html) {
  if (!html || !html.length) {
    return html
  }
  html = html.replaceAll('&#39;', "'")
  html = html.replaceAll('&amp;', '&')
  html = html.replaceAll(/<\/p>/gi, '\n')
  html = html.replaceAll(/<p[^>]*>/gi, '')
  html = html.replaceAll(/<[^>]+>/gi, '')
  return html.trim()
}

export function extractMainVersion(version) {
  const regex = /^(\d+\.\d+\.\d+)/
  const match = version.match(regex)
  if (match) {
    return match[1]
  }
  return null
}

export function compareSemver(version1, version2) {
  const parseVersion = (version) => {
    const mainVersion = extractMainVersion(version)
    return mainVersion ? mainVersion.split('.').map(Number) : [0, 0, 0]
  }

  const [major1, minor1, patch1] = parseVersion(version1)
  const [major2, minor2, patch2] = parseVersion(version2)

  if (major1 > major2) return 1
  if (major1 < major2) return -1

  if (minor1 > minor2) return 1
  if (minor1 < minor2) return -1

  if (patch1 > patch2) return 1
  if (patch1 < patch2) return -1

  return 0
}
