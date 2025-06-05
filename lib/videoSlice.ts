import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VideoState {
  videoUrl: string | null;
  videoFile: File | null;
  language: string | null;
  projectName: string | null;
  sourceLang: string | null;
  targetLang: string | null;
}

const initialState: VideoState = {
  videoUrl: null,
  videoFile: null,
  language: null,
  projectName: null,
  sourceLang: null,
  targetLang: null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideo(state, action: PayloadAction<{ file: File; url: string }>) {
      state.videoFile = action.payload.file;
      state.videoUrl = action.payload.url;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setProjectInfo(state, action: PayloadAction<{ projectName: string; sourceLang: string; targetLang: string }>) {
      state.projectName = action.payload.projectName;
      state.sourceLang = action.payload.sourceLang;
      state.targetLang = action.payload.targetLang;
    },
    reset(state) {
      state.videoFile = null;
      state.videoUrl = null;
      state.language = null;
      state.projectName = null;
      state.sourceLang = null;
      state.targetLang = null;
    },
  },
});

export const { setVideo, setLanguage, setProjectInfo, reset } = videoSlice.actions;
export default videoSlice.reducer;