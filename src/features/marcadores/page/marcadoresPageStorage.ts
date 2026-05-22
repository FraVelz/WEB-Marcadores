export function makeDeskLibWinId(): string {
  return `lib-${crypto.randomUUID().slice(0, 10)}`
}
