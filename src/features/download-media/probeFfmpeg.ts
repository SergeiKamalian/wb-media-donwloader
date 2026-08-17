import { loadFfmpeg } from './loadFfmpeg.ts'

export type FfmpegProbeResult =
  | { ok: true; isolated: boolean }
  | { ok: false; isolated: boolean; error: string }

export async function probeFfmpeg(): Promise<FfmpegProbeResult> {
  const isolated = globalThis.crossOriginIsolated === true

  try {
    await loadFfmpeg()
    return { ok: true, isolated }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Неизвестная ошибка ffmpeg'
    return { ok: false, isolated, error: message }
  }
}
