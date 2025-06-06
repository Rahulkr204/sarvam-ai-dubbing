"use client";

import React, { useRef } from 'react';

// Replace DUMMY_TRACKS with a dynamic tracks array based on duration
const getTracks = (duration: number) => [
  {
    key: 'track1',
    color: '#c7d2fe', // pastel blue
    blocks: [
      { key: 1, start: 0, end: duration },
    ],
  },
];

interface TimelineSeekbarProps {
  duration: number;
  trim: [number, number];
  onTrimChange: (val: [number, number]) => void;
  currentTime: number;
  onSeek: (val: number) => void;
  children?: React.ReactNode;
}

const HANDLE_SIZE = 18;
const PLAYHEAD_SIZE = 16;
const TRACK_HEIGHT = 32;
const TRACK_GAP = 12;

const TimelineSeekbar: React.FC<TimelineSeekbarProps> = ({
  duration,
  trim,
  onTrimChange,
  currentTime,
  onSeek,
  children,
}) => {
  const barRef = useRef<HTMLDivElement>(null);

  // Use barRef's clientWidth for calculations
  const [barWidth, setBarWidth] = React.useState(800);
  React.useEffect(() => {
    if (barRef.current) {
      setBarWidth(barRef.current.clientWidth);
    }
    const handleResize = () => {
      if (barRef.current) setBarWidth(barRef.current.clientWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Convert time to px
  const timeToPx = (t: number) => (t / duration) * barWidth;
  const pxToTime = (x: number) => (x / barWidth) * duration;

  // Helper to format seconds as mm:ss
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Drag logic for handles and playhead
  const [dragging, setDragging] = React.useState<null | 'start' | 'end'>(null);
  const [dragPos, setDragPos] = React.useState<number | null>(null);

  const handleDrag = (type: 'start' | 'end' | 'playhead') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (type === 'start' || type === 'end') {
      setDragging(type);
      setDragPos(type === 'start' ? trim[0] : trim[1]);
    } else {
      setDragging(null);
      setDragPos(null);
    }
    const onMove = (moveEvent: MouseEvent) => {
      if (!barRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      let x = moveEvent.clientX - rect.left;
      x = Math.max(0, Math.min(barWidth, x));
      let t = Math.max(0, Math.min(duration, pxToTime(x)));
      if (type === 'start') {
        t = Math.min(t, trim[1]);
        setDragPos(t);
        onTrimChange([t, trim[1]]);
      } else if (type === 'end') {
        t = Math.max(t, trim[0]);
        setDragPos(t);
        onTrimChange([trim[0], t]);
      } else if (type === 'playhead') {
        t = Math.max(trim[0], Math.min(trim[1], t));
        onSeek(t);
      }
    };
    const onUp = () => {
      setDragging(null);
      setDragPos(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Calculate interval duration for 10-15 intervals
  function getNiceInterval(total: number) {
    const targetIntervals = 12;
    const rough = total / targetIntervals;
    // Nice round numbers: 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, etc.
    const nice = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];
    for (let i = 0; i < nice.length; i++) {
      if (rough <= nice[i]) return nice[i];
    }
    return 3600; // fallback 1 hour
  }
  const intervalDuration = getNiceInterval(duration);

  // Render interval ticks and labels
  const intervals = [];
  for (let t = 0; t <= duration; t += intervalDuration) {
    const left = timeToPx(t);
    intervals.push(
      <div key={t} style={{ position: 'absolute', left, top: '-32px', height: '100%', zIndex: 40 }}>
        <div style={{ fontSize: 12, color: '#888', marginLeft: -16, marginTop: 0 }}>{formatTime(t)}</div>
        <div style={{ height: 10, borderLeft: '1px solid #bdbdbd', marginBottom: 2 }} />
      </div>
    );
  }

  const tracks = getTracks(duration);

  // Render tracks and blocks
  const trackRows = tracks.map((track, i) => (
    <div
      key={track.key}
      className="absolute left-0 flex items-center"
      style={{
        top: i * (TRACK_HEIGHT + TRACK_GAP),
        height: '40px',
        width: barWidth,
      }}
    >
      {track.blocks.map(block => (
        <div
          key={block.key}
          className="rounded-md"
          style={{
            position: 'absolute',
            left: timeToPx(block.start),
            width: timeToPx(block.end) - timeToPx(block.start),
            height: '40px',
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
            border: '1px solid #fff',
          }}
        />
      ))}
    </div>
  ));

  // Main timeline bar (seekbar)
  return (
    <div className="relative w-full flex flex-col items-center bg-white">
      {/* Start/end time at edges */}

      <div
        ref={barRef}
        className="relative w-full overflow-visible"
        style={{ height: '88px', userSelect: 'none' }}
      >
        {/* 5s interval ticks and labels */}
        {intervals}
        {/* Gray background bar */}
        <div
          className="absolute left-0 top-0 h-10 rounded-md bg-gray-200 z-9"
          style={{ width: barWidth }}
        />
        {/* Selected (trimmed) region */}
        <div
          className="absolute top-0 h-10 rounded-md bg-blue-100 z-10"
          style={{ left: timeToPx(trim[0]), width: timeToPx(trim[1]) - timeToPx(trim[0]) }}
        />
        {/* Track rows */}
        {trackRows}
        {/* Start handle */}
        <div
          className="absolute w-2 top-1 h-8 bg-blue-300 rounded-sm cursor-ew-resize border-1 border-blue-400 shadow z-100"
          style={{ left: timeToPx(trim[0]) - HANDLE_SIZE / 2 }}
          onMouseDown={handleDrag('start')}
        >
          {/* Floating time label on drag */}
          {dragging === 'start' && dragPos !== null && (
            <div style={{
              position: 'absolute',
              top: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              color: '#333',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 12,
              boxShadow: '0 1px 4px 0 rgba(0,0,0,0.08)',
              zIndex: 20,
              border: '1px solid #e0e0e0',
            }}>{formatTime(dragPos)}</div>
          )}
        </div>
        {/* End handle */}
        <div
          className="absolute w-2 top-1 h-8 bg-blue-300 rounded-sm border-1 border-blue-400 shadow z-100"
          style={{ left: timeToPx(trim[1]) - HANDLE_SIZE / 2, cursor: 'ew-resize' }}
          onMouseDown={handleDrag('end')}
        >
          {/* Floating time label on drag */}
          {dragging === 'end' && dragPos !== null && (
            <div style={{
              position: 'absolute',
              top: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              color: '#333',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 12,
              boxShadow: '0 1px 4px 0 rgba(0,0,0,0.08)',
              zIndex: 100,
              border: '1px solid #e0e0e0',
            }}>{formatTime(dragPos)}</div>
          )}
        </div>
        {/* Playhead (triangle + time label) */}
        <div
          className="absolute z-30 cursor-pointer"
          style={{ left: timeToPx(currentTime) - PLAYHEAD_SIZE / 2, top: -8, width: PLAYHEAD_SIZE, height: 104, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          onMouseDown={handleDrag('playhead')}
        >
          {/* Triangle */}
          <svg width={PLAYHEAD_SIZE} height={12} style={{ display: 'block' }}>
            <polygon points={`0,0 ${PLAYHEAD_SIZE},0 ${PLAYHEAD_SIZE/2},12`} fill="#222" />
          </svg>
          {/* Vertical line */}
          <div style={{ width: 2, height: 32, background: '#1976d2', marginTop: -2, marginBottom: 2 }} />
          {/* Time label below */}
          <div style={{ fontSize: 12, color: '#1976d2', marginTop: 2, fontWeight: 500 }}>{formatTime(currentTime)}</div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSeekbar;