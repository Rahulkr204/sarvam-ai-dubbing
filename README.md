# Sarvam AI: Frontend Assignment

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Features

### Homepage
- Create new dubbing projects by providing:
  - Project name (e.g. "Motivation Speech...")
  - Upload source video file (MP4 format, max 3 minutes)
  - Select source language (English)
  - Select target language (Hindi)
  - Start dubbing to proceed to editor

### Editor Page
- Translation Editor
  - View and edit subtitles extracted from video
  - Generated VTT subtitle file with timestamps
  - Initial dubbed audio generated using Sarvam TTS
  - Edit subtitle text and timing

- Video Player
  - Preview video with subtitles
  - Muted source video by default
  - Toggle between original and dubbed audio
  - Subtitle track integration via HTML5 track element

- Timeline Controls
  - Visual timeline showing video duration
  - Switch between original and dubbed audio tracks
  - Volume control slider for audio tracks
  - Trim video using drag handles
  - Synchronized subtitles and audio for trimmed section
  - Export final dubbed video with selected options

![Sarvam Dubbing Studio Interface](/public/image.jpeg)

## Demo Video

[[Sarvam Dubbing Studio Demo]](https://www.loom.com/share/da8e295f2ddb464ca88b2ce9bd4024dc)

For trying out features, download this file: