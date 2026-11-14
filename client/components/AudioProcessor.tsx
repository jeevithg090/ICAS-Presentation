import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Music, Mic } from "lucide-react";

interface AudioProcessorProps {
  jobId: string;
  onAudioProcessed: (finalJobId: string) => void;
  onSkip: () => void;
  onError: (error: string) => void;
}

type AudioOption = "background-music" | "ai-dubbing";

const AudioProcessor: React.FC<AudioProcessorProps> = ({
  jobId,
  onAudioProcessed,
  onSkip,
  onError,
}) => {
  const [selectedOption, setSelectedOption] = useState<AudioOption | null>(null);
  const [processing, setProcessing] = useState(false);
  const [videoDescription, setVideoDescription] = useState("");
  const [backgroundMusicFile, setBackgroundMusicFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  const handleBackgroundMusic = async () => {
    if (!backgroundMusicFile) {
      onError("Please select a background music file");
      return;
    }

    setProcessing(true);
    setCurrentStep("Uploading music...");
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("music", backgroundMusicFile);
      formData.append("videoJobId", jobId);

      setCurrentStep("Mixing audio with video...");
      setProgress(50);

      const response = await fetch("/api/photo-to-video/add-background-music", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setCurrentStep("Finalizing video...");
        setProgress(90);

        // Poll for completion
        const result = await response.json();
        const finalJobId = result.jobId;
        await pollForCompletion(finalJobId);

        setProgress(100);
        onAudioProcessed(finalJobId);
      } else {
        const errorData = await response.json();
        onError(errorData.error || "Failed to add background music. Please try again.");
        setProcessing(false);
      }
    } catch (error) {
      console.error("Background music processing error:", error);
      onError("Failed to add background music. Please try again.");
      setProcessing(false);
    }
  };

  const handleAIDubbing = async () => {
    if (!videoDescription.trim()) {
      onError("Please provide a description for the video");
      return;
    }

    setProcessing(true);
    setCurrentStep("Generating script...");
    setProgress(10);

    try {
      // Generate script with OpenRouter
      setCurrentStep("Creating AI script...");
      setProgress(25);

      const scriptResponse = await fetch("/api/photo-to-video/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoDescription: videoDescription.trim(),
          videoJobId: jobId,
        }),
      });

      if (!scriptResponse.ok) {
        const errorData = await scriptResponse.json();
        throw new Error(errorData.error || "Failed to generate script");
      }

      const scriptData = await scriptResponse.json();

      setCurrentStep("Generating speech...");
      setProgress(40);

      // Generate audio with ElevenLabs
      const audioResponse = await fetch("/api/photo-to-video/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: scriptData.script,
          videoJobId: jobId,
        }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const audioData = await audioResponse.json();
      const audioJobId = audioData.audioJobId;

      setCurrentStep("Processing audio...");
      setProgress(60);

      // Wait for audio generation to complete
      await pollForAudioCompletion(audioJobId);

      setCurrentStep("Mixing audio with video...");
      setProgress(75);

      // Mix audio with video
      const finalResponse = await fetch("/api/photo-to-video/mix-ai-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioJobId: audioJobId,
          videoJobId: jobId,
        }),
      });

      if (!finalResponse.ok) {
        const errorData = await finalResponse.json();
        throw new Error(errorData.error || "Failed to mix audio with video");
      }

      setCurrentStep("Finalizing video...");
      setProgress(90);

      // Poll for completion
      const finalData = await finalResponse.json();
      const finalJobId = finalData.jobId;
      await pollForCompletion(finalJobId);

      setProgress(100);
      onAudioProcessed(finalJobId);
    } catch (error) {
      console.error("AI dubbing processing error:", error);
      onError(
        error instanceof Error ? error.message : "Failed to generate AI dubbing. Please try again.",
      );
      setProcessing(false);
    }
  };

  const pollForAudioCompletion = async (audioJobId: string) => {
    return new Promise((resolve, reject) => {
      const checkAudioStatus = async () => {
        try {
          const statusResponse = await fetch(`/api/photo-to-video/audio-status/${audioJobId}`);
          if (statusResponse.ok) {
            const status = await statusResponse.json();

            if (status.status === "completed") {
              resolve(audioJobId);
            } else if (status.status === "failed") {
              reject(new Error(status.error || "Audio generation failed"));
            } else {
              // Still processing, check again
              setTimeout(checkAudioStatus, 2000);
            }
          } else {
            reject(new Error("Failed to check audio status"));
          }
        } catch (error) {
          reject(error);
        }
      };

      checkAudioStatus();
    });
  };

  const pollForCompletion = async (finalJobId: string) => {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const statusResponse = await fetch(`/api/photo-to-video/status/${finalJobId}`);
          if (statusResponse.ok) {
            const status = await statusResponse.json();

            if (status.status === "completed") {
              resolve(finalJobId);
            } else if (status.status === "failed") {
              reject(new Error(status.error || "Processing failed"));
            } else {
              // Still processing, check again
              setTimeout(checkStatus, 2000);
            }
          } else {
            reject(new Error("Failed to check status"));
          }
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate audio file type
      const allowedTypes = ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"];
      if (!allowedTypes.includes(file.type)) {
        onError("Please select a valid audio file (MP3, WAV, OGG, M4A)");
        return;
      }
      setBackgroundMusicFile(file);
    }
  };

  if (processing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Adding Audio to Your Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">{progress.toFixed(0)}% complete</p>
              <p className="text-xs text-gray-500">{currentStep}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Add Audio to Your Video
        </CardTitle>
        <CardDescription>Choose how you'd like to enhance your video with audio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            {/* Background Music Option */}
            <div
              className={`border rounded-lg p-4 transition-colors ${
                selectedOption === "background-music"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => setSelectedOption("background-music")}
              >
                <input
                  type="radio"
                  name="audioOption"
                  value="background-music"
                  checked={selectedOption === "background-music"}
                  onChange={() => setSelectedOption("background-music")}
                  className="text-blue-600"
                />
                <div>
                  <h3 className="font-medium">🎵 Background Music</h3>
                  <p className="text-sm text-gray-600">
                    Add your own background music to the slideshow
                  </p>
                </div>
              </div>

              {selectedOption === "background-music" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="music-file" className="text-sm font-medium">
                      Choose Music File:
                    </Label>
                    <input
                      id="music-file"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {backgroundMusicFile && (
                      <p className="text-sm text-green-600 mt-1">
                        Selected: {backgroundMusicFile.name}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleBackgroundMusic}
                    disabled={!backgroundMusicFile}
                    className="w-full"
                  >
                    Add Background Music
                  </Button>
                </div>
              )}
            </div>

            {/* AI Dubbing Option */}
            <div
              className={`border rounded-lg p-4 transition-colors ${
                selectedOption === "ai-dubbing" ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => setSelectedOption("ai-dubbing")}
              >
                <input
                  type="radio"
                  name="audioOption"
                  value="ai-dubbing"
                  checked={selectedOption === "ai-dubbing"}
                  onChange={() => setSelectedOption("ai-dubbing")}
                  className="text-blue-600"
                />
                <div>
                  <h3 className="font-medium">🤖 AI Generated Dubbing</h3>
                  <p className="text-sm text-gray-600">
                    Generate AI-powered narration based on your video content
                  </p>
                </div>
              </div>

              {selectedOption === "ai-dubbing" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="video-description" className="text-sm font-medium">
                      Describe your video content:
                    </Label>
                    <Textarea
                      id="video-description"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Describe what your slideshow is about, the mood, and what you'd like the narration to convey..."
                      rows={4}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The AI will create a script and generate natural-sounding narration based on
                      your description.
                    </p>
                  </div>
                  <Button
                    onClick={handleAIDubbing}
                    disabled={!videoDescription.trim()}
                    className="w-full"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Generate AI Dubbing
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={onSkip} className="w-full">
              Skip Audio - Use Video As Is
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioProcessor;
