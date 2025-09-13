import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
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
  Globe,
  GraduationCap,
  Building2,
  Users,
  Lightbulb,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Plus,
  Edit3,
  Save
} from 'lucide-react';

interface PostType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  examples?: string[];
  referenceImages?: string[];
}

interface ReferenceImage {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'logo' | 'university' | 'students' | 'campus';
  uploaded?: boolean;
  filename?: string;
  originalName?: string;
  size?: number;
  uploadedAt?: string;
}

const POST_TYPES: PostType[] = [
  {
    id: 'admission-open',
    name: 'Admission Open',
    description: 'Announce new admission cycles and application deadlines',
    icon: <GraduationCap className="h-5 w-5" />,
    examples: [
      'Admissions Open for 2025-26 Academic Year',
      'Early Bird Applications Closing Soon',
      'Limited Seats Available - Apply Now'
    ]
  },
  {
    id: 'features-highlight',
    name: 'ICAS Features',
    description: 'Showcase the unique features and benefits of ICAS',
    icon: <Lightbulb className="h-5 w-5" />,
    examples: [
      'Global Engineering Education at Affordable Cost',
      '100+ Partner Universities Worldwide',
      'Credit Transfer to Top International Institutions'
    ]
  },
  {
    id: 'advertising',
    name: 'Advertising',
    description: 'Create promotional content for campaigns and events',
    icon: <Megaphone className="h-5 w-5" />,
    referenceImages: ['logo', 'campus', 'students']
  },
  {
    id: 'student-success',
    name: 'Student Success',
    description: 'Highlight alumni achievements and success stories',
    icon: <Users className="h-5 w-5" />,
    examples: [
      'Alumni Working at Tesla, Oracle, Volvo',
      'Successful Credit Transfer Stories',
      'Global Career Opportunities'
    ]
  },
  {
    id: 'campus-life',
    name: 'Campus Life',
    description: 'Showcase vibrant campus culture and facilities',
    icon: <Building2 className="h-5 w-5" />,
    examples: [
      'State-of-the-art Innovation Centre',
      'World-class Sports Facilities',
      'Diverse Student Clubs and Activities'
    ]
  },
  {
    id: 'international-partnerships',
    name: 'International Partnerships',
    description: 'Highlight global university partnerships',
    icon: <Globe className="h-5 w-5" />,
    examples: [
      'Partnerships with Top US Universities',
      'UK University Transfer Programs',
      'Australian and Canadian Opportunities'
    ]
  }
];

const REFERENCE_IMAGES: ReferenceImage[] = [
  {
    id: 'icas-logo',
    name: 'ICAS Logo',
    description: 'Official ICAS Manipal logo',
    url: '/placeholder.svg',
    category: 'logo'
  },
  {
    id: 'manipal-logo',
    name: 'MAHE Logo',
    description: 'Manipal Academy of Higher Education logo',
    url: '/placeholder.svg',
    category: 'logo'
  },
  {
    id: 'us-university',
    name: 'US University',
    description: 'Representative US university logo',
    url: '/placeholder.svg',
    category: 'university'
  },
  {
    id: 'uk-university',
    name: 'UK University',
    description: 'Representative UK university logo',
    url: '/placeholder.svg',
    category: 'university'
  },
  {
    id: 'students-group',
    name: 'Students Group',
    description: 'Diverse group of international students',
    url: '/placeholder.svg',
    category: 'students'
  },
  {
    id: 'campus-building',
    name: 'Campus Building',
    description: 'Modern ICAS campus building',
    url: '/placeholder.svg',
    category: 'campus'
  }
];

