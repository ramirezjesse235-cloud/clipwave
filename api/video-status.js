// /api/video-status.js
// Checks the status of a fal.ai video generation request.
// Expects GET query param: ?task_id=...
// Returns: { status: "...", video_url?: "..." }

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { task_id } = req.query;

  if (!task_id) {
    return res.status(400).json({ error: "Missing 'task_id' query parameter" });
  }

  const FAL_API_KEY = process.env.FAL_API_KEY;

  if (!FAL_API_KEY) {
    return res.status(500).json({ error: "Server is missing FAL_API_KEY" });
  }

  try {
    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video/requests/${task_id}/status`,
      {
        method: "GET",
        headers: {
          Authorization: `Key ${FAL_API_KEY}`,
        },
      }
    );

    const statusData = await statusRes.json();

    if (!statusRes.ok) {
      return res.status(statusRes.status).json({ error: "fal.ai status error", details: statusData });
    }

    const falStatus = statusData?.status; // IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED

    if (falStatus === "COMPLETED") {
      // fetch the actual result
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video/requests/${task_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Key ${FAL_API_KEY}`,
          },
        }
      );
      const resultData = await resultRes.json();
      const videoUrl = resultData?.video?.url || null;
      return res.status(200).json({ status: "succeed", video_url: videoUrl });
    }

    if (falStatus === "FAILED") {
      return res.status(200).json({ status: "failed" });
    }

    // still processing
    return res.status(200).json({ status: "processing" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach fal.ai API", details: String(err) });
  }
}

