"use client";

import React, { useRef, useState, useEffect } from 'react';
import TranslationEditor from '../../components/TranslationEditor';
import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import TimelineControls from '../../components/TimelineControls';
import { parseAndAlignSubtitles } from '../../lib/subtitleUtils';
import { useRouter } from 'next/navigation';
import TimelineSeekbar from '../../components/TimelineSeekbar';
import { Button, Switch, Segmented, Typography, Spin } from 'antd';
import { useSarvamTTS } from '@/lib/useSarvamTTS';
import { LANGUAGES } from '@/lib/languages';

const { Text } = Typography;

const EditorPage = () => {
  const videoUrl = useSelector((state: RootState) => state.video.videoUrl);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trim, setTrim] = useState<[number, number]>([0, 0]);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const sourceLang = useSelector((state: RootState) => state.video.sourceLang);
  const targetLang = useSelector((state: RootState) => state.video.targetLang);
  const [duration, setDuration] = useState(0);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [useDubbedAudio, setUseDubbedAudio] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const [currentAudioIdx, setCurrentAudioIdx] = useState(0);
  const [translationLoading, setTranslationLoading] = useState(false);

  // Handle trim change: pause and seek to new trim start
  const handleTrimChange = (newTrim: [number, number]) => {
    setTrim(newTrim);
    setPlaying(false);
    setCurrentTime(newTrim[0]);
    if (videoRef.current) videoRef.current.currentTime = newTrim[0];
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  // Fetch and align subtitles on mount
  useEffect(() => {
    async function fetchSubs() {
      const [eng, hin] = await Promise.all([
        fetch('/audio/demo_en.srt').then(r => r.text()),
        fetch('/audio/demo.srt').then(r => r.text()),
      ]);
      setSubtitles(parseAndAlignSubtitles(eng, hin));
    }
    fetchSubs();
  }, []);

  // Subtitle edit handler
  const handleEditSubtitle = (idx: number, field: 'original' | 'translation', value: string) => {
    setSubtitles(subs =>
      subs.map((s, i) =>
        i === idx ? { ...s, [field === 'original' ? 'text' : 'translation']: value } : s
      )
    );
  };

  // Filter subtitles for current trim range
  const trimmedSubtitles = subtitles.filter(
    sub => sub.end > trim[0] && sub.start < trim[1]
  );
  // Collect translated text from trimmed subtitles, limit to 1000 words
  const allTranslatedText = trimmedSubtitles.map(s => s.translation).join(' ');
  const limitedTranslatedText = allTranslatedText.split(/\s+/).slice(0, 1000).join(' ');

  // Sarvam TTS hook (must be after limitedTranslatedText is defined)
  const { audioUrls: dubbedAudioUrls, loading: ttsLoading, error: ttsError, generateAudio } = useSarvamTTS({
    text: limitedTranslatedText,
    language: 'hi-IN', // or dynamic
    speaker: 'anushka',
    apiKey: process.env.NEXT_PUBLIC_SARVAM_API_KEY || '',
  });

  // Redirect to / if no videoUrl
  useEffect(() => {
    if (!videoUrl) {
      router.push('/');
    }
  }, [videoUrl, router]);

  // Update duration when video loads
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setTrim([0, videoRef.current.duration]);
      // Sync audio duration if needed
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  // Play/pause logic (sync video and audio)
  const handlePlayPause = () => {
    setPlaying(p => {
      const next = !p;
      if (videoRef.current && audioRef.current) {
        if (videoRef.current.currentTime >= trim[1] || videoRef.current.currentTime < trim[0]) {
          videoRef.current.currentTime = trim[0];
          setCurrentTime(trim[0]);
          setCurrentAudioIdx(0);
        }
        if (next) {
          if (videoRef.current.paused) videoRef.current.play().catch(() => {});
          if (useDubbedAudio && audioRef.current.paused) audioRef.current.play().catch(() => {});
        } else {
          if (!videoRef.current.paused) videoRef.current.pause();
          if (useDubbedAudio && !audioRef.current.paused) audioRef.current.pause();
        }
      }
      return next;
    });
  };

  // Seek logic (sync video and audio)
  const handleSeek = (t: number) => {
    setCurrentTime(t);
    setPlaying(false);
    if (videoRef.current && audioRef.current) {
      videoRef.current.currentTime = t;
      audioRef.current.currentTime = t;
      videoRef.current.pause();
      audioRef.current.pause();
    }
  };

  // Sync video/audio time with state
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= trim[1]) {
        video.pause();
        audio.pause();
        setPlaying(false);
      }
      if (useDubbedAudio && Math.abs(audio.currentTime - video.currentTime) > 0.1) {
        audio.currentTime = video.currentTime;
      }
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [trim, useDubbedAudio]);

  // Sync mute/volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = useDubbedAudio ? true : muted;
    }
    if (audioRef.current) {
      audioRef.current.muted = !useDubbedAudio || muted;
      audioRef.current.volume = volume;
    }
  }, [muted, volume, useDubbedAudio]);

  // Auto-play dubbed audio when available
  useEffect(() => {
    console.log('dubbedAudioUrls changed:', dubbedAudioUrls);
    if (dubbedAudioUrls && audioRef.current && useDubbedAudio) {
      console.log('Loading dubbed audio into audio element');
      audioRef.current.load(); // Reload the audio element with new source
    }
  }, [dubbedAudioUrls, useDubbedAudio]);

  // Debug audio element
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const handleLoadStart = () => console.log('Audio load started');
      const handleCanPlay = () => console.log('Audio can play');
      const handleError = (e: any) => console.log('Audio error:', e);
      const handleLoadedData = () => console.log('Audio loaded data');

      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadeddata', handleLoadedData);

      return () => {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [dubbedAudioUrls]);

  // Spacebar play/pause (only if not focused on input/button/textarea)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'BUTTON' || (active as HTMLElement).isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        handlePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause]);

  // Prepare tracks for TimelineSeekbar
  const tracks = [
    {
      key: 'video',
      color: '#c7d2fe', // pastel blue
      blocks: [{ key: 1, start: 0, end: duration }],
    },
    {
      key: 'audio',
      color: '#fbbf24', // pastel yellow
      blocks: [{ key: 1, start: 0, end: duration }],
    },
  ];

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportUrl('/audio/hi_demo.wav'); // Dummy file, replace with real export if available
    }, 1500);
  };

  // When dubbedAudioUrls changes, reset audio index
  useEffect(() => {
    setCurrentAudioIdx(0);
  }, [dubbedAudioUrls]);

  // On audio end, play next audio if available
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      if (useDubbedAudio && currentAudioIdx < dubbedAudioUrls.length - 1) {
        console.log(currentAudioIdx, "current")
        setCurrentAudioIdx(idx => idx + 1);
      } else {
        setPlaying(false);
      }
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentAudioIdx, dubbedAudioUrls, useDubbedAudio]);

  // When currentAudioIdx changes, update audio src and play if playing
  useEffect(() => {
    if (audioRef.current && useDubbedAudio && dubbedAudioUrls.length > 0) {
      audioRef.current.src = dubbedAudioUrls[currentAudioIdx] || '';
      if (playing) {
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentAudioIdx, dubbedAudioUrls, useDubbedAudio, playing]);

  const handleGenerate = () => {
    setTranslationLoading(true);
    setTimeout(() => {
      // Simulate translation generation (replace with real logic if needed)
      setTranslationLoading(false);
      generateAudio(); // Call TTS audio generation after translation
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex h-[80vh]">
        {/* Left Panel: Subtitle/Translation Editor */}
        <div className="w-[50%] min-w-[480px] border-r bg-white p-0 h-full flex flex-col">
          <div className="p-6 py-2 sticky top-0 z-10 bg-white flex justify-between">
                <div className='flex items-center'>
                    <h1 className="text-2xl font-bold">Translate & Edit Subtitles</h1>
                    <div className='text-xs'>
                        ({(sourceLang && LANGUAGES[sourceLang]) || sourceLang || 'Source'} → {(targetLang && LANGUAGES[targetLang]) || targetLang || 'Target'})
                    </div>
                </div>
                <span className="flex items-center">
                    <Button type="primary" onClick={handleGenerate} disabled={translationLoading} loading={translationLoading}>
                        Generate Translation
                    </Button>
                </span>
          </div>
          <div className="flex-1 min-h-0">
            <TranslationEditor
              subtitles={subtitles}
              currentTime={currentTime}
              trim={trim}
              onCardClick={start => {
                if (videoRef.current) {
                  videoRef.current.currentTime = start;
                  videoRef.current.pause();
                }
                setCurrentTime(start);
              }}
              onEditSubtitle={handleEditSubtitle}
            />
          </div>
        </div>
        {/* Right Panel: Video Player */}
        <div className="flex-1 flex items-center justify-center bg-black h-full">
          {videoUrl ? (
            <div className="relative">
              <video
                ref={videoRef}
                src={videoUrl}
                controls={false}
                className="rounded shadow max-w-full max-h-[70vh] bg-black"
                style={{ width: 700 }}
                onLoadedMetadata={handleLoadedMetadata}
              >
                <track
                  kind="subtitles"
                  src="/audio/demo_hi.vtt"
                  srcLang="hi"
                  label="Hindi"
                  default
                />
              </video>
              {/* Dubbed audio element, only play if useDubbedAudio is true */}
              <audio
                ref={audioRef}
                src={dubbedAudioUrls[currentAudioIdx] || undefined}
                key={dubbedAudioUrls[currentAudioIdx]}
                preload="auto"
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="text-white text-lg">No video loaded</div>
          )}
        </div>
      </div>
      {/* Bottom: Timeline Controls */}
      <div className="h-[20%] w-full border-t bg-white flex flex-row items-center">
        <div className='w-[90%] border-r border-gray-300'>
            {duration > 0 ? (
            <div className="w-full flex flex-col items-center">
                <TimelineControls
                    duration={duration}
                    trim={trim}
                    onTrimChange={handleTrimChange}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                    muted={muted}
                    onMuteChange={setMuted}
                    volume={volume}
                    onVolumeChange={setVolume}
                    playing={playing}
                    onPlayPause={handlePlayPause}
                />
                <TimelineSeekbar
                    duration={duration}
                    trim={trim}
                    onTrimChange={handleTrimChange}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                    tracks={tracks}
                />
            </div>
            ) : (
            <div className="text-gray-400 text-sm py-8">Loading video...</div>
            )}
        </div>
        <div className='w-[10%] flex flex-col h-full px-2'>
            {/* Audio Selection */}
            <div className="flex mb-2 w-full">
                <Segmented
                    value={useDubbedAudio ? 'dubbed' : 'original'}
                    onChange={(value) => setUseDubbedAudio(value === 'dubbed')}
                    options={[
                        { label: 'Original', value: 'original' },
                        { label: 'Dubbed', value: 'dubbed' }
                    ]}
                />
                {ttsLoading && <span className="text-sm text-gray-500">Generating dubbed audio...</span>}
            </div>
            <div className='flex flex-col'>
                <Button type="primary" size='small' onClick={handleExport} loading={exporting}>
                    Export Video
                </Button>
                {exportUrl && (
                    <a href={exportUrl} download className="ml-4 text-blue-600 underline">Download</a>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;