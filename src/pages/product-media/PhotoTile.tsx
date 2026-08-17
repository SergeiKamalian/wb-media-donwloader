import { Checkbox, Image, Paper, Stack } from '@mantine/core'

type PhotoTileProps = {
  url: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onLoadError: () => void
}

export function PhotoTile({
  url,
  label,
  checked,
  onCheckedChange,
  onLoadError,
}: PhotoTileProps) {
  return (
    <Paper withBorder p="xs">
      <Stack gap="xs">
        <Image
          src={url}
          alt={label}
          loading="lazy"
          radius="sm"
          onError={onLoadError}
        />
        <Checkbox
          checked={checked}
          label={label}
          onChange={(event) => {
            onCheckedChange(event.currentTarget.checked)
          }}
        />
      </Stack>
    </Paper>
  )
}
