# AI Video Pro

A professional mobile-first web video editor with AI video generation capabilities. Generate videos using Runway ML, Kling AI, Veo 3, or Seadance, and edit them on a powerful timeline without ever downloading files.

## Features

### AI Video Generation
- **Text-to-Video**: Generate videos from text prompts using multiple AI providers
- **Image-to-Video**: Animate static images into dynamic videos
- **Multi-Provider Support**: Choose from Runway, Kling, Veo3, or Seadance
- **Direct Timeline Integration**: Generated videos appear directly in your media library
- **Job Status Tracking**: Monitor AI generation progress in real-time
- **Webhook Support**: Edge function ready for AI provider callbacks

### Video Timeline Editor
- **Multi-Track Timeline**: Arrange clips across multiple layers
- **Drag-and-Drop**: Intuitive clip positioning and reordering
- **Real-Time Video Player**: Canvas-based video preview with clip compositing
- **Synchronized Playback**: Timeline and player stay in sync
- **Clip Properties Panel**: Adjust opacity, speed, and track positioning
- **Zoom Controls**: Navigate timeline at different scales
- **Frame-Accurate Editing**: Precise control over timing

### File Upload System
- **Drag-and-Drop Upload**: Intuitive file upload with visual feedback
- **Multi-Format Support**: Video (MP4, MOV, AVI), Images (PNG, JPG, GIF), Audio (MP3, WAV)
- **Progress Tracking**: Real-time upload progress indication
- **Automatic Duration Detection**: Video duration extracted automatically
- **Direct Timeline Integration**: Uploaded files instantly available

### Media Management
- **Media Library**: Browse all your generated and uploaded assets
- **Asset Organization**: Filter by video, image, or audio
- **Quick Add**: Insert assets into timeline with one click
- **Thumbnail Previews**: Visual preview of all media
- **Upload History**: Track all uploaded and generated content

### Notifications System
- **Toast Notifications**: Real-time feedback for all user actions
- **Success/Error/Info States**: Color-coded notification types
- **Auto-Dismiss**: Notifications automatically clear after 5 seconds
- **Action Confirmations**: Immediate feedback for uploads, saves, and deletions

### Processing Features
- **Lipsync**: Audio-driven facial animation (UI ready)
- **4K Upscaling**: Enhance video quality (UI ready)
- **Export & Render**: Multiple format and quality options (UI ready)

### Project Management
- **Dashboard**: Grid view of all projects
- **Auto-Save**: Projects save automatically
- **Duplicate Projects**: Clone entire projects with one click
- **Project Metadata**: Track resolution, FPS, and duration

### Authentication
- **Email/Password Auth**: Secure user accounts via Supabase
- **Protected Routes**: User data isolation with Row Level Security
- **Session Management**: Automatic session handling

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Icons**: Lucide React
- **Routing**: React Router

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Run the migration SQL in `supabase/migrations/create_video_editor_schema.sql` in your Supabase SQL Editor
   - Update `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Database Schema

### Tables
- **projects**: Video project metadata
- **timeline_clips**: Individual clips on the timeline
- **ai_generation_jobs**: AI video generation request tracking
- **media_assets**: User media library
- **processing_jobs**: Lipsync, upscaling, and render jobs

All tables have Row Level Security enabled to ensure users can only access their own data.

## AI Provider Integration

The application is designed to integrate with multiple AI video generation providers:

- **Runway ML**: Text-to-video and image-to-video generation
- **Kling AI**: Advanced video synthesis
- **Veo 3**: Google's video generation model
- **Seadance**: Alternative AI video provider

To enable AI generation, you'll need to:
1. Obtain API keys from your chosen providers
2. Implement the API calls in the respective service files
3. Handle webhook/polling for job completion
4. Store generated videos in Supabase Storage

## Mobile-First Design

The interface is optimized for mobile devices with:
- Touch-friendly controls
- Responsive timeline
- Swipe gestures (planned)
- Portrait and landscape support
- Optimized performance for mobile browsers

## Future Enhancements

- **Video Playback Engine**: Real-time composite preview
- **Audio Tracks**: Dedicated audio timeline
- **Transitions**: Fade, dissolve, and custom transitions
- **Effects**: Filters, color grading, and visual effects
- **Export Formats**: MP4, WebM, GIF support
- **Cloud Rendering**: Server-side video composition
- **Collaboration**: Shared projects and real-time editing
- **Templates**: Pre-built video templates

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.