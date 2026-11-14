import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Video, RotateCcw } from "lucide-react";

interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
}

interface VideoProcessorProps {
  files: UploadedFile[];
  onVideoStarted: (jobId: string) => void;
  onVideoCompleted: (jobId: string) => void;
  onReset: () => void;
}

const VideoProcessor: React.FC<VideoProcessorProps> = ({
  files,
  onVideoStarted,
  onVideoCompleted,
  onReset,
}) => {
  const [duration, setDuration] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useTransitions, setUseTransitions] = useState(true);
  const [videoQuality, setVideoQuality] = useState<"720p" | "1080p">("720p");
  const [useAI, setUseAI] = useState(true);

  const handleCreateVideo = async () => {
    setProcessing(true);
    setError(null);

    try {
      const imageFiles = files.map((file) => file.filename);

      const response = await fetch("/api/photo-to-video/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageFiles,
          duration,
          useTransitions,
          videoQuality,
          useAI,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const jobId = result.jobId;
        onVideoStarted(jobId);

        // Poll for video completion to transition to audio processing
        pollForVideoCompletion(jobId);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to start video processing. Please try again.");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Video creation error:", err);
      setError("Failed to start video processing. Please try again.");
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const pollForVideoCompletion = async (jobId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/photo-to-video/status/${jobId}`);
        if (response.ok) {
          const status = await response.json();

          if (status.status === "completed") {
            setProcessing(false);
            onVideoCompleted(jobId);
          } else if (status.status === "failed") {
            setProcessing(false);
            setError(status.error || "Video processing failed");
          } else {
            // Still processing, check again
            setTimeout(checkStatus, 2000);
          }
        } else {
          setProcessing(false);
          setError("Failed to check video status");
        }
      } catch (error) {
        console.error("Status check error:", error);
        setProcessing(false);
        setError("Failed to check video status");
      }
    };

    checkStatus();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Create Your Video
        </CardTitle>
        <CardDescription>
          {files.length} images ready for AI-powered video generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Files Preview */}
          <div>
            <h3 className="font-medium mb-3">Uploaded Images ({files.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {files.map((file, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium truncate">{file.originalName}</div>
                  <div className="text-gray-500 text-xs">{formatFileSize(file.size)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Video Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration per image (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="quality">Video Quality</Label>
                <select
                  id="quality"
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value as "720p" | "1080p")}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="720p">720p (1280x720) - Faster</option>
                  <option value="1080p">1080p (1920x1080) - Higher Quality</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useAI"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="useAI" className="text-sm">
                  Use AI-powered video generation (Hugging Face)
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                🤖 AI creates dynamic video from your first image with motion and effects
              </p>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="transitions"
                  checked={useTransitions}
                  onChange={(e) => setUseTransitions(e.target.checked)}
                  className="rounded"
                  disabled={useAI}
                />
                <Label htmlFor="transitions" className={`text-sm ${useAI ? "text-gray-400" : ""}`}>
                  Add smooth transitions between images
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                ✨ Creates fade transitions between images for a more professional look (disabled
                when using AI)
              </p>
            </div>
          </div>

          {/* Video Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Video Preview</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                Generation method: {useAI ? "AI-powered (Hugging Face)" : "Traditional slideshow"}
              </p>
              {useAI ? (
                <p>AI will create dynamic video from your first image</p>
              ) : (
                <>
                  <p>Total video duration: {(files.length * duration).toFixed(1)} seconds</p>
                  <p>Transitions: {useTransitions ? "Enabled" : "Disabled"}</p>
                </>
              )}
              <p>Output format: MP4 ({videoQuality})</p>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded border">{error}</div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onReset} disabled={processing} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Upload Different Images
            </Button>

            <Button
              onClick={handleCreateVideo}
              disabled={processing || files.length === 0}
              className="flex-1"
            >
              {processing ? "Starting..." : "Create Video"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoProcessor;
