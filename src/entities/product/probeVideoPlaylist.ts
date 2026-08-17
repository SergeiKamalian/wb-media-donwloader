export async function probeVideoPlaylist(url: string): Promise<boolean> {
  let response: Response

  try {
    response = await fetch(url, { method: 'HEAD' })
  } catch {
    return false
  }

  return response.ok
}
