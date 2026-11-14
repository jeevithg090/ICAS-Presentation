import SEO from "@/components/SEO";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import {
  Image,
  Type,
  Palette,
  Download,
  RotateCcw,
  Sparkles,
  Calendar,
  Megaphone,
  FileText,
} from "lucide-react";

interface Festival {
  id: string;
  name: string;
  description: string;
  date: string;
}

interface AspectRatio {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
}

interface ImageModel {
  id: string;
  name: string;
  description: string;
  type: "ai" | "local";
}

const AVAILABLE_MODELS: ImageModel[] = [
  {
    id: "local",
    name: "Local Canvas",
    description: "Simple text overlay on templates",
    type: "local",
  },
  { id: "ai", name: "AI Generated", description: "AI-powered image creation", type: "ai" },
];

const FESTIVALS: Festival[] = [
  { id: "diwali", name: "Diwali", description: "Festival of Lights", date: "November 2024" },
  { id: "holi", name: "Holi", description: "Festival of Colors", date: "March 2025" },
  { id: "eid", name: "Eid al-Fitr", description: "End of Ramadan", date: "April 2025" },
  {
    id: "christmas",
    name: "Christmas",
    description: "Christian celebration",
    date: "December 2024",
  },
  { id: "newyear", name: "New Year", description: "New Year celebration", date: "January 2025" },
];

const ASPECT_RATIOS: AspectRatio[] = [
  {
    id: "1:1",
    name: "Square (1:1)",
    width: 1080,
    height: 1080,
    description: "Instagram posts, Facebook posts",
  },
  {
    id: "16:9",
    name: "Landscape (16:9)",
    width: 1920,
    height: 1080,
    description: "YouTube thumbnails, presentations",
  },
  {
    id: "9:16",
    name: "Portrait (9:16)",
    width: 1080,
    height: 1920,
    description: "Instagram stories, TikTok",
  },
  {
    id: "4:5",
    name: "Portrait (4:5)",
    width: 1080,
    height: 1350,
    description: "Instagram posts, Facebook posts",
  },
];

