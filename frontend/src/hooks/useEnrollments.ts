import { enrollmentService, Enrollment } from '../services/apiServices';
import { useApi } from './useApi';
import { useState } from 'react';

interface UseEnrollmentsParams {
  page?: number;
  limit?: number;
  courseId?: string;
  userId?: string;
}

export const useEnrollments = (params: UseEnrollmentsParams = {}) => {
  return useApi<{
    enrollments: Enrollment[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>(
    () => enrollmentService.getAllEnrollments(params),
    [JSON.stringify(params)]
  );
};

export const useEnrollment = (id: string) => {
  return useApi<{ enrollment: Enrollment }>(
    () => enrollmentService.getEnrollmentById(id),
    [id]
  );
};

export const useEnrollmentStats = () => {
  return useApi<{
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    averageProgress: number;
  }>(
    () => enrollmentService.getEnrollmentStats(),
    []
  );
};

// Custom hook for enrollment operations
export const useEnrollmentOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrollInCourse = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await enrollmentService.enrollInCourse(courseId);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unenrollFromCourse = async (enrollmentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await enrollmentService.unenrollFromCourse(enrollmentId);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unenroll from course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    enrollInCourse,
    unenrollFromCourse,
    loading,
    error
  };
};