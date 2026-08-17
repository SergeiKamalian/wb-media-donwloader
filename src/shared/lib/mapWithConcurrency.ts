export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (limit < 1) {
    throw new Error('Лимит параллельности должен быть не меньше 1')
  }

  if (items.length === 0) {
    return []
  }

  const results: R[] = Array.from({ length: items.length })
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      const item = items[index]
      if (item === undefined) {
        continue
      }
      results[index] = await mapper(item, index)
    }
  }

  const workerCount = Math.min(limit, items.length)
  const workers: Array<Promise<void>> = []
  for (let workerIndex = 0; workerIndex < workerCount; workerIndex += 1) {
    workers.push(worker())
  }

  await Promise.all(workers)
  return results
}
