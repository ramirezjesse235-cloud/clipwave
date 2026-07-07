// /api/generate-video.js
// Submits a text-to-video generation request via fal.ai (Kling v1.6 standard)
// Expects POST body: { prompt: "..." }
// Returns: { request_id: "..." }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt' in request body" });
  }

  const FAL_API_KEY = process.env.FAL_API_KEY;

  if (!FAL_API_KEY) {
    return res.status(500).json({ error: "Server is missing FAL_API_KEY" });
  }

  try {
    const response = await fetch(
      "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: "5",
          aspect_ratio: "9:16",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "fal.ai API error",
        details: data,
      });
    }

    const requestId = data?.request_id;

    if (!requestId) {
      return res.status(500).json({ error: "fal.ai did not return a request_id", details: data });
    }

    return res.status(200).json({ task_id: requestId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach fal.ai API", details: String(err) });
  }
}


