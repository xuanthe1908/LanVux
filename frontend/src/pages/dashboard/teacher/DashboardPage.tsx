// src/pages/dashboard/teacher/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  BookOpenIcon,
  BellIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Define types for the dashboard data
interface Course {
  id: string;
  title: string;
  studentCount: number;
  completionRate: number;
  coverImage?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  lastActive: string;
}

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  dueDate: string;
  submissionCount: number;
  totalStudents: number;
}

interface Notification {
  id: string;
  type: 'submission' | 'message' | 'system';
  content: string;
  timestamp: string;
  read: boolean;
}

interface TeachingStats {
  totalStudents: number;
  activeCourses: number;
  totalAssignments: number;
  pendingGrading: number;
  averageRating: number;
  totalReviews: number;
  coursesCompleted: number;
}

const TeacherDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<TeachingStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real application, fetch data from API
    // For now, use mock data
    setTimeout(() => {
      setCourses([
        { 
          id: '1', 
          title: 'React Fundamentals', 
          studentCount: 42, 
          completionRate: 68,
          coverImage: '/images/course-react.jpg'
        },
        { 
          id: '2', 
          title: 'Node.js Backend Development', 
          studentCount: 37, 
          completionRate: 52,
          coverImage: '/images/course-node.jpg'
        },
        { 
          id: '3', 
          title: 'Modern JavaScript', 
          studentCount: 28, 
          completionRate: 75,
          coverImage: '/images/course-js.jpg'
        },
        { 
          id: '4', 
          title: 'Advanced TypeScript', 
          studentCount: 24, 
          completionRate: 42,
          coverImage: '/images/course-ts.jpg'
        }
      ]);
      
      setRecentStudents([
        { id: '1', name: 'Alex Johnson', email: 'alex@example.com', progress: 85, lastActive: '2025-05-19T10:30:00Z' },
        { id: '2', name: 'Sarah Williams', email: 'sarah@example.com', progress: 67, lastActive: '2025-05-19T14:45:00Z' },
        { id: '3', name: 'Michael Brown', email: 'michael@example.com', progress: 93, lastActive: '2025-05-18T11:20:00Z' },
        { id: '4', name: 'Emily Davis', email: 'emily@example.com', progress: 42, lastActive: '2025-05-18T16:05:00Z' }
      ]);
      
      setUpcomingAssignments([
        { id: '1', title: 'React Component Assignment', courseId: '1', courseTitle: 'React Fundamentals', dueDate: '2025-05-25T23:59:59Z', submissionCount: 15, totalStudents: 42 },
        { id: '2', title: 'Node.js API Project', courseId: '2', courseTitle: 'Node.js Backend Development', dueDate: '2025-05-22T23:59:59Z', submissionCount: 8, totalStudents: 37 },
        { id: '3', title: 'JavaScript Array Methods', courseId: '3', courseTitle: 'Modern JavaScript', dueDate: '2025-05-28T23:59:59Z', submissionCount: 12, totalStudents: 28 }
      ]);
      
      setNotifications([
        { id: '1', type: 'submission', content: 'New submission for "React Component Assignment" from Alex Johnson', timestamp: '2025-05-19T10:30:00Z', read: false },
        { id: '2', type: 'message', content: 'Sarah Williams has a question about Node.js assignment', timestamp: '2025-05-19T09:15:00Z', read: false },
        { id: '3', type: 'system', content: 'Monthly teaching report is now available', timestamp: '2025-05-18T16:00:00Z', read: true },
        { id: '4', type: 'submission', content: 'New submission for "JavaScript Array Methods" from Michael Brown', timestamp: '2025-05-18T11:20:00Z', read: true }
      ]);
      
      setStats({
        totalStudents: 131,
        activeCourses: 4,
        totalAssignments: 12,
        pendingGrading: 18,
        averageRating: 4.7,
        totalReviews: 87,
        coursesCompleted: 156
      });
      
      setIsLoading(false);
    }, 1000);
  }, []);

  // Format date for better display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format timestamp for notifications
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Format last active time for students
  const formatLastActive = (lastActiveTime: string): string => {
    const date = new Date(lastActiveTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.round(diffMs / 3600000);
    
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return formatDate(lastActiveTime);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <ClipboardDocumentListIcon className="h-5 w-5 text-success-600" />;
      case 'message':
        return <BellIcon className="h-5 w-5 text-primary-600" />;
      case 'system':
        return <AcademicCapIcon className="h-5 w-5 text-warning-600" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-600" />;
    }
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
        <p className="text-gray-600 mt-1">Here's what's happening with your courses today.</p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <BookOpenIcon className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Active Courses</h2>
              <p className="text-2xl font-bold text-primary-600">{stats?.activeCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-100 text-accent-600">
              <UserGroupIcon className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Students</h2>
              <p className="text-2xl font-bold text-accent-600">{stats?.totalStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <ClipboardDocumentListIcon className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Pending Grading</h2>
              <p className="text-2xl font-bold text-success-600">{stats?.pendingGrading}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-100 text-warning-600">
              <ChartBarIcon className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Average Rating</h2>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-warning-600">{stats?.averageRating}</p>
                <span className="text-xs text-gray-500 ml-1">/ 5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course overview and AI tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course overview */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2 text-primary-600" />
              Your Courses
            </h2>
            <div className="flex space-x-2">
              <Link 
                to="/dashboard/teacher/courses/new"
                className="text-xs py-1 px-2 bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
              >
                + New Course
              </Link>
              <Link 
                to="/dashboard/teacher/courses"
                className="text-xs py-1 px-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                View All
              </Link>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow transition-shadow">
                <div className="h-32 bg-gray-300 relative">
                  {course.coverImage && (
                    <img 
                      src={course.coverImage} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold">{course.title}</h3>
                  </div>
                </div>
                
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 text-accent-600 mr-1" />
                      <span>{course.studentCount} students</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Completion:</span>
                      <span className="font-medium ml-1">{course.completionRate}%</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 mb-4">
                    <div 
                      className="bg-primary-600 h-1.5 rounded-full" 
                      style={{ width: `${course.completionRate}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Link 
                      to={`/dashboard/teacher/courses/${course.id}/students`}
                      className="text-xs text-accent-600 hover:text-accent-700"
                    >
                      View Students
                    </Link>
                    <Link 
                      to={`/dashboard/teacher/courses/${course.id}`}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Manage Course
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI Teaching Assistant */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2 text-warning-600" />
            AI Teaching Assistant
          </h2>
          
          <p className="text-gray-600 text-sm mb-4">
            Enhance your teaching with powerful AI tools that help you create quizzes, provide feedback, and identify key concepts.
          </p>
          
          <div className="space-y-3">
            <Link 
              to="/dashboard/teacher/ai-quiz-generator"
              className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <AcademicCapIcon className="h-5 w-5 text-accent-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium">Generate Quizzes</h3>
                  <p className="text-xs text-gray-600">Create quizzes from your lecture content</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/dashboard/teacher/ai-feedback"
              className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-5 w-5 text-success-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium">Assignment Feedback</h3>
                  <p className="text-xs text-gray-600">Generate helpful feedback for student submissions</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/dashboard/teacher/ai-concepts"
              className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <LightBulbIcon className="h-5 w-5 text-warning-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium">Extract Key Concepts</h3>
                  <p className="text-xs text-gray-600">Identify important concepts from your lectures</p>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <h3 className="text-sm font-medium text-primary-900 mb-2">AI Assistant Tips</h3>
            <p className="text-xs text-primary-700">
              Use the AI tools to save time when creating assessments and providing feedback. Our AI is trained on educational best practices to help you focus on what matters most.
            </p>
            <Link 
              to="/dashboard/teacher/ai-assistant"
              className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700 inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
      
      {/* Assignments and Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Assignments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-primary-600" />
              Upcoming Assignments
            </h2>
            <Link 
              to="/dashboard/teacher/assignments"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/dashboard/teacher/assignments/${assignment.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600"
                      >
                        {assignment.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{assignment.courseTitle}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{formatDate(assignment.dueDate)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {assignment.submissionCount} / {assignment.totalStudents}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary-600 h-1.5 rounded-full" 
                          style={{ width: `${(assignment.submissionCount / assignment.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Student Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-accent-600" />
              Recent Student Activity
            </h2>
            <Link 
              to="/dashboard/teacher/students"
              className="text-sm text-accent-600 hover:text-accent-700"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentStudents.map((student) => (
              <div key={student.id} className="flex items-center border-b border-gray-100 pb-3 last:border-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">{student.name.charAt(0)}</span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <Link 
                    to={`/dashboard/teacher/students/${student.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-accent-600"
                  >
                    {student.name}
                  </Link>
                  <div className="flex items-center mt-1">
                    <ArrowTrendingUpIcon className="h-3 w-3 text-success-600 mr-1" />
                    <p className="text-xs text-gray-600">{student.progress}% progress</p>
                    <span className="mx-1 text-gray-300">•</span>
                    <p className="text-xs text-gray-500">Active {formatLastActive(student.lastActive)}</p>
                  </div>
                </div>
                <Link
                  to={`/dashboard/teacher/messages/new?recipient=${student.id}`}
                  className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-primary-600 rounded-full hover:bg-primary-50"
                  title="Send message"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BellIcon className="h-5 w-5 mr-2 text-primary-600" />
            Recent Notifications
          </h2>
          <Link 
            to="/dashboard/teacher/notifications"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View All
          </Link>
        </div>
        
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex">
                  <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {notification.content}
                  </p>
                  {!notification.read && (
                    <span className="ml-2 flex-shrink-0 inline-block h-2 w-2 rounded-full bg-primary-600"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/dashboard/teacher/assignments/new"
          className="bg-white rounded-lg shadow-md p-4 hover:bg-primary-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors">
              <ClipboardDocumentListIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Create Assignment</h3>
              <p className="text-xs text-gray-500">Add new work for students</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/dashboard/teacher/gradebook"
          className="bg-white rounded-lg shadow-md p-4 hover:bg-accent-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-accent-100 text-accent-600 group-hover:bg-accent-200 transition-colors">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Gradebook</h3>
              <p className="text-xs text-gray-500">Review student grades</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/dashboard/teacher/messages"
          className="bg-white rounded-lg shadow-md p-4 hover:bg-success-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-success-100 text-success-600 group-hover:bg-success-200 transition-colors">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Messages</h3>
              <p className="text-xs text-gray-500">Communicate with students</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/dashboard/teacher/courses/new"
          className="bg-white rounded-lg shadow-md p-4 hover:bg-warning-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-warning-100 text-warning-600 group-hover:bg-warning-200 transition-colors">
              <BookOpenIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Create Course</h3>
              <p className="text-xs text-gray-500">Design a new learning experience</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;