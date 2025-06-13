import { useState } from 'react';
import { userService, User, UserStats } from '../services/apiServices';
import { useApi } from './useApi';

interface UseUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useUsers = (params: UseUsersParams = {}) => {
  return useApi<{
    users: User[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>(
    () => userService.getAllUsers(params),
    [JSON.stringify(params)]
  );
};

export const useUser = (id: string) => {
  return useApi<{ user: User }>(
    () => userService.getUserById(id),
    [id]
  );
};

export const useUserStats = () => {
  return useApi<UserStats>(
    () => userService.getUserStats().then(res => res.data),
    []
  );
};

// Custom hook for user operations
export const useUserOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.updateProfile(data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.deleteUser(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    deleteUser,
    loading,
    error
  };
};