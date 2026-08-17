import {
  Button,
  Container,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useState, type FormEvent } from 'react'
import { buildPhotoUrl } from '../../entities/product/buildPhotoUrl.ts'
import { parseArticle } from '../../entities/product/parseArticle.ts'
import {
  BasketRangesQueryState,
  useBasketRangesQuery,
} from '../../entities/product/useBasketRangesQuery.ts'
import {
  ProductCardQueryState,
  useProductCardQuery,
} from '../../entities/product/useProductCardQuery.ts'
import {
  VideoPlaylistQueryState,
  useVideoPlaylistQuery,
} from '../../entities/product/useVideoPlaylistQuery.ts'
import { useDownloadPhotosZip } from '../../features/download-media/useDownloadPhotosZip.ts'
import { useDownloadVideoMp4 } from '../../features/download-media/useDownloadVideoMp4.ts'
import { PhotoPickerModal, type VisiblePhoto } from './PhotoPickerModal.tsx'
import { VideoDownloadModal } from './VideoDownloadModal.tsx'

function collectVisiblePhotos(
  article: number,
  pics: number,
  ranges: Parameters<typeof buildPhotoUrl>[2],
  failed: ReadonlySet<number>,
): VisiblePhoto[] {
  const photos: VisiblePhoto[] = []

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

function allPhotoNumbers(pics: number): Set<number> {
  const numbers = new Set<number>()
  for (let photoNumber = 1; photoNumber <= pics; photoNumber += 1) {
    numbers.add(photoNumber)
  }
  return numbers
}

export function ProductMediaPage() {
  const [draft, setDraft] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [searchNonce, setSearchNonce] = useState(0)
  const [closedNonce, setClosedNonce] = useState(0)
  const [failed, setFailed] = useState<ReadonlySet<number>>(new Set())
  const [editedSelected, setEditedSelected] =
    useState<ReadonlySet<number> | null>(null)
  const card = useProductCardQuery(submitted)
  const ranges = useBasketRangesQuery()
  const zip = useDownloadPhotosZip()
  const videoDownload = useDownloadVideoMp4()
  const parsedDraft = parseArticle(draft)

  const mediaRanges =
    ranges.state === BasketRangesQueryState.Ready ||
    ranges.state === BasketRangesQueryState.Fallback
      ? ranges.media
      : null

  const videoRanges =
    ranges.state === BasketRangesQueryState.Ready ||
    ranges.state === BasketRangesQueryState.Fallback
      ? ranges.video
      : null

  const foundProduct =
    card.state === ProductCardQueryState.Found ? card.product : null

  const visiblePhotos =
    foundProduct !== null && mediaRanges !== null
      ? collectVisiblePhotos(
          foundProduct.id,
          foundProduct.pics,
          mediaRanges,
          failed,
        )
      : []

  const video = useVideoPlaylistQuery(
    foundProduct === null ? null : foundProduct.id,
    videoRanges,
  )

  const selected =
    editedSelected ??
    (foundProduct === null
      ? new Set<number>()
      : allPhotoNumbers(foundProduct.pics))

  const modalOpened =
    searchNonce > 0 &&
    searchNonce !== closedNonce &&
    card.state === ProductCardQueryState.Found

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (parsedDraft === null) {
      return
    }

    setSubmitted(draft.trim())
    setSearchNonce((current) => current + 1)
    setFailed(new Set())
    setEditedSelected(null)
    videoDownload.close()
  }

  function handleModalClose() {
    zip.reset()
    videoDownload.close()
    setClosedNonce(searchNonce)
    setFailed(new Set())
    setEditedSelected(null)
  }

  function handleDownloadPhotos() {
    if (foundProduct === null) {
      return
    }

    const selectedPhotos = visiblePhotos.filter((photo) =>
      selected.has(photo.number),
    )
    void zip.start(foundProduct.id, selectedPhotos)
  }

  function handleToggle(photoNumber: number, checked: boolean) {
    const next = new Set(selected)
    if (checked) {
      next.add(photoNumber)
    } else {
      next.delete(photoNumber)
    }
    setEditedSelected(next)
  }

  function handleToggleAll(checked: boolean) {
    if (checked) {
      setEditedSelected(new Set(visiblePhotos.map((photo) => photo.number)))
      return
    }

    setEditedSelected(new Set())
  }

  function handlePhotoError(photoNumber: number) {
    setFailed((current) => {
      const next = new Set(current)
      next.add(photoNumber)
      return next
    })
    setEditedSelected((current) => {
      const base = current ?? selected
      const next = new Set(base)
      next.delete(photoNumber)
      return next
    })
  }

  return (
    <Container size="sm" px="md" py="lg">
      <Stack gap="md">
        <Title order={1}>WB Media Downloader</Title>

        <form onSubmit={handleSearch}>
          <Stack gap="sm">
            <TextInput
              label="Артикул"
              placeholder="604174866"
              value={draft}
              inputMode="numeric"
              onChange={(event) => {
                setDraft(event.currentTarget.value)
              }}
            />
            <Button type="submit" disabled={parsedDraft === null} fullWidth>
              Показать фото
            </Button>
          </Stack>
        </form>

        {card.state === ProductCardQueryState.Loading ? <Loader /> : null}

        {card.state === ProductCardQueryState.NotFound ? (
          <Text>Такого артикула нет</Text>
        ) : null}

        {card.state === ProductCardQueryState.Error ? (
          <Stack gap="sm">
            <Text>{card.error.message}</Text>
            <Button variant="default" onClick={card.retry}>
              Повторить
            </Button>
          </Stack>
        ) : null}

        {foundProduct !== null ? (
          <PhotoPickerModal
            opened={modalOpened}
            title={foundProduct.name}
            photos={visiblePhotos}
            selected={selected}
            isRangesLoading={ranges.state === BasketRangesQueryState.Loading}
            onClose={handleModalClose}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            onPhotoError={handlePhotoError}
            zipState={zip.state}
            zipCompleted={zip.completed}
            zipTotal={zip.total}
            mismatches={zip.mismatches}
            onDownloadPhotos={handleDownloadPhotos}
            videoPlaylistUrl={
              video.state === VideoPlaylistQueryState.Available
                ? video.url
                : null
            }
            onVideoClick={() => {
              if (foundProduct === null) {
                return
              }
              if (video.state !== VideoPlaylistQueryState.Available) {
                return
              }
              videoDownload.open(foundProduct.id, video.url)
            }}
          />
        ) : null}

        <VideoDownloadModal
          state={videoDownload.state}
          playlistUrl={videoDownload.playlistUrl}
          segmentCount={videoDownload.segmentCount}
          completed={videoDownload.completed}
          error={videoDownload.error}
          onStart={videoDownload.start}
          onRetry={videoDownload.retry}
          onClose={videoDownload.close}
        />
      </Stack>
    </Container>
  )
}
