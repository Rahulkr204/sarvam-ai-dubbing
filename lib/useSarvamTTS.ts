import { useState } from 'react';
import { SarvamAIClient } from 'sarvamai';
import { TextToSpeechModel } from 'sarvamai/api/types/TextToSpeechModel';
import { TextToSpeechSpeaker } from 'sarvamai/api/types/TextToSpeechSpeaker';
import { TextToSpeechLanguage } from 'sarvamai/api/types/TextToSpeechLanguage';

interface UseSarvamTTSOptions {
  text: string;
  language: string; // e.g., 'hi-IN'
  speaker?: string; // e.g., 'anushka'
  apiKey: string;
  model?: string;
}

// Helper: Split text into 2000-char chunks
function chunkText(text: string, chunkSize = 2000): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// Helper: Decode base64 audio to Uint8Array
function decodeBase64Audio(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper: Concatenate multiple Uint8Arrays
function concatAudioBuffers(buffers: Uint8Array[]): Uint8Array {
  const totalLength = buffers.reduce((sum, arr) => sum + arr.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    combined.set(buffer, offset);
    offset += buffer.length;
  }
  return combined;
}

function decodeBase64AudioToUrl(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const audioBlob = new Blob([bytes], { type: 'audio/wav' });
  return URL.createObjectURL(audioBlob);
}

export function useSarvamTTS({ text, language, speaker = 'anushka', apiKey, model = 'bulbul:v2' }: UseSarvamTTSOptions) {
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: Get localStorage key for this language
  function getStorageKey(lang: string) {
    return `sarvam_audio_${lang}`;
  }

  // Helper: Load audio base64 array from localStorage
  function loadAudioBase64FromStorage(lang: string): string[] | null {
    const key = getStorageKey(lang);
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  // Helper: Save audio base64 array to localStorage
  function saveAudioBase64ToStorage(lang: string, base64Arr: string[]) {
    const key = getStorageKey(lang);
    localStorage.setItem(key, JSON.stringify(base64Arr));
  }

  async function fetchTTSChunk(chunk: string) {
    const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });
    const response = await client.textToSpeech.convert({
      text: chunk,
      model: TextToSpeechModel.BulbulV2,
      speaker: TextToSpeechSpeaker.Anushka,
      target_language_code: language as any, // already validated
    });
    return response.audios || [];
  }

  const generateAudio = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Check localStorage for audio for this language
      const cachedBase64Arr = loadAudioBase64FromStorage(language);
      if (cachedBase64Arr && cachedBase64Arr.length > 0) {
        setAudioUrls(cachedBase64Arr.map(decodeBase64AudioToUrl));
        setLoading(false);
        return;
      }
      // 2. If not found, generate and store
      const chunks = chunkText(text, 2000);
      let allBase64: string[] = [];
      let urls: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const audios = await fetchTTSChunk(chunk);
        allBase64.push(...audios);
        const chunkUrls = audios.map(decodeBase64AudioToUrl);
        urls.push(...chunkUrls);
      }
      if (urls.length > 0) {
        setAudioUrls(urls);
        // saveAudioBase64ToStorage(language, allBase64);
      } else {
        setError('No audio data received');
        setAudioUrls([]);
      }
    } catch (err: any) {
      setError(err.message);
      setAudioUrls([]);
    } finally {
      setLoading(false);
    }
  };

  return { audioUrls, loading, error, generateAudio };
}