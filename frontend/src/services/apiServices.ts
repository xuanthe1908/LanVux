import api from './api';
import { AxiosResponse } from 'axios';

// ===== INTERFACES =====

// Auth Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher';
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

// User Interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  profilePicture?: string;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  summary: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    newUsersInPeriod: number;
    breakdown: {
      students: number;
      teachers: number;
      admins: number;
    };
  };
  activity: {
    totalActive: number;
    weeklyActive: number;
    dailyActive: number;
  };
}

// Course Interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  categoryId: string;
  teacherId: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  category?: Category;
  rating?: number;
  reviewCount?: number;
  studentCount?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  categoryId: string;
  thumbnail?: string;
}

// Lecture Interfaces
export interface Lecture {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  orderIndex: number;
  contentType: 'video' | 'text' | 'quiz' | 'assignment';
  contentUrl?: string;
  duration?: number;
  isPublished: boolean;
  isFree?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLectureData {
  title: string;
  description?: string;
  contentType: 'video' | 'text' | 'quiz' | 'assignment';
  contentUrl?: string;
  duration?: number;
  orderIndex: number;
  isPublished?: boolean;
  isFree?: boolean;
}

// Assignment Interfaces
export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  dueDate?: string;
  maxPoints?: number;
  attachmentUrl?: string;
  instructions?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  content?: string;
  attachmentUrl?: string;
  submissionStatus: 'pending' | 'submitted' | 'late' | 'graded';
  grade?: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface CreateAssignmentData {
  title: string;
  description: string;
  dueDate?: string;
  maxPoints?: number;
  instructions?: string;
  isPublished?: boolean;
}

// Enrollment Interfaces
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  course?: Course;
  user?: User;
}

// Payment Interfaces
export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  orderId: string;
  transactionId?: string;
  createdAt: string;
  course?: Course;
}

export interface CreatePaymentData {
  courseId: string;
  paymentMethod: 'vnpay' | 'momo' | 'zalopay';
  returnUrl?: string;
  couponCode?: string;
}

// Message Interfaces
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  courseId?: string;
  subject: string;
  content: string;
  parentMessageId?: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
  recipient?: User;
  course?: Course;
}

export interface CreateMessageData {
  recipientId: string;
  courseId?: string;
  subject: string;
  content: string;
  parentMessageId?: string;
}

// Category Interfaces
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  isActive: boolean;
  courseCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  isActive?: boolean;
}

// AI Interfaces
export interface AIChatRequest {
  query: string;
  courseId?: string;
}

export interface AIQuizRequest {
  lectureId: string;
  numQuestions?: number;
}

export interface AIConceptRequest {
  lectureId: string;
}

export interface AIFeedbackRequest {
  submissionId: string;
}

// Coupon Interfaces
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CreateCouponData {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
  isPublic?: boolean;
}

// Upload Interfaces
export interface UploadResponse {
  status: string;
  data: {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
  };
}

// ===== API SERVICES =====

// Auth Service
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<{ status: string; data: { user: User } }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.patch('/auth/change-password', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }
};

