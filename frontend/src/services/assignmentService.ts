// src/services/assignmentService.ts
import api from './api';

/**
 * Service for assignment-related API calls
 */
const assignmentService = {
  /**
   * Get assignments by course ID
   * @param courseId - Course ID
   * @returns List of assignments
   */
  async getAssignmentsByCourse(courseId: string) {
    const response = await api.get(`/assignments`, { params: { courseId } });
    return response.data.data;
  },

  /**
   * Get assignment by ID
   * @param assignmentId - Assignment ID
   * @returns Assignment data
   */
  async getAssignmentById(assignmentId: string) {
    const response = await api.get(`/assignments/${assignmentId}`);
    return response.data.data;
  },

  /**
   * Get current user's assignments
   * @returns List of assignments
   */
  async getStudentAssignments() {
    const response = await api.get('/assignments/student');
    return response.data.data;
  },

  /**
   * Create a new assignment
   * @param courseId - Course ID
   * @param assignmentData - Assignment data
   * @returns Created assignment
   */
  async createAssignment(courseId: string, assignmentData: any) {
    const response = await api.post('/assignments', { courseId, ...assignmentData });
    return response.data.data;
  },

  /**
   * Update an assignment
   * @param assignmentId - Assignment ID
   * @param assignmentData - Updated assignment data
   * @returns Updated assignment
   */
  async updateAssignment(assignmentId: string, assignmentData: any) {
    const response = await api.put(`/assignments/${assignmentId}`, assignmentData);
    return response.data.data;
  },

  /**
   * Delete an assignment
   * @param assignmentId - Assignment ID
   * @returns Success message
   */
  async deleteAssignment(assignmentId: string) {
    const response = await api.delete(`/assignments/${assignmentId}`);
    return response.data;
  },

  /**
   * Submit an assignment
   * @param assignmentId - Assignment ID
   * @param submissionData - Submission data
   * @returns Submission data
   */
  async submitAssignment(assignmentId: string, submissionData: { submissionText?: string; submissionUrl?: string }) {
    const response = await api.post(`/assignments/${assignmentId}/submissions`, submissionData);
    return response.data.data;
  },

  /**
   * Get submissions for an assignment
   * @param assignmentId - Assignment ID
   * @returns List of submissions
   */
  async getSubmissionsByAssignment(assignmentId: string) {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data.data;
  },

  /**
   * Get submission by ID
   * @param submissionId - Submission ID
   * @returns Submission data
   */
  async getSubmissionById(submissionId: string) {
    const response = await api.get(`/assignments/submissions/${submissionId}`);
    return response.data.data;
  },

  /**
   * Grade a submission
   * @param submissionId - Submission ID
   * @param gradeData - Grade data
   * @returns Updated submission
   */
  async gradeSubmission(submissionId: string, gradeData: { grade: number; feedback?: string }) {
    const response = await api.put(`/assignments/submissions/${submissionId}/grade`, gradeData);
    return response.data.data;
  }
};

export default assignmentService;