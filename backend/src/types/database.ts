export interface Course {
  id: string;
  title: string;
  teacher_id: string;
  status: string;
  [key: string]: any;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date?: string;
  max_points: number;
  teacher_id: string;
  [key: string]: any;
}