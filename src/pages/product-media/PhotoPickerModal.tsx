import {
  Box,
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
import { VideoTile } from './VideoTile.tsx'

type VisiblePhoto = {
  number: number
  url: string
}

type PhotoPickerModalProps = {
  opened: boolean
  title: string
  article: number
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
  videoPreviewUrl: string | null
  onVideoClick: () => void
}

export function PhotoPickerModal({
  opened,
  title,
  article,
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
  videoPreviewUrl,
  onVideoClick,
}: PhotoPickerModalProps) {
  const selectedCount = photos.filter((photo) =>
    selected.has(photo.number),
  ).length
  const visibleCount = photos.length
  const allSelected = visibleCount > 0 && selectedCount === visibleCount
  const someSelected = selectedCount > 0 && selectedCount < visibleCount

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={0}>
          <Text fw="bold">{title}</Text>
          <Text size="sm" c="dimmed">
            {article}
          </Text>
        </Stack>
      }
      size="xl"
      centered
    >
      {isRangesLoading ? (
        <Loader />
      ) : (
        <Stack gap="lg">
          <Stack gap="md">
            <Group gap="sm" wrap="wrap">
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
              <SimpleGrid cols={{ base: 2, sm: 4, md: 5, lg: 6 }} spacing="sm">
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

            <Button
              disabled={
                selectedCount === 0 || zipState === PhotosZipState.Running
              }
              onClick={onDownloadPhotos}
            >
              Скачать фото
            </Button>
          </Stack>

          {videoPreviewUrl !== null ? (
            <Group align="center" wrap="wrap" gap="md">
              <Box w={{ base: '50%', sm: '25%', md: '20%', lg: '16.66%' }}>
                <VideoTile previewUrl={videoPreviewUrl} />
              </Box>
              <Button color="wbAccent" variant="light" onClick={onVideoClick}>
                Скачать видео
              </Button>
            </Group>
          ) : null}
        </Stack>
      )}
    </Modal>
  )
}
