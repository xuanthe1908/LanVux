// src/pages/dashboard/teacher/StudentsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon, 
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import Alert from '../../../components/ui/Alert';

// Types for our component
interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrollmentDate: string;
  lastActive: string;
  coursesEnrolled: number;
  completionRate: number;
  status: 'active' | 'inactive';
}

interface CourseOption {
  id: string;
  title: string;
  studentCount: number;
}

const TeacherStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courses, setCourses] = useState<CourseOption[]>([]);
  
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Fetch students for all courses taught by this teacher
    // In a real application, this would be an API call
    const fetchStudents = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          // Mock courses data
          const mockCourses: CourseOption[] = [
            { id: '1', title: 'React Fundamentals', studentCount: 45 },
            { id: '2', title: 'Node.js Backend Development', studentCount: 38 },
            { id: '3', title: 'Modern JavaScript', studentCount: 27 }
          ];
          
          // Mock students data
          const mockStudents: Student[] = [
            {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              avatar: '/images/student-1.jpg',
              enrollmentDate: '2025-05-15T10:30:00Z',
              lastActive: '2025-05-19T14:45:00Z',
              coursesEnrolled: 2,
              completionRate: 75,
              status: 'active'
            },
            {
              id: '2',
              name: 'Sarah Williams',
              email: 'sarah.williams@example.com',
              avatar: '/images/student-2.jpg',
              enrollmentDate: '2025-05-12T09:15:00Z',
              lastActive: '2025-05-18T16:30:00Z',
              coursesEnrolled: 3,
              completionRate: 92,
              status: 'active'
            },
            {
              id: '3',
              name: 'Michael Brown',
              email: 'michael.brown@example.com',
              avatar: '/images/student-3.jpg',
              enrollmentDate: '2025-05-10T14:20:00Z',
              lastActive: '2025-05-16T11:45:00Z',
              coursesEnrolled: 1,
              completionRate: 45,
              status: 'active'
            },
            {
              id: '4',
              name: 'Emily Davis',
              email: 'emily.davis@example.com',
              avatar: '/images/student-4.jpg',
              enrollmentDate: '2025-05-08T11:10:00Z',
              lastActive: '2025-05-19T09:30:00Z',
              coursesEnrolled: 2,
              completionRate: 88,
              status: 'active'
            },
            {
              id: '5',
              name: 'Alex Johnson',
              email: 'alex.johnson@example.com',
              avatar: '/images/student-5.jpg',
              enrollmentDate: '2025-05-05T16:40:00Z',
              lastActive: '2025-05-15T13:20:00Z',
              coursesEnrolled: 3,
              completionRate: 62,
              status: 'inactive'
            },
            {
              id: '6',
              name: 'Jessica Thompson',
              email: 'jessica.thompson@example.com',
              avatar: '/images/student-6.jpg',
              enrollmentDate: '2025-05-03T10:15:00Z',
              lastActive: '2025-05-17T15:10:00Z',
              coursesEnrolled: 2,
              completionRate: 78,
              status: 'active'
            },
            {
              id: '7',
              name: 'David Wilson',
              email: 'david.wilson@example.com',
              avatar: '/images/student-7.jpg',
              enrollmentDate: '2025-04-28T09:50:00Z',
              lastActive: '2025-05-14T11:25:00Z',
              coursesEnrolled: 1,
              completionRate: 33,
              status: 'inactive'
            },
            {
              id: '8',
              name: 'Lisa Martin',
              email: 'lisa.martin@example.com',
              avatar: '/images/student-8.jpg',
              enrollmentDate: '2025-04-25T13:30:00Z',
              lastActive: '2025-05-19T10:45:00Z',
              coursesEnrolled: 2,
              completionRate: 91,
              status: 'active'
            }
          ];
          
          setStudents(mockStudents);
          setFilteredStudents(mockStudents);
          setCourses(mockCourses);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load student data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Apply filters when search term, course filter, or status filter changes
  useEffect(() => {
    let filtered = [...students];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply course filter (this is a simplified version since we don't have actual course-student relationships in our mock data)
    if (courseFilter !== 'all') {
      // In a real app, we would filter students by the specific course
      // For this example, we'll just use a random subset based on the course ID
      const courseIdNum = parseInt(courseFilter.replace('course-', ''));
      filtered = filtered.filter((_, index) => index % 3 === (courseIdNum - 1) % 3);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }
    
    setFilteredStudents(filtered);
  }, [searchTerm, courseFilter, statusFilter, students]);

  // Format date for better display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    };
    
    return date.toLocaleDateString(undefined, options);
  };

  // Calculate time since for "last active"
  const getTimeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <Button 
          variant="outline" 
          leftIcon={<EnvelopeIcon className="h-5 w-5" />}
        >
          Message All Students
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Students
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by name or email"
                className="form-input block w-full pl-10 rounded-md border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              id="course"
              className="form-select w-full rounded-md border-gray-300"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={`course-${course.id}`}>
                  {course.title} ({course.studentCount})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="form-select w-full rounded-md border-gray-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Student List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {filteredStudents.length} 
            {filteredStudents.length === 1 ? ' Student' : ' Students'}
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
          >
            Export
          </Button>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
            <p className="mt-2 text-gray-500">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full" src={student.avatar || '/images/avatar-default.jpg'} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(student.enrollmentDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.coursesEnrolled} {student.coursesEnrolled === 1 ? 'course' : 'courses'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2 text-sm font-medium">{student.completionRate}%</div>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-primary-600 h-1.5 rounded-full" 
                            style={{ width: `${student.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTimeSince(student.lastActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/dashboard/teacher/students/${student.id}`} 
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        Message
                      </button>
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

export default TeacherStudentsPage;