const SmartMarketing: React.FC = () => {
  const [selectedPostType, setSelectedPostType] = useState<PostType | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [selectedReferenceImages, setSelectedReferenceImages] = useState<ReferenceImage[]>([]);
  const [availableReferenceImages, setAvailableReferenceImages] = useState<ReferenceImage[]>(REFERENCE_IMAGES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: 'logo' as 'logo' | 'university' | 'students' | 'campus',
    file: null as File | null
  });

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState<ReferenceImage | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: 'logo' as 'logo' | 'university' | 'students' | 'campus',
    file: null as File | null
  });

  // Load reference images from server
  const loadReferenceImages = async () => {
    try {
      const response = await fetch('/api/smart-marketing/reference-images');
      if (response.ok) {
        const data = await response.json();
        setAvailableReferenceImages(data.referenceImages);
      } else {
        console.error('Failed to load reference images:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load reference images:', error);
    }
  };

  // Load images on component mount
  React.useEffect(() => {
    loadReferenceImages();
  }, []);

  const handleReferenceImageToggle = (image: ReferenceImage) => {
    setSelectedReferenceImages(prev => {
      const exists = prev.some(img => img.id === image.id);
      if (exists) {
        return prev.filter(img => img.id !== image.id);
      } else {
        return [...prev, image];
      }
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name.trim()) {
      setError('Please select a file and enter a name');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', uploadForm.file);
      formData.append('name', uploadForm.name.trim());
      formData.append('description', uploadForm.description.trim());
      formData.append('category', uploadForm.category);

      const response = await fetch('/api/smart-marketing/upload-reference-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Image uploaded successfully!');
        
        // Reload reference images
        await loadReferenceImages();
        
        // Reset form and close modal
        setUploadForm({
          name: '',
          description: '',
          category: 'logo',
          file: null
        });
        setShowUploadModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/smart-marketing/reference-images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Image deleted successfully!');
        
        // Remove from selected images if it was selected
        setSelectedReferenceImages(prev => prev.filter(img => img.id !== imageId));
        
        // Reload reference images
        await loadReferenceImages();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete image. Please try again.');
    }
  };

  const handleEditImage = (image: ReferenceImage) => {
    setEditingImage(image);
    setEditForm({
      name: image.name,
      description: image.description,
      category: image.category,
      file: null
    });
    setShowEditModal(true);
  };

  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpdateImage = async () => {
    if (!editingImage || !editForm.name.trim()) {
      setError('Please enter a name');
      return;
    }

    // For default images, require a new file
    if (!editingImage.uploaded && !editForm.file) {
      setError('Please select a new image file to replace the default image');
      return;
    }

    setIsEditing(true);
    setError('');

    try {
      const formData = new FormData();
      if (editForm.file) {
        formData.append('image', editForm.file);
      }
      formData.append('name', editForm.name.trim());
      formData.append('description', editForm.description.trim());
      formData.append('category', editForm.category);

      const response = await fetch(`/api/smart-marketing/reference-images/${editingImage.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message || 'Image updated successfully!');
        
        // Reload reference images to get the updated list
        await loadReferenceImages();
        
        // If this was a default image replacement, remove it from selected images
        // since it's now a new uploaded image with a different ID
        if (!editingImage.uploaded && result.image) {
          setSelectedReferenceImages(prev => 
            prev.filter(img => img.id !== editingImage.id)
          );
        }
        
        // Reset form and close modal
        setEditForm({
          name: '',
          description: '',
          category: 'logo',
          file: null
        });
        setEditingImage(null);
        setShowEditModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update image');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update image. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const generatePost = async () => {
    if (!selectedPostType) return;

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // Call OpenRouter API to generate post content
      const response = await fetch('/api/smart-marketing/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postType: selectedPostType.id,
          postTypeName: selectedPostType.name,
          customMessage,
          referenceImages: selectedReferenceImages.map(img => ({
            name: img.name,
            category: img.category,
            description: img.description
          }))
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedPost(result.post);
        setGeneratedImagePrompt(result.imagePrompt);
        setSuccess('Post generated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate post');
      }
    } catch (error) {
      console.error('Post generation error:', error);
      setError('Failed to generate post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!generatedImagePrompt) return;

    setIsGeneratingImage(true);
    setError('');
    setSuccess('');

    try {
      // Call AI API to generate image
      const response = await fetch('/api/smart-marketing/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generatedImagePrompt,
          referenceImages: selectedReferenceImages.map(img => img.url)
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.imageUrl) {
          setGeneratedImage(result.imageUrl);
          
          // Show success message with note if available
          if (result.note) {
            setSuccess(`${result.note} ${result.success ? 'Image generated successfully!' : ''}`);
          } else {
            setSuccess('Image generated successfully!');
          }
          
          // Clear any previous errors
          setError('');
        } else {
          throw new Error(result.error || 'No image URL received from server');
        }
      } else {
        let errorMessage = 'Failed to generate image';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        setError(errorMessage);
        setSuccess('');
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error: Unable to connect to the server. Please check your connection.');
      } else if (error.message.includes('Failed to fetch')) {
        setError('Connection failed. Please check if the server is running and try again.');
      } else {
        setError(`Failed to generate image: ${error.message}`);
      }
      setSuccess('');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const regeneratePost = () => {
    setGeneratedPost('');
    setGeneratedImagePrompt('');
    setGeneratedImage('');
    generatePost();
  };

  const regenerateImage = () => {
    setGeneratedImage('');
    generateImage();
  };

  const resetForm = () => {
    setSelectedPostType(null);
    setCustomMessage('');
    setSelectedReferenceImages([]);
    setGeneratedPost('');
    setGeneratedImagePrompt('');
    setGeneratedImage('');
    setError('');
    setSuccess('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Smart Marketing Tool</h1>
          <p className="text-lg text-gray-600">
            Generate engaging Instagram posts and AI-powered images with text overlays for ICAS Manipal marketing campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Select Post Type
                </CardTitle>
                <CardDescription>
                  Choose the type of marketing content you want to create
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {POST_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      variant={selectedPostType?.id === type.id ? 'default' : 'outline'}
                      className="h-32 flex-col gap-3 p-4"
                      onClick={() => setSelectedPostType(type)}
                    >
                      {type.icon}
                      <div className="text-center">
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs opacity-80 mt-1">{type.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Message Input */}
            {selectedPostType && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Custom Message (Optional)
                  </CardTitle>
                  <CardDescription>
                    Add your own message or let AI generate content based on the post type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label htmlFor="custom-message">Additional Details</Label>
                    <Textarea
                      id="custom-message"
                      placeholder={`Add specific details for your ${selectedPostType.name.toLowerCase()} post...`}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                    />
                    {selectedPostType.examples && (
                      <div className="text-sm text-gray-600">
                        <div className="font-medium mb-2">Example messages:</div>
                        <div className="space-y-1">
                          {selectedPostType.examples.map((example, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reference Images Selection */}
            {selectedPostType && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Reference Images
                      </CardTitle>
                      <CardDescription>
                        Select images to include in your AI-generated content
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Upload Image
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadReferenceImages}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {availableReferenceImages.length} reference images ({availableReferenceImages.filter(img => img.uploaded).length} uploaded)
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableReferenceImages.map((image) => (
                      <div
                        key={image.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                          selectedReferenceImages.some(img => img.id === image.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleReferenceImageToggle(image)}
                      >
                        <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          {image.url && image.url !== '/placeholder.svg' ? (
                            <img 
                              src={image.url} 
                              alt={image.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image failed to load:', image.url, 'for image:', image.name);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Image className={`h-8 w-8 text-gray-400 ${image.url && image.url !== '/placeholder.svg' ? 'hidden' : ''}`} />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{image.name}</div>
                          <div className="text-xs text-gray-500">{image.description}</div>
                          {image.uploaded && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Uploaded
                            </Badge>
                          )}
                        </div>
                        {/* Action buttons for uploaded images */}
                        {image.uploaded && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(image.id);
                              }}
                              className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              title="Delete image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditImage(image);
                              }}
                              className="absolute top-2 right-2 p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                              title="Edit image"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        
                        {/* Edit button for default images (to replace with custom) */}
                        {!image.uploaded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditImage(image);
                            }}
                            className="absolute top-2 right-2 p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
                            title="Replace with custom image"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        )}

                        {/* Selection indicator */}
                        {selectedReferenceImages.some(img => img.id === image.id) && (
                          <div className="absolute bottom-2 right-2">
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            {selectedPostType && (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={generatePost} 
                    disabled={isGenerating}
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Instagram Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate Instagram Post & Image Prompt
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Results & Actions */}
          <div className="space-y-6">
            {/* Current Selection Summary */}
            {selectedPostType && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedPostType.name}</Badge>
                    {selectedPostType.icon}
                  </div>
                  
                  {customMessage && (
                    <div className="text-sm">
                      <span className="font-medium">Custom Message:</span>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                        {customMessage}
                      </div>
                    </div>
                  )}
                  
                  {selectedReferenceImages.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Reference Images:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedReferenceImages.map(image => (
                          <Badge key={image.id} variant="outline" className="text-xs">
                            {image.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Generated Post */}
            {generatedPost && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Generated Post
                  </CardTitle>
                  <CardDescription>Your AI-generated social media post</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{generatedPost}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedPost)}
                    >
                      Copy Post
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={regeneratePost}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Image Prompt */}
            {generatedImagePrompt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Instagram-Style Image Prompt
                  </CardTitle>
                  <CardDescription>AI-generated prompt for creating Instagram-worthy marketing images with your post content as text overlays</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Image className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm leading-relaxed">{generatedImagePrompt}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">Instagram Format</Badge>
                          <Badge variant="secondary" className="text-xs">Text Overlay</Badge>
                          <Badge variant="secondary" className="text-xs">Professional Design</Badge>
                          {selectedReferenceImages.length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Reference Images</Badge>
                          )}
                        </div>
                        {selectedReferenceImages.length > 0 && (
                          <div className="mt-3 p-2 bg-white rounded border border-green-200">
                            <div className="text-xs font-medium text-green-700 mb-1">Reference images that will be incorporated:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedReferenceImages.map(image => (
                                <Badge key={image.id} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                  {image.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={generateImage} 
                    disabled={isGeneratingImage}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isGeneratingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Instagram Image...
                      </>
                    ) : (
                      <>
                        <Image className="h-4 w-4 mr-2" />
                        Generate Instagram Image
                      </>
                    )}
                  </Button>
                  
                  {/* Progress indicator */}
                  {isGeneratingImage && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-700 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>AI is creating your Instagram-worthy marketing image...</span>
                      </div>
                      <div className="mt-2 text-xs text-blue-600">
                        This may take a few moments. Our AI is generating a professional image with text overlays optimized for Instagram.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Generated Image */}
            {generatedImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Generated Image
                  </CardTitle>
                  <CardDescription>Your AI-generated marketing image</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <img 
                      src={generatedImage} 
                      alt="Generated marketing image"
                      className="w-full rounded-lg border"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        setError('Failed to load generated image');
                      }}
                    />
                    {isGeneratingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <div>Generating Image...</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      onClick={() => {
                        // Create a temporary link to download the image
                        const link = document.createElement('a');
                        link.href = generatedImage;
                        link.download = 'icas-marketing-image.jpg';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setSuccess('Image download started!');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={regenerateImage}
                      disabled={isGeneratingImage}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {success && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">{success}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reset Button */}
            {selectedPostType && (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Reference Image
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUploadModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Upload a new image to use as a reference for AI generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-name">Image Name *</Label>
                  <Input
                    id="image-name"
                    placeholder="Enter image name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image-description">Description</Label>
                  <Input
                    id="image-description"
                    placeholder="Enter image description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image-category">Category *</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value: 'logo' | 'university' | 'students' | 'campus') => 
                      setUploadForm(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logo">Logo</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="campus">Campus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="image-file">Image File *</Label>
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  {uploadForm.file && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !uploadForm.file || !uploadForm.name.trim()}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5" />
                    Edit Reference Image
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Update the image details or replace with a new image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current image preview */}
                <div>
                  <Label>Current Image</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {editingImage.url && editingImage.url !== '/placeholder.svg' ? (
                          <img 
                            src={editingImage.url} 
                            alt={editingImage.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{editingImage.name}</div>
                        <div className="text-sm text-gray-500">{editingImage.description}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {editingImage.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-image-name">Image Name *</Label>
                  <Input
                    id="edit-image-name"
                    placeholder="Enter image name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-image-description">Description</Label>
                  <Input
                    id="edit-image-description"
                    placeholder="Enter image description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-image-category">Category *</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(value: 'logo' | 'university' | 'students' | 'campus') => 
                      setEditForm(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logo">Logo</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="campus">Campus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-image-file">
                    Replace Image {!editingImage?.uploaded ? '*' : '(Optional)'}
                  </Label>
                  <Input
                    id="edit-image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileSelect}
                    className="cursor-pointer"
                    required={!editingImage?.uploaded}
                  />
                  {editForm.file && (
                    <div className="mt-2 text-sm text-gray-600">
                      New image: {editForm.file.name} ({(editForm.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    {editingImage?.uploaded 
                      ? 'Leave empty to keep the current image'
                      : 'Required: Select a new image to replace the default image'
                    }
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleUpdateImage}
                    disabled={isEditing || !editForm.name.trim() || (!editingImage?.uploaded && !editForm.file)}
                    className="flex-1"
                  >
                    {isEditing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Image
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    disabled={isEditing}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMarketing; 