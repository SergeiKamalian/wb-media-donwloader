import {
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'
import type { ImageTypeMismatch } from '../../features/download-media/detectImageExtension.ts'
import { PhotosZipState } from '../../features/download-media/useDownloadPhotosZip.ts'
import { PhotoTile } from './PhotoTile.tsx'

export type VisiblePhoto = {
  number: number
  url: string
}

type PhotoPickerModalProps = {
  opened: boolean
  title: string
  photos: readonly VisiblePhoto[]
  selected: ReadonlySet<number>
  isRangesLoading: boolean
  onClose: () => void
  onToggle: (photoNumber: number, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
  onPhotoError: (photoNumber: number) => void
  zipState: PhotosZipState
  zipCompleted: number
  zipTotal: number
  mismatches: readonly ImageTypeMismatch[]
  onDownloadPhotos: () => void
  videoPlaylistUrl: string | null
  videoNoteOpen: boolean
  onVideoClick: () => void
}

export function PhotoPickerModal({
  opened,
  title,
  photos,
  selected,
  isRangesLoading,
  onClose,
  onToggle,
  onToggleAll,
  onPhotoError,
  zipState,
  zipCompleted,
  zipTotal,
  mismatches,
  onDownloadPhotos,
  videoPlaylistUrl,
  videoNoteOpen,
  onVideoClick,
}: PhotoPickerModalProps) {
  const selectedCount = photos.filter((photo) =>
    selected.has(photo.number),
  ).length
  const visibleCount = photos.length
  const allSelected = visibleCount > 0 && selectedCount === visibleCount
  const someSelected = selectedCount > 0 && selectedCount < visibleCount

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="xl" centered>
      {isRangesLoading ? (
        <Loader />
      ) : (
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <Checkbox
              label="Выбрать все"
              checked={allSelected}
              indeterminate={someSelected}
              disabled={visibleCount === 0}
              onChange={(event) => {
                onToggleAll(event.currentTarget.checked)
              }}
            />
            <Text size="sm">
              Выбрано {selectedCount} из {visibleCount}
            </Text>
          </Group>

          {visibleCount === 0 ? (
            <Text>Нет доступных фотографий</Text>
          ) : (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {photos.map((photo) => (
                <PhotoTile
                  key={photo.number}
                  url={photo.url}
                  label={`Фото ${photo.number}`}
                  checked={selected.has(photo.number)}
                  onCheckedChange={(checked) => {
                    onToggle(photo.number, checked)
                  }}
                  onLoadError={() => {
                    onPhotoError(photo.number)
                  }}
                />
              ))}
            </SimpleGrid>
          )}

          {zipState === PhotosZipState.Running ? (
            <Stack gap="xs">
              <Progress
                value={zipTotal === 0 ? 0 : (zipCompleted / zipTotal) * 100}
              />
              <Text size="sm">
                Скачано {zipCompleted} из {zipTotal}
              </Text>
            </Stack>
          ) : null}

          {zipState === PhotosZipState.Empty ? (
            <Text>Не удалось скачать ни одной фотографии</Text>
          ) : null}

          {mismatches.length > 0 ? (
            <Text size="sm">
              Тип файла взят из сигнатуры, заголовок Content-Type не совпал:{' '}
              {mismatches
                .map(
                  (item) =>
                    `фото ${item.photoNumber} (${item.contentType} → ${item.signatureExtension})`,
                )
                .join('; ')}
            </Text>
          ) : null}

          {videoNoteOpen && videoPlaylistUrl !== null ? (
            <Text size="sm">
              Видео отдаётся плейлистом HLS с сегментами, одним файлом не
              скачивается, подробности в README. {videoPlaylistUrl}
            </Text>
          ) : null}

          <Group grow preventGrowOverflow wrap="wrap">
            <Button
              disabled={
                selectedCount === 0 || zipState === PhotosZipState.Running
              }
              onClick={onDownloadPhotos}
            >
              Скачать фото
            </Button>
            {videoPlaylistUrl !== null ? (
              <Button variant="default" onClick={onVideoClick}>
                Скачать видео
              </Button>
            ) : null}
          </Group>
        </Stack>
      )}
    </Modal>
  )
}
