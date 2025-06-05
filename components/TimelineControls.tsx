"use client";

import React, { useState } from 'react';
import { Switch, Button, Slider } from 'antd';
import { SoundOutlined, SoundFilled, PlayCircleOutlined, PauseCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import TimelineSeekbar from './TimelineSeekbar';

interface TimelineControlsProps {
  duration: number;
  trim: [number, number];
  onTrimChange: (val: [number, number]) => void;
  currentTime: number;
  onSeek: (val: number) => void;
  muted: boolean;
  onMuteChange: (val: boolean) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  playing: boolean;
  onPlayPause: () => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  duration,
  trim,
  onTrimChange,
  currentTime,
  onSeek,
  muted,
  onMuteChange,
  volume,
  onVolumeChange,
  playing,
  onPlayPause,
}) => {
  const [exporting, setExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setDownloadUrl('/dummy-dubbed-video.mp4');
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col h-full gap-2 px-8 py-1 items-start">
      {/* Audio Controls */}
      <div className="flex items-center gap-6 mb-2 w-full justify-center" style={{ minHeight: 72 }}>
        <Button
          icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={onPlayPause}
          type="default"
          shape="circle"
          size="large"
        />
        <Switch
          checkedChildren={<SoundFilled />}
          unCheckedChildren={<SoundOutlined />}
          checked={!muted}
          onChange={v => onMuteChange(!v)}
        />
        <span className="text-xs text-gray-500">Volume</span>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={onVolumeChange}
          style={{ width: 120 }}
        />
        <span className="text-xs text-gray-500 w-8 text-right">{Math.round(volume * 100)}</span>
      </div>
      {/* Timeline Seekbar */}
      <TimelineSeekbar
        duration={duration}
        trim={trim}
        onTrimChange={onTrimChange}
        currentTime={currentTime}
        onSeek={onSeek}
      />
      {/* Export button at extreme right bottom */}
      {/* <div className="absolute right-8 bottom-4 flex items-center gap-2">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={handleExport}
          size="middle"
        >
          Export Dubbed Video
        </Button>
        {downloadUrl && !exporting && (
          <a
            href={downloadUrl}
            download
            className="ml-2 text-blue-600 underline text-sm"
          >
            Download .mp4
          </a>
        )}
      </div> */}
    </div>
  );
};

export default TimelineControls;