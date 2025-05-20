// src/pages/CoursesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { BookOpenIcon, AcademicCapIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
  };
  category: string;
  level: string;
  rating: number;
  students: number;
  image: string;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity');

  useEffect(() => {
    // Simulate fetching courses from API
    const fetchCourses = async () => {
      try {
        // This would normally be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          setCourses([
            {
              id: '1',
              title: 'React Fundamentals',
              description: 'Learn the basics of React, components, state, props, and more.',
              instructor: {
                name: 'Jane Smith',
                avatar: '/images/instructor-1.jpg'
              },
              category: 'web-development',
              level: 'beginner',
              rating: 4.9,
              students: 3245,
              image: '/images/course-react.jpg'
            },
            {
              id: '2',
              title: 'Node.js Backend Development',
              description: 'Build robust and scalable backend applications with Node.js and Express.',
              instructor: {
                name: 'John Doe',
                avatar: '/images/instructor-2.jpg'
              },
              category: 'web-development',
              level: 'intermediate',
              rating: 4.8,
              students: 2187,
              image: '/images/course-node.jpg'
            },
            {
              id: '3',
              title: 'Python for Data Science',
              description: 'Learn how to analyze and visualize data using Python libraries.',
              instructor: {
                name: 'Emily Johnson',
                avatar: '/images/instructor-3.jpg'
              },
              category: 'data-science',
              level: 'intermediate',
              rating: 4.7,
              students: 1845,
              image: '/images/course-python.jpg'
            },
            {
              id: '4',
              title: 'Flutter Mobile App Development',
              description: 'Create beautiful native mobile apps for iOS and Android from a single codebase.',
              instructor: {
                name: 'Michael Chen',
                avatar: '/images/instructor-4.jpg'
              },
              category: 'mobile-development',
              level: 'intermediate',
              rating: 4.6,
              students: 1523,
              image: '/images/course-flutter.jpg'
            },
            {
              id: '5',
              title: 'UI/UX Design Principles',
              description: 'Master the fundamentals of user interface and user experience design.',
              instructor: {
                name: 'Sarah Williams',
                avatar: '/images/instructor-5.jpg'
              },
              category: 'design',
              level: 'beginner',
              rating: 4.9,
              students: 2876,
              image: '/images/course-design.jpg'
            },
            {
              id: '6',
              title: 'Advanced JavaScript Concepts',
              description: 'Deep dive into closures, prototypes, async patterns and more.',
              instructor: {
                name: 'Alex Rodriguez',
                avatar: '/images/instructor-6.jpg'
              },
              category: 'web-development',
              level: 'advanced',
              rating: 4.8,
              students: 1789,
              image: '/images/course-js.jpg'
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter and sort courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === '' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        // In a real app, you would sort by date
        return 0;
      case 'highest-rated':
        return b.rating - a.rating;
      case 'popularity':
      default:
        return b.students - a.students;
    }
  });

  // Category options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'design', label: 'Design' }
  ];

  // Level options
  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'highest-rated', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Explore our courses</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover our wide range of courses to help you master new skills
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search courses..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select
                label="Category"
                options={categoryOptions}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>
            <div>
              <Select
                label="Level"
                options={levelOptions}
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sort and results count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{sortedCourses.length}</span> courses
          </p>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <select
              className="form-select text-sm py-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedCourses.map((course) => (
              <div key={course.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                <div className="flex-shrink-0">
                  <img 
                    className="h-48 w-full object-cover" 
                    src={course.image} 
                    alt={course.title} 
                  />
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {course.category === 'web-development' && 'Web Development'}
                        {course.category === 'data-science' && 'Data Science'}
                        {course.category === 'mobile-development' && 'Mobile Development'}
                        {course.category === 'design' && 'Design'}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                      </span>
                    </p>
                    <Link to={`/courses/${course.id}`} className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">{course.title}</p>
                      <p className="mt-3 text-base text-gray-500 line-clamp-2">{course.description}</p>
                    </Link>
                    <div className="mt-4 flex items-center">
                      <div className="flex items-center">
                        <BookOpenIcon className="h-5 w-5 text-primary-500" />
                        <span className="ml-1 text-sm text-gray-500">
                          {Math.floor(Math.random() * 10) + 5} modules
                        </span>
                      </div>
                      <div className="flex items-center ml-4">
                        <AcademicCapIcon className="h-5 w-5 text-primary-500" />
                        <span className="ml-1 text-sm text-gray-500">
                          {Math.floor(Math.random() * 50) + 10} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <img className="h-10 w-10 rounded-full" src={course.instructor.avatar} alt={course.instructor.name} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{course.instructor.name}</p>
                      <div className="flex items-center">
                        <div className="flex items-center text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="ml-1 text-sm text-gray-500">{course.rating} ({Math.floor(course.students / 10)} reviews)</p>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-1 text-sm text-gray-500">{course.students} students</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to={`/courses/${course.id}`}>
                      <Button variant="primary" fullWidth>View Course</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && sortedCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mt-2 text-gray-500">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <div className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedLevel('');
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;