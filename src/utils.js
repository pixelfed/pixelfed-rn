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
