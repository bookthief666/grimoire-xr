export default async function handler(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
      })
    }

    // Temporary placeholder image (proves pipeline works)
    const url = `https://dummyimage.com/512x768/000/fff&text=${encodeURIComponent(
      prompt.slice(0, 40)
    )}`

    return new Response(
      JSON.stringify({
        url,
        status: "ready",
      }),
      { status: 200 }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Image generation failed" }),
      { status: 500 }
    )
  }
}