// User Service
export const userService = {
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getUserStats: async (): Promise<{ status: string; data: UserStats }> => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

// Course Service
export const courseService = {
  getAllCourses: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getMyCourses: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/courses/my-courses', { params });
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (data: CreateCourseData) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: Partial<CreateCourseData>) => {
    const response = await api.patch(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  publishCourse: async (id: string) => {
    const response = await api.patch(`/courses/${id}/publish`);
    return response.data;
  },

  archiveCourse: async (id: string) => {
    const response = await api.patch(`/courses/${id}/archive`);
    return response.data;
  },

  duplicateCourse: async (id: string) => {
    const response = await api.post(`/courses/${id}/duplicate`);
    return response.data;
  },

  getCourseStats: async () => {
    const response = await api.get('/courses/stats');
    return response.data;
  },

  getCourseLectures: async (courseId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/courses/${courseId}/lectures`, { params });
    return response.data;
  },

  createLecture: async (courseId: string, data: CreateLectureData) => {
    const response = await api.post(`/courses/${courseId}/lectures`, data);
    return response.data;
  },

  getCourseAssignments: async (courseId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/courses/${courseId}/assignments`, { params });
    return response.data;
  },

  createAssignment: async (courseId: string, data: CreateAssignmentData) => {
    const response = await api.post(`/courses/${courseId}/assignments`, data);
    return response.data;
  },

  getCourseEnrollments: async (courseId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/courses/${courseId}/enrollments`, { params });
    return response.data;
  }
};

// Lecture Service
export const lectureService = {
  getLectureById: async (id: string) => {
    const response = await api.get(`/lectures/${id}`);
    return response.data;
  },

  updateLecture: async (id: string, data: Partial<CreateLectureData>) => {
    const response = await api.patch(`/lectures/${id}`, data);
    return response.data;
  },

  deleteLecture: async (id: string) => {
    const response = await api.delete(`/lectures/${id}`);
    return response.data;
  },

  updateProgress: async (id: string, progress: number) => {
    const response = await api.post(`/lectures/${id}/progress`, { progress });
    return response.data;
  },

  publishLecture: async (id: string) => {
    const response = await api.patch(`/lectures/${id}/publish`);
    return response.data;
  }
};

// Assignment Service
export const assignmentService = {
  getAssignmentById: async (id: string) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  updateAssignment: async (id: string, data: Partial<CreateAssignmentData>) => {
    const response = await api.patch(`/assignments/${id}`, data);
    return response.data;
  },

  deleteAssignment: async (id: string) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  submitAssignment: async (id: string, data: { content?: string; attachmentUrl?: string }) => {
    const response = await api.post(`/assignments/${id}/submit`, data);
    return response.data;
  },

  gradeSubmission: async (submissionId: string, data: { grade: number; feedback?: string }) => {
    const response = await api.patch(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  }
};

// Enrollment Service
export const enrollmentService = {
  getAllEnrollments: async (params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    userId?: string;
  }) => {
    const response = await api.get('/enrollments', { params });
    return response.data;
  },

  enrollInCourse: async (courseId: string) => {
    const response = await api.post(`/enrollments/${courseId}`);
    return response.data;
  },

  getEnrollmentById: async (id: string) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
  },

  unenrollFromCourse: async (id: string) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
  },

  getEnrollmentStats: async () => {
    const response = await api.get('/enrollments/stats');
    return response.data;
  }
};

// Payment Service
export const paymentService = {
  createPayment: async (data: CreatePaymentData) => {
    const response = await api.post('/payments/create', data);
    return response.data;
  },

  getAllPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  getPaymentById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  handleVNPayReturn: async (params: Record<string, string>) => {
    const response = await api.get('/payments/vnpay-return', { params });
    return response.data;
  },

  getPaymentStats: async () => {
    const response = await api.get('/payments/stats');
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await api.get('/payments/methods');
    return response.data;
  }
};

// Message Service
export const messageService = {
  getAllMessages: async (params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    unreadOnly?: boolean;
  }) => {
    const response = await api.get('/messages', { params });
    return response.data;
  },

  sendMessage: async (data: CreateMessageData) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  getMessageById: async (id: string) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/messages/${id}/read`);
    return response.data;
  },

  replyToMessage: async (id: string, data: { content: string }) => {
    const response = await api.post(`/messages/${id}/reply`, data);
    return response.data;
  }
};

// Category Service
export const categoryService = {
  getAllCategories: async (params?: {
    includeEmpty?: boolean;
    sortBy?: 'name' | 'course_count' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getCategoryById: async (id: string, params?: {
    includeCourses?: boolean;
    courseLimit?: number;
  }) => {
    const response = await api.get(`/categories/${id}`, { params });
    return response.data;
  },

  createCategory: async (data: CreateCategoryData) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryData>) => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string, options?: {
    confirmDeletion?: boolean;
    moveCoursesToCategory?: string;
  }) => {
    const response = await api.delete(`/categories/${id}`, { data: options });
    return response.data;
  },

  getCategoryStats: async () => {
    const response = await api.get('/categories/stats');
    return response.data;
  },

  bulkCreateCategories: async (categories: CreateCategoryData[]) => {
    const response = await api.post('/categories/bulk', { categories });
    return response.data;
  }
};

// AI Service
export const aiService = {
  chatWithAI: async (data: AIChatRequest) => {
    const response = await api.post('/ai/chat', data);
    return response.data;
  },

  generateQuiz: async (data: AIQuizRequest) => {
    const response = await api.post('/ai/generate-quiz', data);
    return response.data;
  },

  extractConcepts: async (data: AIConceptRequest) => {
    const response = await api.post('/ai/extract-concepts', data);
    return response.data;
  },

  generateFeedback: async (data: AIFeedbackRequest) => {
    const response = await api.post('/ai/generate-feedback', data);
    return response.data;
  }
};

// Coupon Service
export const couponService = {
  getAllCoupons: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    isPublic?: boolean;
  }) => {
    const response = await api.get('/coupons', { params });
    return response.data;
  },

  createCoupon: async (data: CreateCouponData) => {
    const response = await api.post('/coupons', data);
    return response.data;
  },

  getCouponById: async (id: string) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  updateCoupon: async (id: string, data: Partial<CreateCouponData>) => {
    const response = await api.patch(`/coupons/${id}`, data);
    return response.data;
  },

  deleteCoupon: async (id: string) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  validateCoupon: async (code: string, courseId?: string) => {
    const response = await api.post('/coupons/validate', { code, courseId });
    return response.data;
  },

  getCouponStats: async () => {
    const response = await api.get('/coupons/stats');
    return response.data;
  }
};

// Upload Service
export const uploadService = {
  uploadSingle: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadMultiple: async (files: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadDocument: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadVideo: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    const response = await api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

// Export all services
export default {
  auth: authService,
  user: userService,
  course: courseService,
  lecture: lectureService,
  assignment: assignmentService,
  enrollment: enrollmentService,
  payment: paymentService,
  message: messageService,
  category: categoryService,
  ai: aiService,
  coupon: couponService,
  upload: uploadService
};