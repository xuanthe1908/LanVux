import { useState } from 'react';
import { uploadService } from '../services/apiServices';

export const useUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadSingle = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      const response = await uploadService.uploadSingle(file);
      setProgress(100);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadMultiple = async (files: File[]) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      const response = await uploadService.uploadMultiple(files);
      setProgress(100);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload files');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      const response = await uploadService.uploadImage(file);
      setProgress(100);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      const response = await uploadService.uploadDocument(file);
      setProgress(100);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      const response = await uploadService.uploadVideo(file);
      setProgress(100);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload video');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadSingle,
    uploadMultiple,
    uploadImage,
    uploadDocument,
    uploadVideo,
    loading,
    error,
    progress
  };
};