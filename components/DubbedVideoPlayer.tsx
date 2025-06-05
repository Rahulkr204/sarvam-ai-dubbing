"use client";

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import ReactPlayer from 'react-player';

export interface DubbedVideoPlayerRef {
  play: () => void;
  pause: () => void;
}

const DubbedVideoPlayer = forwardRef<
  DubbedVideoPlayerRef,
  { url: string | null; muted?: boolean; volume?: number }
>(({ url, muted = false, volume = 1 }, ref) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = React.useState(false);

  useImperativeHandle(ref, () => ({
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
  }));

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      {url ? (
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          controls
          width="100%"
          height="100%"
          muted={muted}
          volume={volume}
          style={{ maxHeight: '70vh', borderRadius: 12, background: 'black' }}
        />
      ) : (
        <div className="text-white text-lg">No video loaded</div>
      )}
    </div>
  );
});

DubbedVideoPlayer.displayName = 'DubbedVideoPlayer';
export default DubbedVideoPlayer;