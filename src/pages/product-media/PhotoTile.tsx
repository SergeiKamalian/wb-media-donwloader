import { Checkbox, Image, Paper } from '@mantine/core'
import type { CSSProperties } from 'react'

type PhotoTileProps = {
  url: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onLoadError: () => void
}

const tileFrame: CSSProperties = {
  position: 'relative',
  aspectRatio: '1 / 1',
}

const tileImage: CSSProperties = {
  position: 'absolute',
  inset: 0,
}

const tileCheck: CSSProperties = {
  position: 'absolute',
  top: 'var(--mantine-spacing-xs)',
  right: 'var(--mantine-spacing-xs)',
  zIndex: 1,
  backgroundColor: 'var(--mantine-color-white)',
  padding: 'var(--mantine-spacing-xs)',
}

export function PhotoTile({
  url,
  label,
  checked,
  onCheckedChange,
  onLoadError,
}: PhotoTileProps) {
  return (
    <Paper withBorder style={tileFrame}>
      <Image
        src={url}
        alt={label}
        fit="contain"
        w="100%"
        h="100%"
        crossOrigin="anonymous"
        styles={{ root: tileImage }}
        onError={onLoadError}
      />
      <div style={tileCheck}>
        <Checkbox
          checked={checked}
          aria-label={label}
          onChange={(event) => {
            onCheckedChange(event.currentTarget.checked)
          }}
        />
      </div>
    </Paper>
  )
}
