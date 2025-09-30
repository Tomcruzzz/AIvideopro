# AI Video Pro - Setup Guide

This guide will help you get AI Video Pro up and running quickly.

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- A Supabase account (free tier works fine)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### A. Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and wait for it to initialize

#### B. Run Database Migration

1. In your Supabase dashboard, go to the SQL Editor
2. Open the file `supabase/migrations/create_video_editor_schema.sql`
3. Copy all the SQL content
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

This will create:
- 5 database tables (projects, timeline_clips, ai_generation_jobs, media_assets, processing_jobs)
- All necessary indexes for performance
- Row Level Security policies for data protection
- Automatic timestamp triggers

#### C. Create Storage Bucket

1. In your Supabase dashboard, go to "Storage"
2. Click "Create Bucket"
3. Name it `media`
4. Set it to **Public** (so uploaded files can be accessed)
5. Click "Create Bucket"

#### D. Update Environment Variables

1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy your Project URL and anon/public key
3. Update the `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Create Your First Account

1. Click "Sign Up"
2. Enter an email and password (minimum 6 characters)
3. You'll be automatically logged in

### 5. Test the Application

#### Create a Project
1. Click "New Project" on the dashboard
2. A new project will be created automatically

#### Upload Media
1. Open a project
2. Click the "Upload" button
3. Drag and drop a video, image, or audio file
4. The file will upload and appear on the timeline

#### AI Generation (Demo Mode)
1. Click "AI Generate"
2. Choose Text-to-Video or Image-to-Video
3. Select an AI provider (Runway, Kling, Veo3, or Seadance)
4. Enter a prompt
5. Click "Generate Video"
6. You'll see a notification that generation has started

**Note:** The AI generation is currently in demo mode. To enable real AI generation, you'll need to integrate actual AI provider APIs.

#### Timeline Editing
1. Drag clips on the timeline to reposition them
2. Click a clip to see its properties panel
3. Adjust opacity, speed, and track position
4. Click the play button to preview your timeline
5. Use zoom controls to navigate the timeline

## Production Build

```bash
npm run build
```

This creates an optimized build in the `dist` folder ready for deployment.

## Deploying to Production

### Option 1: Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Option 2: Netlify

```bash
npm run build
# Drag and drop the dist folder to Netlify
```

### Option 3: Any Static Host

Build the project and upload the `dist` folder to your hosting provider.

**Important:** Make sure to set the environment variables on your hosting platform.

## Enabling Real AI Generation

To connect real AI providers:

### 1. Get API Keys

Sign up for accounts with your chosen providers:
- [Runway ML](https://runwayml.com)
- [Kling AI](https://klingai.com)
- Veo 3 (Google)
- Seadance

### 2. Add API Keys to Environment

Create a `.env.local` file:

```env
VITE_RUNWAY_API_KEY=your_runway_key
VITE_KLING_API_KEY=your_kling_key
VITE_VEO3_API_KEY=your_veo3_key
VITE_SEADANCE_API_KEY=your_seadance_key
```

### 3. Update AI Service

Modify `src/services/aiGenerationService.ts` to call the actual AI provider APIs instead of the mock service.

### 4. Deploy Edge Functions

The webhook handler is ready in `supabase/functions/ai-webhook/index.ts`. Deploy it using the Supabase CLI:

```bash
supabase functions deploy ai-webhook
```

### 5. Configure Webhooks

In each AI provider's dashboard, set the webhook URL to:
```
https://your-project.supabase.co/functions/v1/ai-webhook
```

## Troubleshooting

### Authentication Issues

**Problem:** Can't sign up or login
**Solution:** Check that your Supabase URL and anon key are correct in `.env`

### Upload Fails

**Problem:** Files fail to upload
**Solution:**
1. Verify the `media` storage bucket exists in Supabase
2. Make sure the bucket is set to Public
3. Check file size limits (Supabase free tier has a 50MB limit per file)

### Timeline Not Showing Clips

**Problem:** Clips don't appear on timeline
**Solution:**
1. Check browser console for errors
2. Verify the database migration ran successfully
3. Ensure Row Level Security policies are in place

### Video Player Shows Black Screen

**Problem:** Video player doesn't show content
**Solution:**
1. Check that video URLs are publicly accessible
2. Verify CORS is enabled on video sources
3. Check browser console for CORS errors

## Support

For issues and questions:
1. Check the browser console for error messages
2. Verify all setup steps were completed
3. Check that the Supabase project is active
4. Review the README.md for additional documentation

## Next Steps

- Add your own AI provider integrations
- Customize the UI theme and branding
- Implement video export/rendering
- Add more timeline features (transitions, effects)
- Build collaboration features

Enjoy creating AI-powered videos!