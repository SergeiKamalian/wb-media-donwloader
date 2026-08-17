export enum ImageExtension {
  Webp = 'webp',
  Jpeg = 'jpg',
  Png = 'png',
  Gif = 'gif',
  Bin = 'bin',
}

export type ImageTypeMismatch = {
  photoNumber: number
  contentType: string
  signatureExtension: ImageExtension
}

function byteAt(bytes: Uint8Array, index: number, expected: number): boolean {
  return bytes[index] === expected
}

function extensionFromSignature(bytes: Uint8Array): ImageExtension | null {
  if (
    bytes.length >= 12 &&
    byteAt(bytes, 0, 0x52) &&
    byteAt(bytes, 1, 0x49) &&
    byteAt(bytes, 2, 0x46) &&
    byteAt(bytes, 3, 0x46) &&
    byteAt(bytes, 8, 0x57) &&
    byteAt(bytes, 9, 0x45) &&
    byteAt(bytes, 10, 0x42) &&
    byteAt(bytes, 11, 0x50)
  ) {
    return ImageExtension.Webp
  }

  if (
    bytes.length >= 3 &&
    byteAt(bytes, 0, 0xff) &&
    byteAt(bytes, 1, 0xd8) &&
    byteAt(bytes, 2, 0xff)
  ) {
    return ImageExtension.Jpeg
  }

  if (
    bytes.length >= 4 &&
    byteAt(bytes, 0, 0x89) &&
    byteAt(bytes, 1, 0x50) &&
    byteAt(bytes, 2, 0x4e) &&
    byteAt(bytes, 3, 0x47)
  ) {
    return ImageExtension.Png
  }

  if (
    bytes.length >= 4 &&
    byteAt(bytes, 0, 0x47) &&
    byteAt(bytes, 1, 0x49) &&
    byteAt(bytes, 2, 0x46) &&
    byteAt(bytes, 3, 0x38)
  ) {
    return ImageExtension.Gif
  }

  return null
}

function extensionFromContentType(contentType: string): ImageExtension | null {
  const mime = contentType.split(';')[0]?.trim().toLowerCase()
  if (mime === 'image/webp') {
    return ImageExtension.Webp
  }
  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    return ImageExtension.Jpeg
  }
  if (mime === 'image/png') {
    return ImageExtension.Png
  }
  if (mime === 'image/gif') {
    return ImageExtension.Gif
  }
  return null
}

export function detectImageExtension(
  bytes: Uint8Array,
  contentType: string | null,
  photoNumber: number,
): { extension: ImageExtension; mismatch: ImageTypeMismatch | null } {
  const fromSignature = extensionFromSignature(bytes)
  const fromHeader =
    contentType === null ? null : extensionFromContentType(contentType)

  if (fromSignature !== null) {
    if (fromHeader !== null && fromHeader !== fromSignature) {
      return {
        extension: fromSignature,
        mismatch: {
          photoNumber,
          contentType: contentType ?? '',
          signatureExtension: fromSignature,
        },
      }
    }

    return { extension: fromSignature, mismatch: null }
  }

  if (fromHeader !== null) {
    return { extension: fromHeader, mismatch: null }
  }

  return { extension: ImageExtension.Bin, mismatch: null }
}
