import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Additional custom hooks for common operations
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  return {
    ...auth,
    dispatch
  };
};

export const useCourses = () => {
  const courses = useAppSelector((state) => state.courses);
  const dispatch = useAppDispatch();
  
  return {
    ...courses,
    dispatch
  };
};

export const useEnrollments = () => {
  const enrollments = useAppSelector((state) => state.enrollments);
  const dispatch = useAppDispatch();
  
  return {
    ...enrollments,
    dispatch
  };
};

export const useMessages = () => {
  const messages = useAppSelector((state) => state.messages);
  const dispatch = useAppDispatch();
  
  return {
    ...messages,
    dispatch
  };
};

export const useCategories = () => {
  const categories = useAppSelector((state) => state.categories);
  const dispatch = useAppDispatch();
  
  return {
    ...categories,
    dispatch
  };
};

export const usePayments = () => {
  const payments = useAppSelector((state) => state.payments);
  const dispatch = useAppDispatch();
  
  return {
    ...payments,
    dispatch
  };
};

export const useCoupons = () => {
  const coupons = useAppSelector((state) => state.coupons);
  const dispatch = useAppDispatch();
  
  return {
    ...coupons,
    dispatch
  };
};