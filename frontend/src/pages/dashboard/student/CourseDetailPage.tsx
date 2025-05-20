// src/pages/dashboard/student/CourseDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpenIcon, 
  ClockIcon, 
  UserIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  PlayCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import Alert from '../../../components/ui/Alert';

// Simple mock data interfaces
interface Lecture {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  type: 'video' | 'quiz' | 'assignment' | 'text';
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  progress: number;
  lectures: Lecture[];
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLectureId, setCurrentLectureId] = useState<string | null>(null);

  useEffect(() => {
    // Simulated API call to fetch course details
    setTimeout(() => {
      if (!id) {
        setError('Course ID is missing');
        setIsLoading(false);
        return;
      }

      // Mock course data
      const mockCourse: Course = {
        id: id,
        title: id === '1' ? 'React Fundamentals' : 
               id === '2' ? 'Node.js Backend Development' : 
               'Python for Data Science',
        description: 'Learn the fundamentals and build real-world projects in this comprehensive course.',
        instructor: {
          name: 'Jane Smith',
          avatar: '/images/instructor-1.jpg'
        },
        thumbnail: `/images/course-${id === '1' ? 'react' : id === '2' ? 'node' : 'python'}.jpg`,
        progress: 42,
        lectures: [
          {
            id: 'l1',
            title: 'Introduction to the Course',
            duration: 10,
            completed: true,
            type: 'video'
          },
          {
            id: 'l2',
            title: 'Getting Started',
            duration: 15,
            completed: true,
            type: 'video'
          },
          {
            id: 'l3',
            title: 'Core Concepts',
            duration: 25,
            completed: false,
            type: 'video'
          },
          {
            id: 'l4',
            title: 'Module 1 Quiz',
            duration: 15,
            completed: false,
            type: 'quiz'
          },
          {
            id: 'l5',
            title: 'Building Your First Project',
            duration: 45,
            completed: false,
            type: 'assignment'
          }
        ]
      };

      setCourse(mockCourse);
      setCurrentLectureId(mockCourse.lectures[0].id);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const goBack = () => {
    navigate('/dashboard/student/courses');
  };

  const handleLectureSelect = (lectureId: string) => {
    setCurrentLectureId(lectureId);
  };

  const markLectureAsCompleted = (lectureId: string) => {
    if (!course) return;
    
    const updatedLectures = course.lectures.map(lecture => 
      lecture.id === lectureId ? { ...lecture, completed: true } : lecture
    );
    
    const completedCount = updatedLectures.filter(lecture => lecture.completed).length;
    const progress = Math.round((completedCount / updatedLectures.length) * 100);
    
    setCourse({
      ...course,
      lectures: updatedLectures,
      progress: progress
    });
  };

  const findCurrentLecture = () => {
    if (!course || !currentLectureId) return null;
    return course.lectures.find(lecture => lecture.id === currentLectureId);
  };

  // Format time duration
  const formatDuration = (minutes: number): string => {
    return `${minutes} min`;
  };

  // Get lecture icon based on type
  const getLectureIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircleIcon className="h-5 w-5 text-blue-600" />;
      case 'quiz':
        return <DocumentTextIcon className="h-5 w-5 text-yellow-600" />;
      case 'assignment':
        return <DocumentTextIcon className="h-5 w-5 text-green-600" />;
      default:
        return <BookOpenIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4">
        <Alert type="error" message={error || 'Course not found'} />
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={goBack}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const currentLecture = findCurrentLecture();

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goBack}
          leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          className="mr-4"
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
      </div>
      
      {/* Course info and progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row">
          {/* Course thumbnail */}
          <div className="md:w-1/3 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <img 
              src={course.thumbnail || '/images/course-default.jpg'} 
              alt={course.title}
              className="w-full rounded-lg h-48 md:h-auto object-cover"
            />
          </div>
          
          {/* Course details */}
          <div className="md:w-2/3">
            <p className="text-gray-600 mb-4">{course.description}</p>
            
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <img 
                  src={course.instructor.avatar || '/images/avatar-default.jpg'} 
                  alt={course.instructor.name}
                  className="h-10 w-10 rounded-full"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Instructor</p>
                <p className="text-sm text-gray-500">{course.instructor.name}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Course Progress</span>
                <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lecture list */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h2>
          
          <div className="space-y-2">
            {course.lectures.map((lecture) => (
              <button
                key={lecture.id}
                className={`w-full flex items-center p-3 rounded-md text-left ${
                  currentLectureId === lecture.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => handleLectureSelect(lecture.id)}
              >
                <div className="flex-shrink-0 mr-3">
                  {lecture.completed ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    getLectureIcon(lecture.type)
                  )}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">{lecture.title}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{formatDuration(lecture.duration)}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{lecture.type}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Lecture content */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          {currentLecture ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{currentLecture.title}</h2>
                {!currentLecture.completed && (
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => markLectureAsCompleted(currentLecture.id)}
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
              
              {/* Content display based on lecture type */}
              {currentLecture.type === 'video' && (
                <div className="bg-black rounded-lg overflow-hidden aspect-w-16 aspect-h-9">
                  <div className="flex flex-col items-center justify-center text-white">
                    <PlayCircleIcon className="h-16 w-16 mb-2" />
                    <p>Video content would load here</p>
                  </div>
                </div>
              )}
              
              {currentLecture.type === 'quiz' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Quiz: {currentLecture.title}</h3>
                  <p className="mb-4">Test your knowledge with this quiz.</p>
                  <Button variant="warning">Start Quiz</Button>
                </div>
              )}
              
              {currentLecture.type === 'assignment' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Assignment: {currentLecture.title}</h3>
                  <p className="mb-4">Complete this assignment to apply what you've learned.</p>
                  <div className="flex space-x-4">
                    <Button variant="success">View Instructions</Button>
                    <Button variant="outline">Submit Assignment</Button>
                  </div>
                </div>
              )}
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentLectureId === course.lectures[0].id}
                  onClick={() => {
                    if (currentLectureId) {
                      const currentIndex = course.lectures.findIndex(l => l.id === currentLectureId);
                      if (currentIndex > 0) {
                        handleLectureSelect(course.lectures[currentIndex - 1].id);
                      }
                    }
                  }}
                >
                  Previous
                </Button>
                
                <Button 
                  variant="primary" 
                  size="sm"
                  disabled={currentLectureId === course.lectures[course.lectures.length - 1].id}
                  onClick={() => {
                    if (currentLectureId) {
                      const currentIndex = course.lectures.findIndex(l => l.id === currentLectureId);
                      if (currentIndex < course.lectures.length - 1) {
                        handleLectureSelect(course.lectures[currentIndex + 1].id);
                      }
                    }
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <BookOpenIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Select a lecture to begin learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;