import { loadFfmpeg } from './loadFfmpeg.ts'

function toFileBytes(bytes: Uint8Array): Uint8Array {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy
}

export async function muxTsToMp4(
  segments: readonly Uint8Array[],
): Promise<Uint8Array> {
  if (segments.length === 0) {
    throw new Error('Нет сегментов для сборки')
  }

  const ffmpeg = await loadFfmpeg()
  const listLines: string[] = []

  for (let index = 0; index < segments.length; index += 1) {
    const bytes = segments[index]
    if (bytes === undefined) {
      throw new Error(`Сегмент ${index} отсутствует`)
    }

    const name = `${index}.ts`
    await ffmpeg.writeFile(name, toFileBytes(bytes))
    listLines.push(`file '${name}'`)
  }

  await ffmpeg.writeFile('list.txt', listLines.join('\n'))

  const code = await ffmpeg.exec([
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    'list.txt',
    '-c',
    'copy',
    'out.mp4',
  ])

  if (code !== 0) {
    throw new Error(`ffmpeg завершился с кодом ${code}`)
  }

  const output = await ffmpeg.readFile('out.mp4')
  if (typeof output === 'string') {
    throw new Error('ffmpeg вернул текст вместо mp4')
  }

  return toFileBytes(output)
}
