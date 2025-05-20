// src/services/lectureService.ts
import api from './api';

/**
 * Service for lecture-related API calls
 */
const lectureService = {
  /**
   * Get lectures by course ID
   * @param courseId - Course ID
   * @returns List of lectures
   */
  async getLecturesByCourse(courseId: string) {
    const response = await api.get(`/lectures`, { params: { courseId } });
    return response.data.data;
  },

  /**
   * Get lecture by ID
   * @param lectureId - Lecture ID
   * @returns Lecture data
   */
  async getLectureById(lectureId: string) {
    const response = await api.get(`/lectures/${lectureId}`);
    return response.data.data;
  },

  /**
   * Create a new lecture
   * @param courseId - Course ID
   * @param lectureData - Lecture data
   * @returns Created lecture
   */
  async createLecture(courseId: string, lectureData: any) {
    const response = await api.post('/lectures', { courseId, ...lectureData });
    return response.data.data;
  },

  /**
   * Update a lecture
   * @param lectureId - Lecture ID
   * @param lectureData - Updated lecture data
   * @returns Updated lecture
   */
  async updateLecture(lectureId: string, lectureData: any) {
    const response = await api.put(`/lectures/${lectureId}`, lectureData);
    return response.data.data;
  },

  /**
   * Delete a lecture
   * @param lectureId - Lecture ID
   * @returns Success message
   */
  async deleteLecture(lectureId: string) {
    const response = await api.delete(`/lectures/${lectureId}`);
    return response.data;
  },

  /**
   * Update lecture progress
   * @param lectureId - Lecture ID
   * @param progressData - Progress data
   * @returns Updated progress
   */
  async updateLectureProgress(lectureId: string, progressData: { progressSeconds: number; isCompleted?: boolean }) {
    const response = await api.put(`/lectures/${lectureId}/progress`, progressData);
    return response.data.data;
  },

  /**
   * Get lecture progress for a course
   * @param courseId - Course ID
   * @returns List of lecture progress
   */
  async getLectureProgressByCourse(courseId: string) {
    const response = await api.get(`/lectures/progress`, { params: { courseId } });
    return response.data.data;
  },

  /**
   * Reorder lectures in a course
   * @param courseId - Course ID
   * @param lectureOrder - Array of lecture IDs in desired order
   * @returns Success message
   */
  async reorderLectures(courseId: string, lectureOrder: string[]) {
    const response = await api.put(`/lectures/reorder`, { courseId, lectureOrder });
    return response.data.data;
  }
};

export default lectureService;