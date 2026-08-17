import { describe, expect, it } from 'vitest'
import { mapWithConcurrency } from './mapWithConcurrency.ts'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe('mapWithConcurrency', () => {
  it('does not exceed the limit and processes every item', async () => {
    const items = [10, 20, 30, 40, 50, 60, 70]
    let current = 0
    let maxCurrent = 0

    const seen: number[] = []

    const result = await mapWithConcurrency(items, 3, async (item, index) => {
      current += 1
      maxCurrent = Math.max(maxCurrent, current)
      seen.push(item)
      await wait(15)
      current -= 1
      return item + index
    })

    expect(maxCurrent).toBeLessThanOrEqual(3)
    expect(seen).toHaveLength(items.length)
    expect([...seen].sort((left, right) => left - right)).toEqual(items)
    expect(result).toHaveLength(items.length)
    expect(result).toEqual([10, 21, 32, 43, 54, 65, 76])
  })
})
