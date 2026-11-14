import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Download, RotateCcw, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoDownloaderProps {
  jobId: string;
  onVideoCompleted: () => void;
  onReset: () => void;
}

const VideoDownloader: React.FC<VideoDownloaderProps> = ({ jobId, onVideoCompleted, onReset }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = () => {
    // Create a download link
    const link = document.createElement("a");
    link.href = `/api/photo-to-video/download/${jobId}`;
    link.download = `video-${jobId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Your Video
        </CardTitle>
        <CardDescription>Your video is ready for download</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <h3 className="font-medium">Video Preview</h3>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-contain"
                onEnded={handleVideoEnded}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                controls
              >
                <source src={`/api/photo-to-video/stream/${jobId}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Custom Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={toggleVideoPlayback}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={toggleMute}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Download Actions */}
          <div className="space-y-4">
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="h-5 w-5 mr-2" />
              Download Video
            </Button>

            <Button variant="outline" onClick={onReset} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Create Another Video
            </Button>
          </div>

          {/* Video Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Video Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Format: MP4</p>
              <p>Job ID: {jobId}</p>
              <p>Status: Ready for download</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoDownloader;
