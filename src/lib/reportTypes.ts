export type ReportType = { name: string; title: string }

export const reportTypes: ReportType[] = [
  { name: 'spam', title: "It's spam" },
  { name: 'sensitive', title: 'Nudity or sexual activity' },
  { name: 'abusive', title: 'Bullying or harassment' },
  { name: 'underage', title: 'I think this account is underage' },
  { name: 'violence', title: 'Violence or dangerous organizations' },
  { name: 'copyright', title: 'Copyright infringement' },
  { name: 'impersonation', title: 'Impersonation' },
  { name: 'scam', title: 'Scam or fraud' },
  { name: 'terrorism', title: 'Terrorism or terrorism-related content' },
]
