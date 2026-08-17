import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const coreBaseUrl = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm'

let instance: FFmpeg | null = null
let loading: Promise<FFmpeg> | null = null

export async function loadFfmpeg(): Promise<FFmpeg> {
  if (instance !== null && instance.loaded) {
    return instance
  }

  if (loading !== null) {
    return loading
  }

  loading = (async () => {
    const ffmpeg = new FFmpeg()
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${coreBaseUrl}/ffmpeg-core.js`,
        'text/javascript',
      ),
      wasmURL: await toBlobURL(
        `${coreBaseUrl}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    })
    instance = ffmpeg
    return ffmpeg
  })()

  try {
    return await loading
  } finally {
    loading = null
  }
}
