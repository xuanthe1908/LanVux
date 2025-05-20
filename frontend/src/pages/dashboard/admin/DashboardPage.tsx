// src/pages/dashboard/admin/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
  UserPlusIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';

// Define types for the statistics
interface Statistics {
  totalUsers: number;
  totalCourses: number;
  activeStudents: number;
  activeTeachers: number;
  newUsersThisMonth: number;
  newCoursesThisMonth: number;
  totalRevenue: number;
}

// Define types for recent activities
interface Activity {
  id: string;
  type: 'user_registered' | 'course_created' | 'course_published' | 'user_enrolled';
  details: string;
  timestamp: string;
  relatedId?: string;
}

// Define types for system health
interface SystemHealth {
  diskUsage: number;
  memoryUsage: number;
  cpuUsage: number;
  lastBackup: string;
  apiStatus: 'operational' | 'degraded' | 'down';
  databaseStatus: 'operational' | 'degraded' | 'down';
}

const AdminDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real application, fetch data from API
    // For now, use mock data
    setTimeout(() => {
      setStatistics({
        totalUsers: 1542,
        totalCourses: 78,
        activeStudents: 943,
        activeTeachers: 46,
        newUsersThisMonth: 87,
        newCoursesThisMonth: 12,
        totalRevenue: 45750.80
      });

      setRecentActivities([
        {
          id: '1',
          type: 'user_registered',
          details: 'New student John Doe registered',
          timestamp: '2025-05-19T13:45:00Z',
          relatedId: 'user-123'
        },
        {
          id: '2',
          type: 'course_created',
          details: 'New course "Advanced Machine Learning" created by Dr. Smith',
          timestamp: '2025-05-19T10:30:00Z',
          relatedId: 'course-456'
        },
        {
          id: '3',
          type: 'user_enrolled',
          details: 'Sarah Johnson enrolled in "Web Development Masterclass"',
          timestamp: '2025-05-18T16:20:00Z',
          relatedId: 'enrollment-789'
        },
        {
          id: '4',
          type: 'course_published',
          details: 'Course "Data Science Fundamentals" published by Prof. Williams',
          timestamp: '2025-05-18T09:15:00Z',
          relatedId: 'course-101'
        },
        {
          id: '5',
          type: 'user_registered',
          details: 'New teacher Emily Wilson registered',
          timestamp: '2025-05-17T14:50:00Z',
          relatedId: 'user-202'
        }
      ]);

      setSystemHealth({
        diskUsage: 42,
        memoryUsage: 58,
        cpuUsage: 25,
        lastBackup: '2025-05-19T02:00:00Z',
        apiStatus: 'operational',
        databaseStatus: 'operational'
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserPlusIcon className="h-5 w-5 text-primary-600" />;
      case 'course_created':
      case 'course_published':
        return <DocumentPlusIcon className="h-5 w-5 text-success-600" />;
      case 'user_enrolled':
        return <BookOpenIcon className="h-5 w-5 text-accent-600" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
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
        <p className="text-gray-600 mt-1">Here's what's happening in your e-learning platform today.</p>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <UsersIcon className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Total Users</h2>
              <p className="text-3xl font-bold text-primary-600">{statistics?.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">
                <span className="text-success-600">+{statistics?.newUsersThisMonth}</span> this month
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-100 text-accent-600">
              <BookOpenIcon className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Total Courses</h2>
              <p className="text-3xl font-bold text-accent-600">{statistics?.totalCourses}</p>
              <p className="text-sm text-gray-500">
                <span className="text-success-600">+{statistics?.newCoursesThisMonth}</span> this month
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <ChartBarIcon className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Students</h2>
              <p className="text-3xl font-bold text-success-600">{statistics?.activeStudents}</p>
              <p className="text-sm text-gray-500">
                {Math.round((statistics?.activeStudents! / statistics?.totalUsers!) * 100)}% of users
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-100 text-warning-600">
              <PresentationChartLineIcon className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Total Revenue</h2>
              <p className="text-3xl font-bold text-warning-600">${statistics?.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Lifetime earnings</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link to="/dashboard/admin/reports" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.details}</p>
                  <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                </div>
                <div>
                  <Link 
                    to={
                      activity.type === 'user_registered' 
                        ? `/dashboard/admin/users/${activity.relatedId}` 
                        : activity.type.includes('course') 
                          ? `/dashboard/admin/courses/${activity.relatedId}`
                          : '#'
                    }
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* System health and quick links */}
        <div className="space-y-6">
          {/* System health */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                  <span className="text-sm font-medium text-gray-700">{systemHealth?.diskUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${systemHealth?.diskUsage! > 80 ? 'bg-danger-600' : 'bg-success-600'}`} 
                    style={{ width: `${systemHealth?.diskUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                  <span className="text-sm font-medium text-gray-700">{systemHealth?.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${systemHealth?.memoryUsage! > 80 ? 'bg-danger-600' : 'bg-success-600'}`} 
                    style={{ width: `${systemHealth?.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                  <span className="text-sm font-medium text-gray-700">{systemHealth?.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${systemHealth?.cpuUsage! > 80 ? 'bg-danger-600' : 'bg-success-600'}`} 
                    style={{ width: `${systemHealth?.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">API Status</p>
                  <p className={`text-sm font-medium ${
                    systemHealth?.apiStatus === 'operational' ? 'text-success-600' : 
                    systemHealth?.apiStatus === 'degraded' ? 'text-warning-600' : 'text-danger-600'
                  }`}>
                    {systemHealth?.apiStatus
                      ? systemHealth.apiStatus.charAt(0).toUpperCase() + systemHealth.apiStatus.slice(1)
                      : ''}
                  </p>
                </div>
                
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Database Status</p>
                  <p className={`text-sm font-medium ${
                    systemHealth?.databaseStatus === 'operational' ? 'text-success-600' : 
                    systemHealth?.databaseStatus === 'degraded' ? 'text-warning-600' : 'text-danger-600'
                  }`}>
                    {systemHealth?.databaseStatus
                      ? systemHealth.databaseStatus.charAt(0).toUpperCase() + systemHealth.databaseStatus.slice(1)
                      : ''}
                  </p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">Last Backup: {new Date(systemHealth?.lastBackup!).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="grid grid-cols-1 gap-3">
              <Link 
                to="/dashboard/admin/users/new" 
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                <UserPlusIcon className="h-5 w-5 text-primary-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Add New User</span>
              </Link>
              
              <Link 
                to="/dashboard/admin/courses/new" 
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                <DocumentPlusIcon className="h-5 w-5 text-accent-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Create New Course</span>
              </Link>
              
              <Link 
                to="/dashboard/admin/reports/generate" 
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                <ChartBarIcon className="h-5 w-5 text-success-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Generate Reports</span>
              </Link>
              
              <Link 
                to="/dashboard/admin/settings" 
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                <Cog6ToothIcon className="h-5 w-5 text-warning-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">System Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;