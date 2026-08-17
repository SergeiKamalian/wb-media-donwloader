import { Badge, Center, Image, Paper, ThemeIcon } from '@mantine/core'
import { useState, type CSSProperties } from 'react'

type VideoTileProps = {
  previewUrl: string
}

const tileFrame: CSSProperties = {
  position: 'relative',
  aspectRatio: '1 / 1',
}

const tileImage: CSSProperties = {
  position: 'absolute',
  inset: 0,
}

const tileBadge: CSSProperties = {
  position: 'absolute',
  bottom: 'var(--mantine-spacing-xs)',
  left: 'var(--mantine-spacing-xs)',
  zIndex: 1,
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export function VideoTile({ previewUrl }: VideoTileProps) {
  const [previewFailed, setPreviewFailed] = useState(false)

  return (
    <Paper withBorder w="100%" style={tileFrame}>
      {previewFailed ? (
        <Center h="100%" w="100%" bg="wbAccent.0">
          <ThemeIcon size="lg" radius="xl" color="wbAccent" variant="filled">
            <PlayIcon />
          </ThemeIcon>
        </Center>
      ) : (
        <Image
          src={previewUrl}
          alt="Видео"
          fit="contain"
          w="100%"
          h="100%"
          crossOrigin="anonymous"
          styles={{ root: tileImage }}
          onError={() => {
            setPreviewFailed(true)
          }}
        />
      )}
      <Badge color="wbAccent" style={tileBadge}>
        Видео
      </Badge>
    </Paper>
  )
}
