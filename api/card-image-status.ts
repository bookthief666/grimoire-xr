/// <reference types="node" />
type NodeApiRequest = {
  method?: string
  query?: Record<string, string | string[] | undefined>
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

async function imageToDataUrl(url: string, headers: Record<string, string>) {
  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`ComfyUI image fetch failed: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || 'image/png'
  const buffer = Buffer.from(await response.arrayBuffer())
  return `data:${contentType};base64,${buffer.toString('base64')}`
}

export default async function handler(req: NodeApiRequest, res: NodeApiResponse) {
  res.setHeader?.('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

  const promptIdRaw = req.query?.promptId ?? req.query?.id
  const promptId = Array.isArray(promptIdRaw) ? promptIdRaw[0] : promptIdRaw

  if (!promptId) {
    return res.status(400).json({ ok: false, error: 'Missing promptId.' })
  }

  const baseUrl = (process.env.COMFYUI_BASE_URL || 'http://127.0.0.1:8188').replace(/\/+$/, '')
  const headers = comfyHeaders()

  try {
    const historyResponse = await fetch(`${baseUrl}/history/${encodeURIComponent(promptId)}`, {
      headers,
    })

    if (!historyResponse.ok) {
      return res.status(502).json({
        ok: false,
        error: `ComfyUI history failed: ${historyResponse.status}`,
      })
    }

    const history = await historyResponse.json() as Record<string, any>
    const entry = history[promptId]

    if (!entry?.outputs) {
      return res.status(200).json({
        ok: true,
        status: 'processing',
        provider: 'comfyui',
      })
    }

    const outputs = Object.values(entry.outputs) as Array<{ images?: Array<{ filename: string; subfolder?: string; type?: string }> }>

    for (const output of outputs) {
      const image = output.images?.[0]
      if (!image) continue

      const params = new URLSearchParams({
        filename: image.filename,
        subfolder: image.subfolder || '',
        type: image.type || 'output',
      })

      const imageUrl = await imageToDataUrl(`${baseUrl}/view?${params.toString()}`, headers)

      return res.status(200).json({
        ok: true,
        status: 'ready',
        provider: 'comfyui',
        imageUrl,
      })
    }

    return res.status(200).json({
      ok: true,
      status: 'processing',
      provider: 'comfyui',
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown ComfyUI status failure.',
    })
  }
}
