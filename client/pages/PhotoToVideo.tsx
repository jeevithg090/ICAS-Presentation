import SEO from "@/components/SEO";
import React, { useState, useCallback } from "react";
import ImageUploader from "../components/ImageUploader";
import VideoProcessor from "../components/VideoProcessor";
import AudioProcessor from "../components/AudioProcessor";
import VideoDownloader from "../components/VideoDownloader";

interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
}

interface VideoJob {
  id: string;
  status: "processing" | "completed" | "failed";
  videoPath?: string;
  videoUrl?: string;
  previewUrl?: string;
  error?: string;
  progress?: number;
  files: string[];
  createdAt: Date;
  completedAt?: Date;
}

interface AudioJob {
  id: string;
  status: "processing" | "completed" | "failed";
  audioPath?: string;
  script?: string;
  error?: string;
  progress?: number;
}

const PhotoToVideo: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [finalJobId, setFinalJobId] = useState<string | null>(null);

  const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files);
    setCurrentJobId(null);
  }, []);

  const handleVideoStarted = useCallback((jobId: string) => {
    setCurrentJobId(jobId);
  }, []);

  const handleVideoCompleted = useCallback((jobId: string) => {
    setVideoCompleted(true);
    // Keep the current job ID for audio processing
  }, []);

  const handleAudioProcessed = useCallback((finalJobId: string) => {
    setFinalJobId(finalJobId);
    setVideoCompleted(false); // Hide audio processor
  }, []);

  const handleSkipAudio = useCallback(() => {
    // Skip audio processing and go directly to download with current video
    setFinalJobId(currentJobId);
    setVideoCompleted(false);
  }, [currentJobId]);

  const handleAudioError = useCallback((error: string) => {
    console.error("Audio processing error:", error);
    // Could show an error message to user
    alert(`Audio processing error: ${error}`);
  }, []);

  const handleReset = useCallback(() => {
    setUploadedFiles([]);
    setCurrentJobId(null);
    setVideoCompleted(false);
    setFinalJobId(null);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <SEO
        title="Photo to Video — ICAS Administration"
        description="Turn uploaded images into a narrated slideshow video."
      />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">Photo to Video Converter</h1>
        <p className="text-lg text-muted-foreground">
          Upload your images and create a beautiful slideshow video with AI-powered generation and
          voice narration
        </p>
      </div>

      <div className="space-y-6">
        {!uploadedFiles.length && <ImageUploader onFilesUploaded={handleFilesUploaded} />}

        {uploadedFiles.length > 0 && !currentJobId && !videoCompleted && !finalJobId && (
          <VideoProcessor
            files={uploadedFiles}
            onVideoStarted={handleVideoStarted}
            onVideoCompleted={handleVideoCompleted}
            onReset={handleReset}
          />
        )}

        {videoCompleted && currentJobId && (
          <AudioProcessor
            jobId={currentJobId}
            onAudioProcessed={handleAudioProcessed}
            onSkip={handleSkipAudio}
            onError={handleAudioError}
          />
        )}

        {finalJobId && (
          <VideoDownloader jobId={finalJobId} onVideoCompleted={() => {}} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default PhotoToVideo;