const MarketingTool: React.FC = () => {
  const [postType, setPostType] = useState<string | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [customText, setCustomText] = useState<string>("");
  const [logo, setLogo] = useState<File | null>(null);
  const [selectedAspectRatios, setSelectedAspectRatios] = useState<AspectRatio[]>([]);
  const [selectedModel, setSelectedModel] = useState<ImageModel>(AVAILABLE_MODELS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleToggleAspectRatio = (ratio: AspectRatio) => {
    setSelectedAspectRatios((prev) => {
      const exists = prev.some((r) => r.id === ratio.id);
      if (exists) {
        return prev.filter((r) => r.id !== ratio.id);
      } else {
        return [...prev, ratio];
      }
    });
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  const resetForm = () => {
    setPostType(null);
    setSelectedFestival(null);
    setCustomText("");
    setLogo(null);
    setSelectedAspectRatios([]);
    setSelectedModel(AVAILABLE_MODELS[0]);
    setGeneratedImages([]);
  };

  const generateImages = async () => {
    if (!postType || selectedAspectRatios.length === 0) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/marketing-tool/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postType,
          festival: selectedFestival?.id,
          customText,
          logo: logo ? logo.name : undefined,
          aspectRatios: selectedAspectRatios.map((r) => r.id),
          model: selectedModel.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Poll for job completion
        const pollInterval = setInterval(async () => {
          const statusResponse = await fetch(`/api/marketing-tool/status/${result.jobId}`);
          if (statusResponse.ok) {
            const status = await statusResponse.json();
            if (status.status === "completed" && status.generatedImages) {
              setGeneratedImages(status.generatedImages);
              setIsGenerating(false);
              clearInterval(pollInterval);
            } else if (status.status === "failed") {
              setIsGenerating(false);
              clearInterval(pollInterval);
            }
          }
        }, 1000);
      } else {
        console.error("Generation failed");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Image generation error:", error);
      setIsGenerating(false);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="h-5 w-5" />;
      case "advertisement":
        return <Megaphone className="h-5 w-5" />;
      case "announcement":
        return <FileText className="h-5 w-5" />;
      default:
        return <Type className="h-5 w-5" />;
    }
  };

  const getPostTypeDescription = (type: string) => {
    switch (type) {
      case "event":
        return "Promote upcoming events and celebrations";
      case "advertisement":
        return "Create engaging promotional content";
      case "announcement":
        return "Share important updates and news";
      default:
        return "Select a post type to get started";
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <SEO
        title="Marketing Tool — ICAS Administration"
        description="Draft social media posts for ICAS campaigns."
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">ICAS Marketing Tool</h1>
          <p className="text-lg text-muted-foreground">
            Create engaging social media content for your campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Post Type
                </CardTitle>
                <CardDescription>Choose the type of content you want to create</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "event", name: "Event", icon: <Calendar className="h-5 w-5" /> },
                    {
                      id: "advertisement",
                      name: "Advertisement",
                      icon: <Megaphone className="h-5 w-5" />,
                    },
                    {
                      id: "announcement",
                      name: "Announcement",
                      icon: <FileText className="h-5 w-5" />,
                    },
                  ].map((type) => (
                    <Button
                      key={type.id}
                      variant={postType === type.id ? "default" : "outline"}
                      className="h-24 flex-col gap-2"
                      onClick={() => setPostType(type.id)}
                    >
                      {type.icon}
                      <span className="font-medium">{type.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Festival Selection (only for event posts) */}
            {postType === "event" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Festival Selection
                  </CardTitle>
                  <CardDescription>Choose the festival for your event post</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedFestival?.id || ""}
                    onValueChange={(value) => {
                      const festival = FESTIVALS.find((f) => f.id === value);
                      setSelectedFestival(festival || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a festival" />
                    </SelectTrigger>
                    <SelectContent>
                      {FESTIVALS.map((festival) => (
                        <SelectItem key={festival.id} value={festival.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{festival.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {festival.description} - {festival.date}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Custom Text Input (for advertisements and announcements) */}
            {(postType === "advertisement" || postType === "announcement") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Custom Text
                  </CardTitle>
                  <CardDescription>
                    Enter the text you want to display on your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label htmlFor="custom-text">Text Content</Label>
                    <Input
                      id="custom-text"
                      placeholder={`Enter your ${postType} text...`}
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Logo Upload */}
            {postType && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Logo Upload
                  </CardTitle>
                  <CardDescription>Upload your organization's logo (optional)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input type="file" accept="image/*" onChange={handleLogoChange} />
                    {logo && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Image className="h-4 w-4" />
                        {logo.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Model Selection */}
            {postType && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Generation Model
                  </CardTitle>
                  <CardDescription>Choose how you want to generate your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {AVAILABLE_MODELS.map((model) => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={model.id}
                          checked={selectedModel.id === model.id}
                          onCheckedChange={() => setSelectedModel(model)}
                        />
                        <Label htmlFor={model.id} className="flex-1">
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {model.description}
                            </span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aspect Ratio Selection */}
            {postType && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Aspect Ratios
                  </CardTitle>
                  <CardDescription>Select the dimensions for your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {ASPECT_RATIOS.map((ratio) => (
                        <div key={ratio.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={ratio.id}
                            checked={selectedAspectRatios.some((r) => r.id === ratio.id)}
                            onCheckedChange={() => handleToggleAspectRatio(ratio)}
                          />
                          <Label htmlFor={ratio.id} className="flex-1">
                            <div className="flex flex-col">
                              <span className="font-medium">{ratio.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {ratio.description}
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            {postType && selectedAspectRatios.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={generateImages}
                    disabled={isGenerating}
                    className="w-full h-12 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Images...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate Images
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Preview & Results */}
          <div className="space-y-6">
            {/* Current Selection Summary */}
            {postType && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{postType}</Badge>
                    {getPostTypeIcon(postType)}
                  </div>

                  {selectedFestival && (
                    <div className="text-sm">
                      <span className="font-medium">Festival:</span> {selectedFestival.name}
                    </div>
                  )}

                  {customText && (
                    <div className="text-sm">
                      <span className="font-medium">Text:</span> {customText}
                    </div>
                  )}

                  {logo && (
                    <div className="text-sm">
                      <span className="font-medium">Logo:</span> {logo.name}
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="font-medium">Model:</span> {selectedModel.name}
                  </div>

                  {selectedAspectRatios.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Aspect Ratios:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAspectRatios.map((ratio) => (
                          <Badge key={ratio.id} variant="outline" className="text-xs">
                            {ratio.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Generated Images */}
            {generatedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Images</CardTitle>
                  <CardDescription>Your content is ready for download</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="space-y-2">
                        <img
                          src={image}
                          alt={`Generated content ${index + 1}`}
                          className="w-full rounded-lg border"
                        />
                        <Button className="w-full" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reset Button */}
            {postType && (
              <Card>
                <CardContent className="pt-6">
                  <Button variant="outline" onClick={resetForm} className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingTool;
