export type UserRole = 'student' | 'teacher' | 'admin';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentType = 'video' | 'document' | 'quiz';

// User related types
export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  refreshToken: string;
}

// Course related types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  teacherId: string;
  price: number;
  status: CourseStatus;
  level: CourseLevel;
  category: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Lecture related types
export interface Lecture {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl?: string;
  orderIndex: number;
  duration?: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment related types
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
}

// Lecture progress types
export interface LectureProgress {
  id: string;
  userId: string;
  lectureId: string;
  isCompleted: boolean;
  progressSeconds: number;
  lastAccessedAt: Date;
}

// Assignment related types
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate?: Date;
  maxPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  submissionUrl?: string;
  submissionText?: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  gradedAt?: Date;
}

// Message related types
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  courseId?: string;
  subject: string;
  content: string;
  createdAt: Date;
  readAt?: Date;
}

// AI Chat related types
export interface AIChatHistory {
  id: string;
  userId: string;
  query: string;
  response: string;
  createdAt: Date;
}

// Review related types
export interface Review {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category related types
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

// Notification related types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  referenceId?: string;
  createdAt: Date;
}

// API Error types
export interface AppErrorOptions {
  statusCode: number;
  message: string;
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  results?: number;
  errors?: { field: string; message: string }[];
}

// Database specific types
export interface DatabaseRow {
  [key: string]: any;
}

export interface CourseRow extends DatabaseRow {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  teacher_id: string;
  price: number;
  status: string;
  level: string;
  category: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRow extends DatabaseRow {
  id: string;
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface LectureRow extends DatabaseRow {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content_type: string;
  content_url?: string;
  order_index: number;
  duration?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentRow extends DatabaseRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date?: string;
  max_points: number;
  created_at: string;
  updated_at: string;
}

export interface SubmissionRow extends DatabaseRow {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_url?: string;
  submission_text?: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
}

export interface EnrollmentRow extends DatabaseRow {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  completed_at?: string;
  last_accessed_at: string;
}

export interface MessageRow extends DatabaseRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  course_id?: string;
  subject: string;
  content: string;
  created_at: string;
  read_at?: string;
}

export interface CategoryRow extends DatabaseRow {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}