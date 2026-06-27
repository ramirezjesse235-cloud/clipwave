import { useState } from "react";

export default function VideoGenerator({ script, isPaidUser }) {
  const [status, setStatus] = useState("idle");
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  async function handleGenerateVideo() {
    setStatus("submitting");
    setError(null);
    setVideoUrl(null);

    try {
      const submitRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: script }),
      });
      const submitData = await submitRes.json();

      if (!submitRes.ok || !submitData.task_id) {
        throw new Error(submitData.error || "Failed to start video generation");
      }

      const taskId = submitData.task_id;
      setStatus("processing");

      const maxAttempts = 30;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 10000));

        const statusRes = await fetch(`/api/video-status?task_id=${taskId}`);
        const statusData = await statusRes.json();

        if (statusData.status === "succeed" && statusData.video_url) {
          setVideoUrl(statusData.video_url);
          setStatus("succeed");
          return;
        }

        if (statusData.status === "failed") {
          throw new Error("Video generation failed on Kling's end");
        }
      }

      throw new Error("Video generation timed out. Please try again.");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setStatus("failed");
    }
  }

  if (!isPaidUser) {
    return (
      <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
        <p>🔒 Video generation is a premium feature. Upgrade your plan to unlock it.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <button
        onClick={handleGenerateVideo}
        disabled={status === "submitting" || status === "processing"}
      >
        {status === "submitting" && "Starting..."}
        {status === "processing" && "Generating video (this can take a few minutes)..."}
        {(status === "idle" || status === "succeed" || status === "failed") && "Generate Video"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {videoUrl && (
        <div style={{ marginTop: "1rem" }}>
          <video src={videoUrl} controls style={{ maxWidth: "100%" }} />
          <p>
            <a href={videoUrl} download target="_blank" rel="noreferrer">
              Download video
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
