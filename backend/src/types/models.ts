export interface CourseModel {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  teacher_id: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentModel {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date?: string;
  max_points: number;
  created_at: string;
  updated_at: string;
}

export interface UserModel {
  id: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  first_name: string;
  last_name: string;
  profile_picture?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}