"use client";

import React, { useState } from 'react';
import { Upload, Button, Spin, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setVideo, setLanguage } from '../lib/videoSlice';
import { useRouter } from 'next/navigation';

const { Option } = Select;

const LANGUAGES = [
  { label: 'Hindi', value: 'hi' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Tamil', value: 'ta' },
];

const VideoUploader: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | undefined>();
  const dispatch = useDispatch();
  const router = useRouter();

  const beforeUpload = (file: File) => {
    const isMp4 = file.type === 'video/mp4';
    if (!isMp4) {
      message.error('You can only upload MP4 files!');
      return Upload.LIST_IGNORE;
    }
    setLoading(true);
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoFile(file);
      setLoading(false);
      dispatch(setVideo({ file, url }));
    }, 1500);
    return false;
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLang(value);
    dispatch(setLanguage(value));
  };

  const handleContinue = () => {
    if (!videoFile || !selectedLang) {
      message.warning('Please upload a video and select a language');
      return;
    }
    router.push('/editor');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Upload
        accept="video/mp4"
        showUploadList={false}
        beforeUpload={beforeUpload}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Select Video (.mp4)</Button>
      </Upload>
      <Select
        placeholder="Select language"
        style={{ width: 220 }}
        value={selectedLang}
        onChange={handleLanguageChange}
        className="mt-2"
      >
        {LANGUAGES.map(lang => (
          <Option key={lang.value} value={lang.value}>{lang.label}</Option>
        ))}
      </Select>
      {loading && <Spin tip="Processing video..." />}
      {videoUrl && !loading && (
        <video
          src={videoUrl}
          controls
          className="mt-4 rounded shadow max-w-full"
          style={{ width: 400 }}
        />
      )}
      <Button
        type="primary"
        className="mt-4"
        disabled={!videoUrl || !selectedLang}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  );
};

export default VideoUploader;