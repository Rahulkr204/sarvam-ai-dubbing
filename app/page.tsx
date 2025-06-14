"use client";

import React, { useState } from 'react';
import { Form, Input, Select, Button, Upload, message, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setVideo, setProjectInfo } from '../lib/videoSlice';

const { Title } = Typography;
const { Option } = Select;

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Tamil', value: 'ta' },
];

export default function Home() {
  const [form] = Form.useForm();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const beforeUpload = (file: File) => {
    const isMp4 = file.type === 'video/mp4';
    if (!isMp4) {
      message.error('You can only upload MP4 files!');
      return Upload.LIST_IGNORE;
    }
    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration > 180) {
        message.error('Video must be 3 minutes or less.');
        return;
      }
      setVideoUrl(url);
      setVideoFile(file);
      setVideoDuration(tempVideo.duration);
      dispatch(setVideo({ file, url }));
    };
    return false;
  };

  const handleStartDubbing = (values: any) => {
    if (!videoFile) {
      message.error('Please upload a video file');
      return;
    }
    dispatch(setProjectInfo({
      projectName: values.projectName,
      sourceLang: values.sourceLang,
      targetLang: values.targetLang,
    }));
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/editor');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-10">
      <Title level={2} className="mb-8">Sarvam Dubbing Studio</Title>
      <Form
        form={form}
        layout="vertical"
        className="p-8 max-w-xl w-full"
        onFinish={handleStartDubbing}
        initialValues={{ sourceLang: 'en', targetLang: 'hi' }}
      >
        <Form.Item label="Project name" name="projectName" rules={[{ required: true, message: 'Please enter a project name' }]}>
          <Input placeholder="e.g. JFK We Choose the Moon" value={projectName} onChange={e => setProjectName(e.target.value)} />
        </Form.Item>
        <div className="flex gap-4">
          <Form.Item label="Source Language" name="sourceLang" className="flex-1" rules={[{ required: true }]}>
            <Select placeholder="Select source language">
              {LANGUAGES.map(lang => <Option key={lang.value} value={lang.value}>{lang.label}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Target Language" name="targetLang" className="flex-1" rules={[{ required: true }]}>
            <Select placeholder="Select target language">
              {LANGUAGES.map(lang => <Option key={lang.value} value={lang.value}>{lang.label}</Option>)}
            </Select>
          </Form.Item>
        </div>
        <Form.Item label="Audio or video source" required>
          <Upload
            accept="video/mp4"
            showUploadList={false}
            beforeUpload={beforeUpload}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload Video (.mp4)</Button>
          </Upload>
          <div className='flex flex-col items-center'>
          {videoUrl && (
            <>
              <video src={videoUrl} controls className="mt-4 rounded shadow max-w-full" />
              <div className="mt-2 text-sm text-gray-700 w-full flex justify-between">
                <p><strong>Selected file:</strong> {videoFile?.name || ''}</p>
                <p><strong>Duration:</strong> {videoDuration !== null ? videoDuration.toFixed(2) + 's' : ''}</p>
              </div>
            </>
          )}
          </div>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large"
            disabled={!projectName || !videoFile}
          >
            Start Dubbing
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
