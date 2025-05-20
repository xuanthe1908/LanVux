// src/pages/dashboard/teacher/CoursesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  AcademicCapIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import Alert from '../../../components/ui/Alert';

// Types for our component
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  status: 'active' | 'draft' | 'archived';
  studentCount: number;
  completionRate: number;
  rating: number;
  reviewCount: number;
  lastUpdated: string;
  category: string;
}

const TeacherCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Fetch courses where the teacher is the instructor
    // In a real application, this would be an API call
    const fetchCourses = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          const mockCourses: Course[] = [
            {
              id: '1',
              title: 'React Fundamentals',
              description: 'Learn the basics of React, including components, props, state, and hooks.',
              thumbnail: '/images/course-react.jpg',
              status: 'active',
              studentCount: 45,
              completionRate: 68,
              rating: 4.8,
              reviewCount: 32,
              lastUpdated: '2025-05-10T15:30:00Z',
              category: 'web-development'
            },
            {
              id: '2',
              title: 'Node.js Backend Development',
              description: 'Build robust and scalable backend applications with Node.js, Express, and MongoDB.',
              thumbnail: '/images/course-node.jpg',
              status: 'active',
              studentCount: 38,
              completionRate: 52,
              rating: 4.6,
              reviewCount: 25,
              lastUpdated: '2025-04-28T11:45:00Z',
              category: 'web-development'
            },
            {
              id: '3',
              title: 'Modern JavaScript',
              description: 'Master modern JavaScript concepts and features like ES6+, async/await, and modules.',
              thumbnail: '/images/course-js.jpg',
              status: 'draft',
              studentCount: 0,
              completionRate: 0,
              rating: 0,
              reviewCount: 0,
              lastUpdated: '2025-05-15T09:20:00Z',
              category: 'web-development'
            }
          ];
          
          setCourses(mockCourses);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load your courses. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Apply filters when search term or status filter changes
  const filteredCourses = courses.filter(course => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <Link to="/dashboard/teacher/courses/create">
          <Button 
            variant="primary" 
            leftIcon={<PlusCircleIcon className="h-5 w-5" />}
          >
            Create New Course
          </Button>
        </Link>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Courses
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title or description"
              className="form-input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="form-select w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Course Cards */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <BookOpenIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
          <p className="mt-2 text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters or search terms'
              : "You haven't created any courses yet"}
          </p>
          <div className="mt-6">
            <Link to="/dashboard/teacher/courses/create">
              <Button 
                variant="primary" 
                leftIcon={<PlusCircleIcon className="h-5 w-5" />}
              >
                Create New Course
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row">
                  {/* Course thumbnail */}
                  <div className="md:w-1/4 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <img 
                      src={course.thumbnail || '/images/course-default.jpg'} 
                      alt={course.title}
                      className="w-full rounded-lg h-40 object-cover"
                    />
                  </div>
                  
                  {/* Course info */}
                  <div className="md:w-3/4 flex flex-col">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(course.status)}`}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mt-2 mb-4">{course.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Students</p>
                        <div className="flex items-center mt-1">
                          <UserGroupIcon className="h-5 w-5 text-gray-400 mr-1" />
                          <p className="font-medium">{course.studentCount}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-primary-600 h-1.5 rounded-full" 
                              style={{ width: `${course.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{course.completionRate}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Rating</p>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-400 mr-1">★</span>
                          <p className="font-medium">
                            {course.rating > 0 ? course.rating.toFixed(1) : 'N/A'} 
                            {course.reviewCount > 0 && <span className="text-gray-500 text-sm"> ({course.reviewCount})</span>}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                        <p className="font-medium">{formatDate(course.lastUpdated)}</p>
                      </div>
                    </div>
                    
                    <div className="flex mt-6 space-x-4">
                      <Link to={`/dashboard/teacher/courses/${course.id}`}>
                        <Button 
                          variant="primary"
                          rightIcon={<ChevronRightIcon className="h-4 w-4" />}
                        >
                          Manage Course
                        </Button>
                      </Link>
                      
                      <Link to={`/dashboard/teacher/courses/${course.id}/students`}>
                        <Button 
                          variant="outline"
                          leftIcon={<UserGroupIcon className="h-5 w-5" />}
                        >
                          View Students
                        </Button>
                      </Link>
                      
                      <Link to={`/dashboard/teacher/courses/${course.id}/content`}>
                        <Button 
                          variant="outline"
                          leftIcon={<BookOpenIcon className="h-5 w-5" />}
                        >
                          Edit Content
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Course Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-xl font-bold text-gray-900">
                {courses.reduce((total, course) => total + course.studentCount, 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <p className="text-xl font-bold text-gray-900">
                {courses.filter(course => course.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCoursesPage;