/// <reference types="node" />
type NodeApiRequest = {
  method?: string
}

type NodeApiResponse = {
  setHeader?: (name: string, value: string) => void
  status: (statusCode: number) => NodeApiResponse
  json: (body: unknown) => void
}

function comfyHeaders() {
  const headers: Record<string, string> = {}

  const cfId = process.env.COMFYUI_CF_ACCESS_CLIENT_ID
  const cfSecret = process.env.COMFYUI_CF_ACCESS_CLIENT_SECRET

  if (cfId && cfSecret) {
    headers['CF-Access-Client-Id'] = cfId
    headers['CF-Access-Client-Secret'] = cfSecret
  }

  return headers
}

export default async function handler(req: NodeApiRequest, res: NodeApiResponse) {
  res.setHeader?.('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' })
  }

  const baseUrl = (process.env.COMFYUI_BASE_URL || 'http://127.0.0.1:8188').replace(/\/+$/, '')
  const configuredCheckpoint =
    process.env.COMFYUI_CHECKPOINT_DEFAULT || 'juggernautXL_ragnarokBy.safetensors'
  const headers = comfyHeaders()

  try {
    const [statsResponse, modelsResponse] = await Promise.all([
      fetch(`${baseUrl}/system_stats`, { headers }),
      fetch(`${baseUrl}/models/checkpoints`, { headers }),
    ])

    if (!statsResponse.ok || !modelsResponse.ok) {
      return res.status(502).json({
        ok: false,
        provider: 'comfyui',
        error: `ComfyUI health check failed (stats ${statsResponse.status}, models ${modelsResponse.status}).`,
      })
    }

    const stats = await statsResponse.json() as Record<string, any>
    const models = await modelsResponse.json() as unknown
    const checkpointModels = Array.isArray(models)
      ? models.filter((value): value is string => typeof value === 'string')
      : []

    return res.status(200).json({
      ok: true,
      provider: 'comfyui',
      comfyuiVersion:
        typeof stats?.system?.comfyui_version === 'string'
          ? stats.system.comfyui_version
          : undefined,
      configuredCheckpoint,
      checkpointAvailable: checkpointModels.includes(configuredCheckpoint),
      models: checkpointModels,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown ComfyUI health failure.'

    return res.status(502).json({
      ok: false,
      provider: 'comfyui',
      error: message,
    })
  }
}
