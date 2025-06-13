import { useState } from 'react';
import { lectureService, Lecture } from '../services/apiServices';
import { useApi } from './useApi';

export const useLecture = (id: string) => {
  return useApi<{ lecture: Lecture }>(
    () => lectureService.getLectureById(id),
    [id]
  );
};

// Custom hook for lecture operations
export const useLectureOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLecture = async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await lectureService.updateLecture(id, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update lecture');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLecture = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await lectureService.deleteLecture(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete lecture');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (id: string, progress: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await lectureService.updateProgress(id, progress);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update progress');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publishLecture = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await lectureService.publishLecture(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish lecture');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateLecture,
    deleteLecture,
    updateProgress,
    publishLecture,
    loading,
    error
  };
};