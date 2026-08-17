import { unzipSync } from 'fflate'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageExtension } from './detectImageExtension.ts'
import { downloadPhotosZip, PhotosZipBuildState } from './downloadPhotosZip.ts'

function webpBody(): ArrayBuffer {
  const bytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
  ])
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

function jsonNames(files: Record<string, Uint8Array>): string[] {
  return Object.keys(files).sort()
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('downloadPhotosZip', () => {
  it('собирает архив из удачных файлов и пропускает один сбой', async () => {
    vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/2.webp')) {
        return new Response(null, { status: 404 })
      }

      return new Response(webpBody(), {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' },
      })
    })

    const result = await downloadPhotosZip(
      604174866,
      [
        { number: 1, url: 'https://cdn.test/1.webp' },
        { number: 2, url: 'https://cdn.test/2.webp' },
        { number: 3, url: 'https://cdn.test/3.webp' },
      ],
      new AbortController().signal,
      () => undefined,
    )

    expect(result.state).toBe(PhotosZipBuildState.Ready)
    if (result.state !== PhotosZipBuildState.Ready) {
      return
    }

    expect(result.added).toBe(2)
    expect(
      [...result.mismatches].sort(
        (left, right) => left.photoNumber - right.photoNumber,
      ),
    ).toEqual([
      {
        photoNumber: 1,
        contentType: 'image/jpeg',
        signatureExtension: ImageExtension.Webp,
      },
      {
        photoNumber: 3,
        contentType: 'image/jpeg',
        signatureExtension: ImageExtension.Webp,
      },
    ])

    const files = unzipSync(result.zipBytes)
    expect(jsonNames(files)).toEqual(['604174866-01.webp', '604174866-03.webp'])
  })

  it('не отдаёт zip, если ни один файл не скачался', async () => {
    vi.stubGlobal('fetch', async () => new Response(null, { status: 404 }))

    const result = await downloadPhotosZip(
      1,
      [{ number: 1, url: 'https://cdn.test/1.webp' }],
      new AbortController().signal,
      () => undefined,
    )

    expect(result).toEqual({
      state: PhotosZipBuildState.Empty,
      mismatches: [],
    })
  })
})
