// src/pages/dashboard/admin/CoursesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  students: number;
  status: 'active' | 'draft' | 'archived';
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setCourses([
        { id: '1', title: 'React Fundamentals', category: 'Web Development', instructor: 'Sarah Williams', students: 42, status: 'active' },
        { id: '2', title: 'Node.js Backend Development', category: 'Web Development', instructor: 'James Wilson', students: 37, status: 'active' },
        { id: '3', title: 'Python for Data Science', category: 'Data Science', instructor: 'David Miller', students: 28, status: 'active' },
        { id: '4', title: 'UX/UI Design Principles', category: 'Design', instructor: 'Emma Thompson', students: 31, status: 'draft' },
        { id: '5', title: 'Mobile App Development with Flutter', category: 'Mobile Development', instructor: 'Robert Garcia', students: 0, status: 'draft' },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <Link to="/dashboard/admin/courses/create">
            <Button 
              variant="primary" 
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Add New Course
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.instructor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.students}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${course.status === 'active' 
                          ? 'bg-success-100 text-success-800' 
                          : course.status === 'draft' 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-danger-100 text-danger-800'}`}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-primary-600 hover:text-primary-900 mr-3">Edit</a>
                      <a href="#" className="text-danger-600 hover:text-danger-900">Delete</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;