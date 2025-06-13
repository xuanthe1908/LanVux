import { useState } from 'react';
import { paymentService, Payment } from '../services/apiServices';
import { useApi } from './useApi';

interface UsePaymentsParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}

export const usePayments = (params: UsePaymentsParams = {}) => {
  return useApi<{
    payments: Payment[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>(
    () => paymentService.getAllPayments(params),
    [JSON.stringify(params)]
  );
};

export const usePayment = (id: string) => {
  return useApi<{ payment: Payment }>(
    () => paymentService.getPaymentById(id),
    [id]
  );
};

export const usePaymentStats = () => {
  return useApi<{
    totalRevenue: number;
    totalPayments: number;
    successfulPayments: number;
    averageOrderValue: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  }>(
    () => paymentService.getPaymentStats(),
    []
  );
};

export const usePaymentMethods = () => {
  return useApi<{
    methods: Array<{
      id: string;
      name: string;
      enabled: boolean;
      description: string;
    }>;
  }>(
    () => paymentService.getPaymentMethods(),
    []
  );
};

// Custom hook for payment operations
export const usePaymentOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.createPayment(data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleVNPayReturn = async (params: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.handleVNPayReturn(params);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment return');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    handleVNPayReturn,
    loading,
    error
  };
};