import { describe, expect, it } from 'vitest'
import { createConcurrencyGate } from './mission-control.js'

describe('CLI concurrency gate', () => {
  it('never runs more than the configured limit at the same time', async () => {
    const gate = createConcurrencyGate(3)
    let active = 0
    let peak = 0
    const release: (() => void)[] = []

    const tasks = Array.from({ length: 10 }, (_, i) =>
      gate(async () => {
        active += 1
        peak = Math.max(peak, active)
        await new Promise<void>((resolve) => release.push(resolve))
        active -= 1
        return i
      }),
    )

    // Wait for the gate to schedule all it can
    await new Promise((resolve) => setTimeout(resolve, 15))

    expect(peak).toBe(3)
    expect(active).toBe(3)
    expect(release.length).toBe(3)

    // Release one by one and check invariant
    while (release.length > 0) {
      const fn = release.shift()
      fn?.()
      await new Promise((resolve) => setTimeout(resolve, 5))
      expect(active).toBeLessThanOrEqual(3)
    }

    const results = await Promise.all(tasks)
    expect(results).toHaveLength(10)
    expect(peak).toBe(3)
    expect(active).toBe(0)
  })

  it('releases slot even when the task throws an error', async () => {
    const gate = createConcurrencyGate(2)

    const failingTask = gate(async () => {
      throw new Error('boom')
    }).catch(() => 'caught')

    await failingTask

    let secondRan = false
    await gate(async () => {
      secondRan = true
      return 'ok'
    })

    expect(secondRan).toBe(true)
  })
})
