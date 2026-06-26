// /api/video-status.js
// Checks the status of a Kling AI video generation task.
// Expects GET query param: ?task_id=...
// Returns: { status: "submitted" | "processing" | "succeed" | "failed", video_url?: "..." }

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { task_id } = req.query;

  if (!task_id) {
    return res.status(400).json({ error: "Missing 'task_id' query parameter" });
  }

  const KLING_API_KEY = process.env.KLING_API_KEY;

  if (!KLING_API_KEY) {
    return res.status(500).json({ error: "Server is missing KLING_API_KEY" });
  }

  try {
    const klingResponse = await fetch(
      `https://api-singapore.klingai.com/v1/videos/text2video/${task_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${KLING_API_KEY}`,
        },
      }
    );

    const data = await klingResponse.json();

    if (!klingResponse.ok) {
      return res.status(klingResponse.status).json({
        error: "Kling API error",
        details: data,
      });
    }

    const status = data?.data?.task_status; // submitted | processing | succeed | failed
    const videoUrl = data?.data?.task_result?.videos?.[0]?.url || null;

    return res.status(200).json({ status, video_url: videoUrl });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach Kling API", details: String(err) });
  }
}
