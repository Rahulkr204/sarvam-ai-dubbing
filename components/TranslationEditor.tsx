"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button, Spin, Typography, message, Alert, Input } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../lib/store';

const { Text } = Typography;

const SPEAKER_COLORS = [
  'bg-blue-400',
  'bg-pink-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-purple-400',
];

const DUMMY_SUBTITLES = [
  { key: 1, start: 0, end: 5, speaker: 'Speaker 2', text: 'This is some test text, but I missed', translation: 'Ceci est un texte de test.', edited: false },
  { key: 2, start: 5, end: 10, speaker: 'Speaker 1', text: 'I agree.', translation: "Je suis d'accord.", edited: false },
  { key: 3, start: 10, end: 15, speaker: 'Speaker 2', text: 'Hmm...are you sure?', translation: 'Hum...es-tu sûr?', edited: false },
];

const LANGUAGES: { [key: string]: string } = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ta: 'Tamil',
};

function getSpeakerColor(speaker: string) {
  // Assign a color based on speaker name hash
  let hash = 0;
  for (let i = 0; i < speaker.length; i++) hash += speaker.charCodeAt(i);
  return SPEAKER_COLORS[hash % SPEAKER_COLORS.length];
}

const SpeakerCard: React.FC<{
  speaker: string;
  original: string;
  translation: string;
  onEditOriginal: (v: string) => void;
  onEditTranslation: (v: string) => void;
  editedOriginal: boolean;
  editedTranslation: boolean;
  start: number;
  end: number;
  sourceLang: string;
  targetLang: string;
  active?: boolean;
}> = ({ speaker, original, translation, onEditOriginal, onEditTranslation, editedOriginal, editedTranslation, start, end, sourceLang, targetLang, active }) => (
  <div className={
    'rounded-2xl shadow bg-white mb-4 p-0 overflow-hidden hover:border-blue-200 ' +
    (active
      ? 'border-2 border-blue-300 ring-2 ring-blue-200 bg-blue-50 transition-all'
      : 'border border-gray-200')
  }>
    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
      <span className={`w-3 h-3 rounded-full ${getSpeakerColor(speaker)}`}></span>
      <span className="font-semibold text-gray-700 text-sm">{speaker}</span>
      <span className="ml-2 text-xs text-gray-400">{start}s - {end}s</span>
    </div>
    <div className="flex flex-row gap-2 px-4 pb-3">
      {/* Original */}
      <div className="flex-1 flex flex-col gap-1">
        <Text type="secondary" className="text-xs mb-1">{LANGUAGES[sourceLang] || 'Original'}</Text>
        <Input.TextArea
          value={original}
          onChange={e => onEditOriginal(e.target.value)}
          autoSize
          className={`rounded-xl border-none bg-gray-50 focus:bg-white transition ${editedOriginal ? 'ring-2 ring-blue-300' : ''}`}
          placeholder="Original text"
        />
        <Button size="small" type="text" className="text-xs text-gray-500 w-fit">Transcribe Audio</Button>
      </div>
      {/* Arrow */}
      <div className="flex items-center justify-center px-2 text-gray-300 text-2xl">→</div>
      {/* Translation */}
      <div className="flex-1 flex flex-col gap-1">
        <Text type="secondary" className="text-xs mb-1">{LANGUAGES[targetLang] || 'Translation'}</Text>
        <Input.TextArea
          value={translation}
          onChange={e => onEditTranslation(e.target.value)}
          autoSize
          className={`rounded-xl border-none bg-gray-50 focus:bg-white transition ${editedTranslation ? 'ring-2 ring-green-300' : ''}`}
          placeholder="Translation"
        />
        <Button size="small" type="text" className="text-xs text-gray-500 w-fit">Generate Audio</Button>
      </div>
    </div>
  </div>
);

interface TranslationEditorProps {
  subtitles?: { start: number; end: number; text: string; translation: string }[];
  onCardClick?: (start: number) => void;
  currentTime?: number;
}

const TranslationEditor: React.FC<TranslationEditorProps> = ({ subtitles: propSubtitles, onCardClick, currentTime }) => {
  const sourceLang = useSelector((state: RootState) => state.video.sourceLang);
  const targetLang = useSelector((state: RootState) => state.video.targetLang);
  const [loading, setLoading] = useState(false);
  const [subtitles, setSubtitles] = useState(propSubtitles || DUMMY_SUBTITLES);
  const [edited, setEdited] = useState<{ [k: number]: { original: boolean; translation: boolean } }>({});

  // Find active subtitle index
  const activeIdx = currentTime !== undefined && subtitles.length > 0
    ? subtitles.findIndex(s => currentTime >= s.start && currentTime < s.end)
    : -1;

  // Refs for auto-scroll
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (activeIdx >= 0 && cardRefs.current[activeIdx]) {
      cardRefs.current[activeIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIdx]);

  const handleGenerate = () => {
    if (!targetLang) {
      message.warning('No target language selected');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSubtitles(propSubtitles || DUMMY_SUBTITLES);
      setLoading(false);
    }, 1000);
  };

  const handleEdit = (idx: number, field: 'original' | 'translation', value: string) => {
    setSubtitles(subtitles =>
      subtitles.map((s, i) =>
        i === idx ? { ...s, [field === 'original' ? 'text' : 'translation']: value } : s
      )
    );
    setEdited(e => ({
      ...e,
      [idx]: { ...e[idx], [field]: true },
    }));
  };

  if (!sourceLang || !targetLang) {
    return <Alert message="No source or target language selected. Please go back and select both languages." type="warning" showIcon className="mt-8" />;
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="mb-2 px-6">
        <Text strong>
          {LANGUAGES[sourceLang] || sourceLang} → {LANGUAGES[targetLang] || targetLang}
        </Text>
      </div>
      <Button type="primary" onClick={handleGenerate} disabled={loading} className="mb-2 mx-6">
        Generate Translation
      </Button>
      {loading && <Spin tip="Generating translation..." />}
      <div className="flex-1 overflow-y-auto min-h-0 px-6">
        {!loading && subtitles.map((sub, idx) => (
          <div
            key={idx}
            ref={el => { cardRefs.current[idx] = el; }}
            onClick={() => onCardClick && onCardClick(sub.start)}
            style={{ cursor: onCardClick ? 'pointer' : undefined }}
            className={'mb-2'}
          >
            <SpeakerCard
              speaker={'EN'}
              original={sub.text}
              translation={sub.translation}
              onEditOriginal={v => handleEdit(idx, 'original', v)}
              onEditTranslation={v => handleEdit(idx, 'translation', v)}
              editedOriginal={!!edited[idx]?.original}
              editedTranslation={!!edited[idx]?.translation}
              start={sub.start}
              end={sub.end}
              sourceLang={sourceLang}
              targetLang={targetLang}
              active={activeIdx === idx}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationEditor;