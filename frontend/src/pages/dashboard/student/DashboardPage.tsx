// src/pages/dashboard/student/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Define types for enrolled courses
interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  coverImage?: string;
  nextLesson?: {
    id: string;
    title: string;
  };
}

// Define types for upcoming assignments
interface UpcomingAssignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  dueDate: string;
  isSubmitted: boolean;
}

// Define types for announcements
interface Announcement {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  date: string;
  isRead: boolean;
}

// Define types for learning streak
interface LearningStreak {
  current: number;
  longest: number;
  thisWeek: number[];
}

const StudentDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<UpcomingAssignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [learningStreak, setLearningStreak] = useState<LearningStreak | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real application, fetch data from API
    // For now, use mock data
    setTimeout(() => {
      setEnrolledCourses([
        {
          id: '1',
          title: 'React Fundamentals',
          progress: 65,
          coverImage: '/images/course-react.jpg',
          nextLesson: {
            id: 'lesson-1',
            title: 'React Hooks in Depth'
          }
        },
        {
          id: '2',
          title: 'Node.js Backend Development',
          progress: 42,
          coverImage: '/images/course-node.jpg',
          nextLesson: {
            id: 'lesson-2',
            title: 'RESTful API Design'
          }
        },
        {
          id: '3',
          title: 'Python for Data Science',
          progress: 18,
          coverImage: '/images/course-python.jpg',
          nextLesson: {
            id: 'lesson-3',
            title: 'Data Visualization with Matplotlib'
          }
        },
        {
          id: '4',
          title: 'UX/UI Design Principles',
          progress: 10,
          coverImage: '/images/course-ux.jpg',
          nextLesson: {
            id: 'lesson-4',
            title: 'User Research Methods'
          }
        }
      ]);

      setUpcomingAssignments([
        {
          id: 'a1',
          courseId: '1',
          courseTitle: 'React Fundamentals',
          title: 'Build a Component Library',
          dueDate: '2025-05-25T23:59:59Z',
          isSubmitted: false
        },
        {
          id: 'a2',
          courseId: '2',
          courseTitle: 'Node.js Backend Development',
          title: 'RESTful API Implementation',
          dueDate: '2025-05-22T23:59:59Z',
          isSubmitted: false
        },
        {
          id: 'a3',
          courseId: '3',
          courseTitle: 'Python for Data Science',
          title: 'Data Analysis Project',
          dueDate: '2025-05-30T23:59:59Z',
          isSubmitted: false
        }
      ]);

      setAnnouncements([
        {
          id: 'an1',
          courseId: '1',
          courseTitle: 'React Fundamentals',
          title: 'Live Q&A Session This Friday',
          date: '2025-05-18T10:15:00Z',
          isRead: false
        },
        {
          id: 'an2',
          courseId: '2',
          courseTitle: 'Node.js Backend Development',
          title: 'Assignment Deadline Extended',
          date: '2025-05-17T15:30:00Z',
          isRead: true
        }
      ]);

      setLearningStreak({
        current: 5,
        longest: 14,
        thisWeek: [1, 1, 1, 1, 1, 0, 0] // Mon-Sun
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  // Calculate days until due date
  const daysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-600 mt-1">Ready to continue your learning journey?</p>
      </div>
      
      {/* Learning streak */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <ClockIcon className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Learning Streak</h2>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-primary-600">{learningStreak?.current}</p>
                <p className="ml-2 text-gray-500">days</p>
              </div>
              <p className="text-sm text-gray-500">Longest: {learningStreak?.longest} days</p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {learningStreak?.thisWeek.map((day, index) => (
              <div 
                key={index} 
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  day === 1 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Course progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpenIcon className="h-5 w-5 mr-2 text-primary-600" />
            My Courses
          </h2>
          <Link to="/dashboard/student/courses" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {enrolledCourses.slice(0, 2).map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-300 relative">
                {course.coverImage && (
                  <img 
                    src={course.coverImage} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-semibold">{course.title}</h3>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                
                {course.nextLesson && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">NEXT LESSON</p>
                    <Link 
                      to={`/dashboard/student/courses/${course.id}/lessons/${course.nextLesson.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center mt-1"
                    >
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      {course.nextLesson.title}
                    </Link>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Link 
                    to={`/dashboard/student/courses/${course.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          {enrolledCourses.slice(2, 4).map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">{course.title}</h3>
              
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-primary-600 h-1.5 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <Link 
                  to={`/dashboard/student/courses/${course.id}`}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Continue
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main content - Upcoming assignments & announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming assignments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-accent-600" />
              Upcoming Assignments
            </h2>
            <Link to="/dashboard/student/assignments" className="text-sm text-accent-600 hover:text-accent-700">
              View All
            </Link>
          </div>
          
          {upcomingAssignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No upcoming assignments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-start space-x-4 border-b border-gray-100 pb-4">
                  <div className={`p-3 rounded-lg flex-shrink-0 ${
                    daysUntilDue(assignment.dueDate) <= 2 
                      ? 'bg-danger-100 text-danger-700' 
                      : daysUntilDue(assignment.dueDate) <= 5
                        ? 'bg-warning-100 text-warning-700'
                        : 'bg-success-100 text-success-700'
                  }`}>
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-md font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-500">{assignment.courseTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          daysUntilDue(assignment.dueDate) <= 2 
                            ? 'text-danger-600' 
                            : daysUntilDue(assignment.dueDate) <= 5
                              ? 'text-warning-600'
                              : 'text-success-600'
                        }`}>
                          Due {formatDate(assignment.dueDate)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {daysUntilDue(assignment.dueDate)} days left
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Link 
                        to={`/dashboard/student/assignments/${assignment.id}`}
                        className="text-sm text-accent-600 hover:text-accent-700"
                      >
                        {assignment.isSubmitted ? 'View Submission' : 'Start Assignment'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Announcements */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-success-600" />
              Announcements
            </h2>
          </div>
          
          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No new announcements</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="relative border-l-4 pl-4 py-1 mb-3 hover:bg-gray-50">
                  <div className={`absolute top-0 left-[-5px] w-2 h-2 rounded-full ${announcement.isRead ? 'bg-gray-300' : 'bg-success-500'}`}></div>
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-gray-900">{announcement.title}</h3>
                      <span className="text-xs text-gray-500">{formatDate(announcement.date)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{announcement.courseTitle}</p>
                    <Link 
                      to={`/dashboard/student/courses/${announcement.courseId}/announcements/${announcement.id}`}
                      className="text-xs text-success-600 hover:text-success-700 mt-1 inline-block"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Link 
              to="/dashboard/student/messages"
              className="text-sm text-success-600 hover:text-success-700"
            >
              View All Messages
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dashboard/student/ai-chat"
          className="bg-white rounded-lg shadow-md p-6 hover:bg-primary-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">AI Learning Assistant</h3>
              <p className="text-sm text-gray-500">Get help with your courses</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/dashboard/student/grades"
          className="bg-white rounded-lg shadow-md p-6 hover:bg-accent-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-100 text-accent-600 group-hover:bg-accent-200 transition-colors">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">View Grades</h3>
              <p className="text-sm text-gray-500">Check your academic progress</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/courses"
          className="bg-white rounded-lg shadow-md p-6 hover:bg-success-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-600 group-hover:bg-success-200 transition-colors">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">Browse Courses</h3>
              <p className="text-sm text-gray-500">Discover new learning opportunities</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboardPage;