Sarvam AI Frontend Assignment
Build a Video Dubbing Studio Lite

🎯 Objective
Create a simple web app where users can upload a video, generate a mocked dubbed version with translated subtitles in another language, edit translation, video features and settings, able to check preview, and export the final dubbed video.

🧭 User Flow & Features
1. Video Upload
Upload local video files (e.g., .mp4)
Show progress/loading indicator during processing simulation

2. Translate & Subtitle Generation (Mocked)
User selects a target language for dubbing
Simulate backend dubbing API call with a delay
Show the transcription and translation in an editor
Finally return mocked dubbed audio and translated subtitles (use dummy content)

3. Dubbed Video Preview
Play original video with:
Dubbed audio track replacing original audio
Subtitles synced and displayed in the selected language

4. Translation Editing
Allow users to click translation and edit text inline
The edited sentence should be highlighted representing “sentence where edit is made” by the user.

5. Video editing features (UI Only)
Provide controls to trim video start/end times (no actual processing) - example, imagine how you do in a video editing tool, being able to adjust the chunk length.
Muting/unmuting an audio track, realtime increase/decrease volume in the video player
Refer below mentioned platforms under competition benchmark for reference.

6. Export (Mocked)
Button to “Export Dubbed Video”
Simulate export process and show a dummy download link

🌐 Suggestion: Use Sarvam APIs (Optional, not a deciding factor)
While this is a mocked assignment, if you'd like to simulate actual Indian language support:

Use Sarvam Translate API to fake translations of subtitles
Use Sarvam TTS API to simulate dubbed audio per line

💡 Implementation Pro Tips
Use Next.js with TypeScript and tailwindcss
All backend/API interactions must be mocked (simulate with timeouts and dummy data)
Focus on clean, intuitive UI and smooth state management
Handle video, audio, and subtitle synchronization carefully, that's important
Use available libraries for video player, sliders, subtitles display, etc.
No authentication or real media processing required
You are encouraged to use AI Copilot tools for the assignment

Suggested Folder Structure
/app
  /upload
  /editor
  /preview
  /export

/components
  VideoUploader.tsx
  SubtitleEditor.tsx
  DubbedVideoPlayer.tsx
  ControlsPanel.tsx

/lib
  mockTranslate.ts
  mockExport.ts
  subtitleUtils.ts

/styles
  tailwind.css

🧱 Tech Stack & Tools
	•	Framework: Next.js (with App Router or Pages Router)
	•	Language: TypeScript
	•	State Management: redux-toolkit (for larger states like video + subtitles + edits)
	•	UI Library: TailwindCSS or shadcn/ui
	•	Video Playback: video.js or react-player
	•	Subtitles: WebVTT format + custom rendering
	•	Sliders/Trimming: rc-slider or @mui/material sliders

🧭 Feature Implementation Plan

1. Video Upload
	•	Component: <VideoUploader />
	•	Accept .mp4 or similar video files
	•	Use URL.createObjectURL() to preview video
	•	Simulate loading/processing with setTimeout

2. Translation & Subtitle Generation (Mocked)
	•	Component: <TranslationEditor />
	•	User selects a language → trigger setTimeout (simulate backend)
	•	Load dummy data:
        const subtitles = [
            { start: 0, end: 5, text: "Hello, how are you?", translation: "नमस्ते, आप कैसे हैं?", edited: false },
            ...
        ]
	•	Optionally call Sarvam Translate API to mock translation

3. Dubbed Video Preview
	•	Component: <DubbedVideoPlayer />
	•	Replace audio (simulate with silent dubbed audio or dummy TTS)
	•	Sync subtitles using cues and custom rendering
	•	Allow toggling mute/original/dubbed audio
	•	Allow volume adjustment using a slider

4. Translation Editing
	•	Component: <SubtitleEditor />
	•	Inline editing using contentEditable or inputs
	•	Track edits with edited: true flag and highlight using CSS

5. Video Editing Features (UI Only)
	•	Trimming sliders: set start/end time (just store state, don’t actually trim video)
	•	Mute/unmute toggle and volume range slider
	•	Bonus: waveform mock using wavesurfer.js or SVG

6. Export (Mocked)
	•	Button: “Export Dubbed Video”
	•	Simulate export with setTimeout, then show dummy .mp4 download link
🌐 Optional Enhancements
Responsive design and keyboard accessibility
Undo/redo for subtitle edits
Persist translation edits using localStorage
Display voice waveforms (audio tracks) for dubbed audio (bonus)

🔍 Competitor Benchmarks (for reference)
You're encouraged to take UI/UX or feature inspiration from existing platforms:
ElevenLabs
Check out the demo video here - https://elevenlabs.io/docs/product-guides/products/dubbing/dubbing-studio
Dubverse.ai
HeyGen

