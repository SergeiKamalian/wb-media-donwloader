export function parsePlaylistSegments(
  text: string,
  playlistUrl: string,
): string[] {
  const urls: string[] = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line === '' || line.startsWith('#')) {
      continue
    }

    urls.push(new URL(line, playlistUrl).href)
  }

  return urls
}
