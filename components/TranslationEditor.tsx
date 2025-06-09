"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button, Spin, Typography, message, Alert, Input } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../lib/store';

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
  active?: boolean;
}> = ({ speaker, original, translation, onEditOriginal, onEditTranslation, editedOriginal, editedTranslation, start, end, active }) => (
  <div className={
    'rounded-2xl shadow bg-white mb-4 p-0 overflow-hidden hover:border-blue-200 ' +
    (active
      ? 'border-2 border-blue-300 ring-2 ring-blue-200 bg-blue-50 transition-all'
      : 'border border-gray-200')
  }>
    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
      <span className="ml-2 text-xs text-gray-400">{start}s - {end}s</span>
    </div>
    <div className="flex flex-row gap-2 px-4 pb-3">
      {/* Original */}
      <div className="flex-1 flex flex-col gap-1">
        <Input.TextArea
          value={original}
          onChange={e => onEditOriginal(e.target.value)}
          className={`rounded-xl border-none bg-gray-50 focus:bg-white transition ${editedOriginal ? 'ring-2 ring-blue-300' : ''}`}
          placeholder="Original text"
        />
      </div>
      {/* Arrow */}
      <div className="flex items-center justify-center px-2 text-gray-300 text-2xl">→</div>
      {/* Translation */}
      <div className="flex-1 flex flex-col gap-1">
        <Input.TextArea
          value={translation}
          onChange={e => onEditTranslation(e.target.value)}
          className={`rounded-xl border-none bg-gray-50 focus:bg-white transition ${editedTranslation ? 'ring-2 ring-green-300' : ''}`}
          placeholder="Translation"
        />
      </div>
    </div>
  </div>
);

interface TranslationEditorProps {
  subtitles?: { start: number; end: number; text: string; translation: string }[];
  onCardClick?: (start: number) => void;
  currentTime?: number;
  trim?: [number, number];
  onEditSubtitle?: (idx: number, field: 'original' | 'translation', value: string) => void;
}

const TranslationEditor: React.FC<TranslationEditorProps> = ({ subtitles: propSubtitles, onCardClick, currentTime, trim, onEditSubtitle }) => {
  // Filter subtitles by trim range
  const filteredSubtitles = trim
    ? (propSubtitles || []).filter(sub => sub.end > trim[0] && sub.start < trim[1])
    : (propSubtitles || []);

  // Find active subtitle index in filtered list
  const activeIdx = currentTime !== undefined && filteredSubtitles.length > 0
    ? filteredSubtitles.findIndex(s => currentTime >= s.start && currentTime < s.end)
    : -1;

  // Refs for auto-scroll
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (activeIdx >= 0 && cardRefs.current[activeIdx]) {
      cardRefs.current[activeIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIdx]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 overflow-y-auto min-h-0 px-6">
        {filteredSubtitles.map((sub, idx) => (
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
              onEditOriginal={v => onEditSubtitle && onEditSubtitle(idx, 'original', v)}
              onEditTranslation={v => onEditSubtitle && onEditSubtitle(idx, 'translation', v)}
              editedOriginal={false}
              editedTranslation={false}
              start={sub.start}
              end={sub.end}
              active={activeIdx === idx}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationEditor;