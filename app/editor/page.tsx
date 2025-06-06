"use client";

import React, { useRef, useState, useEffect } from 'react';
import TranslationEditor from '../../components/TranslationEditor';
import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import TimelineControls from '../../components/TimelineControls';
import { parseAndAlignSubtitles } from '../../lib/subtitleUtils';
import { useRouter } from 'next/navigation';

const EditorPage = () => {
  const videoUrl = useSelector((state: RootState) => state.video.videoUrl);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trim, setTrim] = useState<[number, number]>([0, 0]);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [alignedSubtitles, setAlignedSubtitles] = useState<any[]>([]);

  // Redirect to / if no videoUrl
  useEffect(() => {
    if (!videoUrl) {
      router.push('/');
    }
  }, [videoUrl, router]);

  // Fetch and align subtitles on mount
  useEffect(() => {
    async function fetchSubs() {
      const [eng, hin] = await Promise.all([
        fetch('/audio/demo_en.srt').then(r => r.text()),
        fetch('/audio/demo.srt').then(r => r.text()),
      ]);
      setAlignedSubtitles(parseAndAlignSubtitles(eng, hin));
    }
    fetchSubs();
  }, []);

  // Update duration when video loads
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setTrim([0, videoRef.current.duration]);
    }
  };

  // Play/pause logic
  const handlePlayPause = () => {
    setPlaying(p => {
      const next = !p;
      if (videoRef.current) {
        if (next) {
          // Only reset to trim[0] if at end of trim
          if (videoRef.current.currentTime >= trim[1] || videoRef.current.currentTime < trim[0]) {
            videoRef.current.currentTime = trim[0];
            setCurrentTime(trim[0]);
          }
          if (videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
          }
        } else {
          if (!videoRef.current.paused) {
            videoRef.current.pause();
          }
        }
      }
      return next;
    });
  };

  // Seek logic
  const handleSeek = (t: number) => {
    setCurrentTime(t);
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      videoRef.current.pause();
    }
  };

  // Sync video time with state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= trim[1]) {
        video.pause();
        setPlaying(false);
      }
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [trim]);

  // Sync mute/volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex h-[80vh]">
        {/* Left Panel: Subtitle/Translation Editor */}
        <div className="w-[50%] min-w-[480px] border-r bg-white p-0 h-full flex flex-col">
          <div className="p-6 pb-2 sticky top-0 z-10 bg-white">
            <h1 className="text-2xl font-bold mb-4">Translate & Edit Subtitles</h1>
          </div>
          <div className="flex-1 min-h-0">
            <TranslationEditor
              subtitles={alignedSubtitles}
              currentTime={currentTime}
              onCardClick={start => {
                if (videoRef.current) {
                  videoRef.current.currentTime = start;
                  videoRef.current.pause();
                }
                setCurrentTime(start);
              }}
            />
          </div>
        </div>
        {/* Right Panel: Video Player */}
        <div className="flex-1 flex items-center justify-center bg-black h-full">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              controls={false}
              className="rounded shadow max-w-full max-h-[70vh] bg-black"
              style={{ width: 700 }}
              onLoadedMetadata={handleLoadedMetadata}
            />
          ) : (
            <div className="text-white text-lg">No video loaded</div>
          )}
        </div>
      </div>
      {/* Bottom: Timeline Controls */}
      <div className="h-[20%] w-full border-t bg-white flex flex-col items-center justify-center">
        {duration > 0 ? (
          <TimelineControls
            duration={duration}
            trim={trim}
            onTrimChange={setTrim}
            currentTime={currentTime}
            onSeek={handleSeek}
            muted={muted}
            onMuteChange={setMuted}
            volume={volume}
            onVolumeChange={setVolume}
            playing={playing}
            onPlayPause={handlePlayPause}
          />
        ) : (
          <div className="text-gray-400 text-sm py-8">Loading video...</div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;