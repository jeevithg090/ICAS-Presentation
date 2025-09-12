# Administration Tools

This document describes the administration tools that have been integrated into the ICAS website.

## Overview

The administration tools provide a comprehensive suite of features for managing website content, creating marketing materials, and processing media files. These tools are accessible only to users with admin privileges.

## Available Tools

### 1. Photo to Video Converter

**Purpose**: Convert uploaded images into slideshow videos with optional AI-powered audio narration.

**Features**:
- Upload multiple images (JPEG, PNG, GIF)
- Automatic video processing with customizable transitions
- AI-powered audio narration generation
- Multiple output formats
- Progress tracking and job management

**API Endpoints**:
- `POST /api/photo-to-video/upload` - Upload images
- `POST /api/photo-to-video/process-video` - Start video processing
- `POST /api/photo-to-video/process-audio` - Generate audio narration
- `GET /api/photo-to-video/status/:jobId` - Check job status
- `GET /api/photo-to-video/download/:jobId` - Download completed video

**Usage**:
1. Navigate to `/administration/photo-to-video`
2. Upload your images (up to 20 files, 10MB each)
3. Click "Start Video Processing"
4. Wait for video completion
5. Optionally add AI audio narration
6. Download the final video

### 2. ICAS Marketing Tool

**Purpose**: Create engaging social media content for events, advertisements, and announcements.

**Features**:
- Multiple post types (Event, Advertisement, Announcement)
- Festival-specific templates
- Custom text input
- Logo upload and integration
- Multiple aspect ratios for different platforms
- AI-powered content generation
- Template-based design system

**API Endpoints**:
- `POST /api/marketing-tool/generate` - Generate content
- `POST /api/marketing-tool/upload-logo` - Upload logo
- `GET /api/marketing-tool/festivals` - Get available festivals
- `GET /api/marketing-tool/aspect-ratios` - Get aspect ratios
- `GET /api/marketing-tool/models` - Get generation models
- `GET /api/marketing-tool/status/:jobId` - Check job status
- `GET /api/marketing-tool/download/:jobId` - Download content

**Usage**:
1. Navigate to `/administration/marketing-tool`
2. Select post type (Event, Advertisement, or Announcement)
3. Choose festival (for event posts)
4. Enter custom text (for ads and announcements)
5. Upload logo (optional)
6. Select generation model
7. Choose aspect ratios
8. Click "Generate Images"
9. Download generated content

## Access Control

All administration tools require admin privileges. Users must:
1. Be logged in to the system
2. Have the "admin" role assigned
3. Access tools through the `/administration` route

## Technical Implementation

### Frontend
- React components with TypeScript
- Tailwind CSS for styling
- Shadcn/ui component library
- React Router for navigation
- Protected routes with role-based access control

### Backend
- Express.js server with TypeScript
- Multer for file uploads
- UUID generation for job tracking
- In-memory job storage (can be extended to database)
- RESTful API design

### File Storage
- Uploads stored in `/uploads` directory
- Videos stored in `/videos` directory
- Audio files stored in `/audio` directory
- Logos stored in `/logos` directory

## Dependencies

### New Dependencies Added
- `@google/generative-ai` - AI content generation
- `axios` - HTTP client for API calls
- `multer` - File upload handling
- `uuid` - Unique identifier generation
- `form-data` - Form data handling

## Future Enhancements

### Planned Features
1. **Content Management System**
   - News article management
   - Event calendar management
   - Media library
   - SEO optimization tools

2. **User Management**
   - User account management
   - Role and permission system
   - Activity logging
   - Access control

3. **Analytics Dashboard**
   - Website traffic analysis
   - User engagement metrics
   - Content performance tracking
   - Custom reporting

4. **System Settings**
   - Configuration management
   - API integrations
   - Backup and restore
   - System maintenance

### Technical Improvements
1. **Database Integration**
   - Replace in-memory storage with persistent database
   - User session management
   - Audit logging

2. **File Processing**
   - Real video processing with FFmpeg
   - AI audio generation with ElevenLabs
   - Image optimization and compression

3. **Security Enhancements**
   - File type validation
   - Virus scanning
   - Rate limiting
   - Input sanitization

## Troubleshooting

### Common Issues

1. **File Upload Failures**
   - Check file size limits (10MB for images, 5MB for logos)
   - Ensure file types are supported
   - Verify upload directory permissions

2. **Processing Failures**
   - Check server logs for error messages
   - Verify API endpoints are accessible
   - Ensure all dependencies are installed

3. **Access Denied**
   - Verify user is logged in
   - Check user has admin role
   - Clear browser cache and cookies

### Logs and Debugging
- Server logs are written to console
- Check browser developer tools for frontend errors
- Verify API responses in Network tab

## Support

For technical support or feature requests, contact the development team or create an issue in the project repository. 