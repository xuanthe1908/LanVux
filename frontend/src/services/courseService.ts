// src/services/courseService.ts
import api from './api';

/**
 * Service for course-related API calls
 */
const courseService = {
  /**
   * Get all courses with optional filtering
   * @param params - Optional filter parameters
   * @returns List of courses
   */
  async getCourses(params: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    level?: string; 
    search?: string;
  } = {}) {
    const response = await api.get('/courses', { params });
    return response.data.data;
  },

  /**
   * Get course by ID
   * @param courseId - Course ID
   * @returns Course data
   */
  async getCourseById(courseId: string) {
    const response = await api.get(`/courses/${courseId}`);
    return response.data.data;
  },

  /**
   * Get courses enrolled by current user
   * @returns List of enrolled courses
   */
  async getEnrolledCourses() {
    const response = await api.get('/enrollments');
    return response.data.data;
  },

  /**
   * Get courses taught by current user
   * @returns List of teaching courses
   */
  async getTeachingCourses() {
    const response = await api.get('/courses/teaching');
    return response.data.data;
  },

  /**
   * Create a new course
   * @param courseData - Course data
   * @returns Created course
   */
  async createCourse(courseData: any) {
    const response = await api.post('/courses', courseData);
    return response.data.data;
  },

  /**
   * Update a course
   * @param courseId - Course ID
   * @param courseData - Updated course data
   * @returns Updated course
   */
  async updateCourse(courseId: string, courseData: any) {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data.data;
  },

  /**
   * Enroll in a course
   * @param courseId - Course ID
   * @returns Enrollment data
   */
  async enrollInCourse(courseId: string) {
    const response = await api.post(`/enrollments`, { courseId });
    return response.data.data;
  },

  /**
   * Get course progress
   * @param courseId - Course ID
   * @returns Course progress data
   */
  async getCourseProgress(courseId: string) {
    const response = await api.get(`/enrollments/${courseId}/progress`);
    return response.data.data;
  },

  /**
   * Update course progress
   * @param courseId - Course ID
   * @param progress - Progress percentage
   * @returns Updated progress data
   */
  async updateCourseProgress(courseId: string, progress: number) {
    const response = await api.put(`/enrollments/${courseId}/progress`, { progress });
    return response.data.data;
  },

  /**
   * Get course reviews
   * @param courseId - Course ID
   * @returns List of reviews
   */
  async getCourseReviews(courseId: string) {
    const response = await api.get(`/courses/${courseId}/reviews`);
    return response.data.data;
  },

  /**
   * Create course review
   * @param courseId - Course ID
   * @param reviewData - Review data
   * @returns Created review
   */
  async createCourseReview(courseId: string, reviewData: { rating: number; comment?: string }) {
    const response = await api.post(`/courses/${courseId}/reviews`, reviewData);
    return response.data.data;
  }
};

export default courseService;