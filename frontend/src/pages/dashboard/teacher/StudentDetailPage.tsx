// src/pages/dashboard/teacher/StudentDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  UserCircleIcon, 
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentDate: string;
  profilePicture?: string;
  courses: {
    id: string;
    title: string;
    progress: number;
  }[];
  assignments: {
    id: string;
    title: string;
    dueDate: string;
    status: 'completed' | 'in_progress' | 'overdue' | 'not_started';
    grade?: number;
  }[];
  averageGrade: number;
}

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch student data
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      // This would normally be an API call
      setStudent({
        id: id || '1',
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@example.com',
        enrollmentDate: '2024-09-15',
        courses: [
          { id: '101', title: 'React Fundamentals', progress: 85 },
          { id: '102', title: 'Node.js Backend Development', progress: 62 },
          { id: '103', title: 'JavaScript Masterclass', progress: 45 }
        ],
        assignments: [
          { id: 'a1', title: 'React Components Assignment', dueDate: '2025-05-10', status: 'completed', grade: 92 },
          { id: 'a2', title: 'Node.js API Project', dueDate: '2025-05-20', status: 'in_progress' },
          { id: 'a3', title: 'JavaScript Functions Quiz', dueDate: '2025-05-15', status: 'completed', grade: 88 },
          { id: 'a4', title: 'Final Project Proposal', dueDate: '2025-05-25', status: 'not_started' }
        ],
        averageGrade: 90
      });
      setIsLoading(false);
    }, 1000);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Student not found</p>
      </div>
    );
  }

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'in_progress':
        return 'bg-primary-100 text-primary-800';
      case 'overdue':
        return 'bg-danger-100 text-danger-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <div className="flex-shrink-0 h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-bold mb-4 sm:mb-0">
            {student.profilePicture ? (
              <img 
                src={student.profilePicture} 
                alt={`${student.firstName} ${student.lastName}`} 
                className="h-24 w-24 rounded-full"
              />
            ) : (
              student.firstName.charAt(0) + student.lastName.charAt(0)
            )}
          </div>
          
          <div className="sm:ml-6">
            <h1 className="text-2xl font-bold text-gray-900">{student.firstName} {student.lastName}</h1>
            <div className="mt-1 text-gray-500">{student.email}</div>
            <div className="mt-1 text-sm text-gray-500">Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</div>
            
            <div className="mt-4 flex space-x-4">
              <Button variant="outline" size="sm" leftIcon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}>
                Message
              </Button>
              <Button variant="outline" size="sm" leftIcon={<AcademicCapIcon className="h-4 w-4" />}>
                View Grades
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Student Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpenIcon className="h-5 w-5 mr-2 text-accent-600" />
            Enrolled Courses
          </h2>
          
          <div className="space-y-4">
            {student.courses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{course.title}</h3>
                  <Link 
                    to={`/dashboard/teacher/courses/${course.id}`}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    View Course
                  </Link>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-success-600" />
            Recent Assignments
          </h2>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {student.assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assignment.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(assignment.status)}`}>
                        {assignment.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.grade !== undefined ? `${assignment.grade}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-warning-600" />
          Performance Overview
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Average Grade</h3>
            <p className="mt-1 text-2xl font-bold text-success-600">{student.averageGrade}%</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Completed Assignments</h3>
            <p className="mt-1 text-2xl font-bold text-primary-600">
              {student.assignments.filter(a => a.status === 'completed').length} / {student.assignments.length}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Course Completion</h3>
            <p className="mt-1 text-2xl font-bold text-accent-600">
              {Math.round(student.courses.reduce((sum, course) => sum + course.progress, 0) / student.courses.length)}%
            </p>
          </div>
        </div>
        
        <div className="mt-6 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Performance chart would be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;