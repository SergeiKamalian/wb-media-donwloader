import { describe, expect, it } from 'vitest'
import { detectImageExtension, ImageExtension } from './detectImageExtension.ts'

function webpBytes(): Uint8Array {
  const bytes = new Uint8Array(12)
  bytes.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])
  return bytes
}

describe('detectImageExtension', () => {
  it('читает webp по RIFF в начале и WEBP на позиции 8', () => {
    const detected = detectImageExtension(webpBytes(), 'image/webp', 1)

    expect(detected.extension).toBe(ImageExtension.Webp)
    expect(detected.mismatch).toBeNull()
  })

  it('верит сигнатуре, если Content-Type говорит другое', () => {
    const detected = detectImageExtension(webpBytes(), 'image/jpeg', 3)

    expect(detected.extension).toBe(ImageExtension.Webp)
    expect(detected.mismatch).toEqual({
      photoNumber: 3,
      contentType: 'image/jpeg',
      signatureExtension: ImageExtension.Webp,
    })
  })
})
