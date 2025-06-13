import { useState } from 'react';
import { aiService } from '../services/apiServices';

export const useAIOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatWithAI = async (query: string, courseId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.chatWithAI({ query, courseId });
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to chat with AI');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (lectureId: string, numQuestions?: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.generateQuiz({ lectureId, numQuestions });
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const extractConcepts = async (lectureId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.extractConcepts({ lectureId });
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to extract concepts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = async (submissionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.generateFeedback({ submissionId });
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate feedback');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    chatWithAI,
    generateQuiz,
    extractConcepts,
    generateFeedback,
    loading,
    error
  };
};