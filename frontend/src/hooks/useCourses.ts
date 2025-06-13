import { useState, useEffect } from 'react';
import { courseService, Course } from '../services/apiServices';
import { useApi } from './useApi';

interface UseCoursesParams {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useCourses = (params: UseCoursesParams = {}) => {
  return useApi<{
    courses: Course[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>(
    () => courseService.getAllCourses(params),
    [JSON.stringify(params)]
  );
};

export const useMyCourses = (params: { page?: number; limit?: number } = {}) => {
  return useApi<{
    courses: Course[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>(
    () => courseService.getMyCourses(params),
    [JSON.stringify(params)]
  );
};

export const useCourse = (id: string) => {
  return useApi<{ course: Course }>(
    () => courseService.getCourseById(id),
    [id]
  );
};

export const useCourseStats = () => {
  return useApi<{
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    averageRating: number;
    totalStudents: number;
  }>(
    () => courseService.getCourseStats(),
    []
  );
};

// Custom hook for course operations
export const useCourseOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCourse = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.createCourse(data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.updateCourse(id, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.deleteCourse(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publishCourse = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.publishCourse(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    loading,
    error
  };
};