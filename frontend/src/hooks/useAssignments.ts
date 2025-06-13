import { useState } from 'react';
import { assignmentService, Assignment, AssignmentSubmission } from '../services/apiServices';
import { useApi } from './useApi';

export const useAssignment = (id: string) => {
  return useApi<{ assignment: Assignment }>(
    () => assignmentService.getAssignmentById(id),
    [id]
  );
};

// Custom hook for assignment operations
export const useAssignmentOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAssignment = async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await assignmentService.updateAssignment(id, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update assignment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await assignmentService.deleteAssignment(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete assignment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (id: string, data: { content?: string; attachmentUrl?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await assignmentService.submitAssignment(id, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const gradeSubmission = async (submissionId: string, data: { grade: number; feedback?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await assignmentService.gradeSubmission(submissionId, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to grade submission');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    gradeSubmission,
    loading,
    error
  };
};