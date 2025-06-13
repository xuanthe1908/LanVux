import { useState } from 'react';
import { couponService, Coupon } from '../services/apiServices';
import { useApi } from './useApi';

interface UseCouponsParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  isPublic?: boolean;
}

export const useCoupons = (params: UseCouponsParams = {}) => {
  return useApi<{
    coupons: Coupon[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>(
    () => couponService.getAllCoupons(params),
    [JSON.stringify(params)]
  );
};

export const useCoupon = (id: string) => {
  return useApi<{ coupon: Coupon }>(
    () => couponService.getCouponById(id),
    [id]
  );
};

export const useCouponStats = () => {
  return useApi<{
    totalCoupons: number;
    activeCoupons: number;
    totalUsage: number;
    totalDiscount: number;
  }>(
    () => couponService.getCouponStats(),
    []
  );
};

// Custom hook for coupon operations
export const useCouponOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCoupon = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await couponService.createCoupon(data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCoupon = async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await couponService.updateCoupon(id, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await couponService.deleteCoupon(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async (code: string, courseId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await couponService.validateCoupon(code, courseId);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to validate coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    loading,
    error
  };
};