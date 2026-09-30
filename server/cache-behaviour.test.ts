import { describe, expect, it } from 'vitest'
import { cachedSource } from './mission-control.js'

// Guards stale-while-revalidate: a warm cache must answer without waiting for the collector, and
// the refresh must still happen in the background so the data does not stay stale forever.

describe('stale-while-revalidate cache', () => {
  it('answers from the warm cache immediately while refreshing in the background', async () => {
    let calls = 0
    let resolveSecond: (value: string) => void = () => undefined

    const get = cachedSource(() => {
      calls += 1
      if (calls === 1) return Promise.resolve('first')
      return new Promise<string>((resolve) => { resolveSecond = resolve })
    }, 1_000)

    // Cold: waits for the first read, because there is nothing honest to show yet.
    expect(await get(Date.now())).toBe('first')
    expect(calls).toBe(1)

    // Warm but expired: returns the previous value at once, without awaiting the collector.
    const warm = await get(Date.now() + 5_000)
    expect(warm).toBe('first')
    expect(calls).toBe(2)

    // The background refresh still lands, so the next read sees fresh data.
    resolveSecond('second')
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(await get(Date.now() + 5_000)).toBe('second')
  })

  it('does not cache a failed read as a value', async () => {
    let calls = 0
    const get = cachedSource(() => {
      calls += 1
      return Promise.reject(new Error('cli failed'))
    }, 1_000)
    await expect(get(Date.now())).rejects.toThrow('cli failed')
    // A failure leaves the cache empty, so the next call retries instead of serving an error object.
    await expect(get(Date.now())).rejects.toThrow('cli failed')
    expect(calls).toBe(2)
  })
})
