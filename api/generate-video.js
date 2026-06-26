// /api/generate-video.js
// Submits a text-to-video generation request to Kling AI.
// Expects POST body: { prompt: "..." }
// Returns: { task_id: "..." }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt' in request body" });
  }

  const KLING_API_KEY = process.env.KLING_API_KEY;

  if (!KLING_API_KEY) {
    return res.status(500).json({ error: "Server is missing KLING_API_KEY" });
  }

  try {
    const klingResponse = await fetch(
      "https://api-singapore.klingai.com/v1/videos/text2video",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KLING_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_name: "kling-v2-6",
          prompt: prompt,
          negative_prompt: "",
          duration: "5",
          mode: "std",
          aspect_ratio: "9:16", // good default for social/promo clips
        }),
      }
    );

    const data = await klingResponse.json();

    if (!klingResponse.ok) {
      return res.status(klingResponse.status).json({
        error: "Kling API error",
        details: data,
      });
    }

    const taskId = data?.data?.task_id;

    if (!taskId) {
      return res.status(500).json({ error: "Kling API did not return a task_id", details: data });
    }

    return res.status(200).json({ task_id: taskId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach Kling API", details: String(err) });
  }
}

