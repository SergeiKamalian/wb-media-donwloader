import {
  Button,
  CopyButton,
  Group,
  Loader,
  Modal,
  Progress,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { VideoDownloadState } from '../../features/download-media/useDownloadVideoMp4.ts'

type VideoDownloadModalProps = {
  state: VideoDownloadState
  playlistUrl: string | null
  segmentCount: number
  completed: number
  error: string | null
  onStart: () => void
  onRetry: () => void
  onClose: () => void
}

export function VideoDownloadModal({
  state,
  playlistUrl,
  segmentCount,
  completed,
  error,
  onStart,
  onRetry,
  onClose,
}: VideoDownloadModalProps) {
  const opened = state !== VideoDownloadState.Closed
  const busy =
    state === VideoDownloadState.Downloading ||
    state === VideoDownloadState.Assembling

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Скачать видео"
      centered
      zIndex={400}
    >
      {state === VideoDownloadState.LoadingPlaylist ? <Loader /> : null}

      {state === VideoDownloadState.Confirm ||
      state === VideoDownloadState.Downloading ||
      state === VideoDownloadState.Assembling ? (
        <Stack gap="md">
          <Text>
            Видео отдаётся плейлистом, готового mp4 у Wildberries нет. Файл
            будет собран в браузере, это займёт время.
          </Text>
          <Text>Предстоит скачать сегментов: {segmentCount}</Text>
          {playlistUrl !== null ? (
            <CopyButton value={playlistUrl}>
              {({ copied, copy }) => (
                <TextInput
                  label="Плейлист"
                  value={playlistUrl}
                  readOnly
                  onClick={copy}
                  rightSection={
                    <Button variant="subtle" size="compact-xs" onClick={copy}>
                      {copied ? 'Скопировано' : 'Копировать'}
                    </Button>
                  }
                  rightSectionWidth={110}
                />
              )}
            </CopyButton>
          ) : null}

          {state === VideoDownloadState.Downloading ? (
            <Stack gap="xs">
              <Text size="sm">
                Скачивание сегментов: {completed} из {segmentCount}
              </Text>
              <Progress
                value={
                  segmentCount === 0 ? 0 : (completed / segmentCount) * 100
                }
              />
            </Stack>
          ) : null}

          {state === VideoDownloadState.Assembling ? (
            <Text size="sm">Идёт сборка mp4, без перекодирования</Text>
          ) : null}

          <Group grow preventGrowOverflow wrap="wrap">
            <Button variant="filled" onClick={onClose}>
              Отмена
            </Button>
            <Button
              variant="default"
              disabled={state !== VideoDownloadState.Confirm || busy}
              onClick={onStart}
            >
              Начать
            </Button>
          </Group>
        </Stack>
      ) : null}

      {state === VideoDownloadState.Error ? (
        <Stack gap="md">
          <Text>{error ?? 'Не удалось подготовить видео'}</Text>
          <Group grow>
            <Button variant="filled" onClick={onClose}>
              Закрыть
            </Button>
            <Button variant="default" onClick={onRetry}>
              Повторить
            </Button>
          </Group>
        </Stack>
      ) : null}
    </Modal>
  )
}
