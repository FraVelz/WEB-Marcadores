const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimitOrThrow(key: string, limitPerMin = Number(process.env.AGENT_RATE_LIMIT_PER_MIN || 120)): void {
  const now = Date.now()
  const windowMs = 60_000
  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }
  bucket.count += 1
  if (bucket.count > limitPerMin) {
    const err = new Error("Rate limit exceeded") as Error & { status: number; code: string }
    err.status = 429
    err.code = "rate_limited"
    throw err
  }
}
