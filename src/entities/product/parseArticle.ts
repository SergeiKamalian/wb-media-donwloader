export function parseArticle(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') {
    return null
  }

  if (!/^\d+$/.test(trimmed)) {
    return null
  }

  const article = Number(trimmed)
  if (!Number.isSafeInteger(article) || article <= 0) {
    return null
  }

  return article
}
