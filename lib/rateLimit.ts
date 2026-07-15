import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface LimitResult {
  success: boolean
  remaining: number
  reset: number
}

function createInMemoryLimiter() {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return {
    async limit(ip: string): Promise<LimitResult> {
      const now = Date.now()
      const entry = hits.get(ip)

      if (!entry || now > entry.resetAt) {
        const resetAt = now + 24 * 60 * 60 * 1000
        hits.set(ip, { count: 1, resetAt })
        return { success: true, remaining: 4, reset: Math.ceil(resetAt / 1000) }
      }

      entry.count += 1
      if (entry.count > 5) {
        return { success: false, remaining: 0, reset: Math.ceil(entry.resetAt / 1000) }
      }

      return { success: true, remaining: 5 - entry.count, reset: Math.ceil(entry.resetAt / 1000) }
    },
  }
}

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const limiter = hasRedis
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '24h'),
      analytics: true,
      prefix: 'mark:scan',
    })
  : createInMemoryLimiter()

export async function checkRateLimit(ip: string): Promise<LimitResult> {
  const result = await limiter.limit(ip)
  return { success: result.success, remaining: result.remaining, reset: result.reset }
}
