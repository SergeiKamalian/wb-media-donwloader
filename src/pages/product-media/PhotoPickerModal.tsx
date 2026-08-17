import {
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'
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
}: PhotoPickerModalProps) {
  const selectedCount = photos.filter((photo) => selected.has(photo.number)).length
  const visibleCount = photos.length
  const allSelected = visibleCount > 0 && selectedCount === visibleCount
  const someSelected = selectedCount > 0 && selectedCount < visibleCount

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="xl"
      centered
    >
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

          <Group grow preventGrowOverflow wrap="wrap">
            <Button disabled={selectedCount === 0}>Скачать фото</Button>
            <Button variant="default">Скачать видео</Button>
          </Group>
        </Stack>
      )}
    </Modal>
  )
}
