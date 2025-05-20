// src/pages/dashboard/student/CoursesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { 
  BookOpenIcon, 
  ClockIcon, 
  UserIcon, 
  ArrowTrendingUpIcon,
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
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  enrollmentStatus: 'enrolled' | 'completed' | 'in-progress';
  progress: number;
  totalLectures: number;
  completedLectures: number;
  lastAccessedAt?: string;
  category: string;
}

interface CategoryFilter {
  id: string;
  name: string;
  count: number;
}

const StudentCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Fetch enrolled courses
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
              instructor: {
                id: '101',
                name: 'Jane Smith',
                avatar: '/images/instructor-1.jpg'
              },
              thumbnail: '/images/course-react.jpg',
              enrollmentStatus: 'in-progress',
              progress: 65,
              totalLectures: 12,
              completedLectures: 8,
              lastAccessedAt: '2025-05-18T15:30:00Z',
              category: 'web-development'
            },
            {
              id: '2',
              title: 'Node.js Backend Development',
              description: 'Build robust and scalable backend applications with Node.js, Express, and MongoDB.',
              instructor: {
                id: '102',
                name: 'John Doe',
                avatar: '/images/instructor-2.jpg'
              },
              thumbnail: '/images/course-node.jpg',
              enrollmentStatus: 'enrolled',
              progress: 25,
              totalLectures: 15,
              completedLectures: 4,
              lastAccessedAt: '2025-05-15T11:45:00Z',
              category: 'web-development'
            },
            {
              id: '3',
              title: 'Python for Data Science',
              description: 'Master Python for data analysis, visualization, and machine learning applications.',
              instructor: {
                id: '103',
                name: 'Emily Johnson',
                avatar: '/images/instructor-3.jpg'
              },
              thumbnail: '/images/course-python.jpg',
              enrollmentStatus: 'completed',
              progress: 100,
              totalLectures: 20,
              completedLectures: 20,
              lastAccessedAt: '2025-05-10T09:20:00Z',
              category: 'data-science'
            },
            {
              id: '4',
              title: 'UI/UX Design Principles',
              description: 'Learn the fundamentals of user interface and user experience design.',
              instructor: {
                id: '104',
                name: 'Michael Brown',
                avatar: '/images/instructor-4.jpg'
              },
              thumbnail: '/images/course-design.jpg',
              enrollmentStatus: 'in-progress',
              progress: 40,
              totalLectures: 18,
              completedLectures: 7,
              lastAccessedAt: '2025-05-19T14:15:00Z',
              category: 'design'
            },
            {
              id: '5',
              title: 'Mobile App Development with React Native',
              description: 'Build cross-platform mobile applications with React Native and JavaScript.',
              instructor: {
                id: '105',
                name: 'Sarah Williams',
                avatar: '/images/instructor-5.jpg'
              },
              thumbnail: '/images/course-mobile.jpg',
              enrollmentStatus: 'enrolled',
              progress: 10,
              totalLectures: 22,
              completedLectures: 2,
              lastAccessedAt: '2025-05-20T08:45:00Z',
              category: 'mobile-development'
            },
          ];

          setCourses(mockCourses);
          setFilteredCourses(mockCourses);
          
          // Extract unique categories for filter
          const categoryMap = mockCourses.reduce((acc, course) => {
            if (!acc[course.category]) {
              acc[course.category] = 0;
            }
            acc[course.category]++;
            return acc;
          }, {} as Record<string, number>);
          
          const categoryOptions = Object.entries(categoryMap).map(([id, count]) => ({
            id,
            name: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            count
          }));
          
          setCategories(categoryOptions);
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

  // Apply filters when search term, status filter, or category filter changes
  useEffect(() => {
    let filtered = [...courses];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.enrollmentStatus === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, statusFilter, categoryFilter, courses]);

  // Format date for better display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'in-progress':
        return 'bg-primary-100 text-primary-800';
      case 'enrolled':
        return 'bg-accent-100 text-accent-800';
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
        <Link to="/courses">
          <Button variant="primary" size="sm">
            Browse More Courses
          </Button>
        </Link>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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
              <option value="enrolled">Enrolled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="form-select w-full"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
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
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
              ? 'Try adjusting your filters or search terms'
              : 'You haven\'t enrolled in any courses yet'}
          </p>
          <div className="mt-6">
            <Link to="/courses">
              <Button variant="primary">Browse Courses</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="relative">
                {/* Course thumbnail */}
                <img 
                  src={course.thumbnail || '/images/course-default.jpg'} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(course.enrollmentStatus)}`}>
                    {course.enrollmentStatus === 'in-progress' ? 'In Progress' : 
                     course.enrollmentStatus.charAt(0).toUpperCase() + course.enrollmentStatus.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">{course.description}</p>
                
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      Progress: {course.progress}%
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.completedLectures}/{course.totalLectures} lectures
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Instructor and last accessed */}
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{course.instructor.name}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span title={`Last accessed: ${formatDate(course.lastAccessedAt)}`}>
                      {course.lastAccessedAt ? formatDate(course.lastAccessedAt).split(',')[0] : 'Never accessed'}
                    </span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="mt-auto pt-3 border-t border-gray-200">
                  <Link 
                    to={`/dashboard/student/courses/${course.id}`}
                    className="w-full"
                  >
                    <Button 
                      variant={course.enrollmentStatus === 'completed' ? 'success' : 'primary'} 
                      fullWidth
                      rightIcon={<ChevronRightIcon className="h-4 w-4" />}
                    >
                      {course.enrollmentStatus === 'enrolled' ? 'Start Learning' : 
                       course.enrollmentStatus === 'in-progress' ? 'Continue Learning' : 
                       'Review Course'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Course Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Stats</h2>
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
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {courses.filter(course => course.enrollmentStatus === 'completed').length}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-100 text-accent-600">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-xl font-bold text-gray-900">
                {courses.filter(course => course.enrollmentStatus === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesPage;