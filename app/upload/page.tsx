"use client";
import React from 'react';
import VideoUploader from '../../components/VideoUploader';

const UploadPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10">
      <h1 className="text-2xl font-bold mb-6">Upload Your Video</h1>
      <VideoUploader />
    </div>
  );
};

export default UploadPage;