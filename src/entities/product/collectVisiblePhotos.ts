import { type BasketRange } from './basketRanges.ts'
import { buildPhotoUrl } from './buildPhotoUrl.ts'

type ProductPhoto = {
  number: number
  url: string
}

export function collectVisiblePhotos(
  article: number,
  pics: number,
  ranges: readonly BasketRange[],
  failed: ReadonlySet<number>,
): ProductPhoto[] {
  const photos: ProductPhoto[] = []

  for (let photoNumber = 1; photoNumber <= pics; photoNumber += 1) {
    if (failed.has(photoNumber)) {
      continue
    }

    try {
      photos.push({
        number: photoNumber,
        url: buildPhotoUrl(article, photoNumber, ranges),
      })
    } catch {
      continue
    }
  }

  return photos
}
