import { useState } from 'react';
import { categoryService, Category } from '../services/apiServices';
import { useApi } from './useApi';

interface UseCategoriesParams {
  includeEmpty?: boolean;
  sortBy?: 'name' | 'course_count' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export const useCategories = (params: UseCategoriesParams = {}) => {
  return useApi<{
    categories: Category[];
    totalCount: number;
  }>(
    () => categoryService.getAllCategories(params),
    [JSON.stringify(params)]
  );
};

export const useCategory = (id: string, params?: { includeCourses?: boolean; courseLimit?: number }) => {
  return useApi<{ category: Category }>(
    () => categoryService.getCategoryById(id, params),
    [id, JSON.stringify(params)]
  );
};

export const useCategoryStats = () => {
  return useApi<{
    totalCategories: number;
    activeCategories: number;
    categoriesWithCourses: number;
    averageCoursesPerCategory: number;
    topCategories: Array<{ name: string; courseCount: number }>;
  }>(
    () => categoryService.getCategoryStats(),
    []
  );
};

// Custom hook for category operations
export const useCategoryOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.createCategory(data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.updateCategory(id, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string, options?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.deleteCategory(id, options);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    loading,
    error
  };
};