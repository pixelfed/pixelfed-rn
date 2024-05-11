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
  if (number < 1000) return number.toString() // Return the same number if less than 1000
  if (number < 1000000) {
    // Less than a million
    return (number / 1000).toFixed(number % 1000 === 0 ? 0 : 1) + 'K'
  }
  if (number < 1000000000) {
    // Less than a billion
    return (number / 1000000).toFixed(number % 1000000 === 0 ? 0 : 1) + 'M'
  }
  return (number / 1000000000).toFixed(number % 1000000000 === 0 ? 0 : 1) + 'B'
}
