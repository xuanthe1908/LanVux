// src/pages/dashboard/student/AssignmentsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import Button from '../../../components/ui/Button';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowUpOnSquareIcon,
  DocumentTextIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'late' | 'graded';
  grade?: number;
  feedback?: string;
  submissionDate?: string;
}

const StudentAssignmentsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        setTimeout(() => {
          // Mock data
          const mockAssignments: Assignment[] = [
            {
              id: '1',
              title: 'Create a Simple React App',
              courseId: '1',
              courseName: 'React Fundamentals',
              dueDate: '2025-05-25T23:59:59Z',
              status: 'graded',
              grade: 92,
              feedback: 'Excellent work! Your components are well-structured and the application works as expected. Good job implementing state management with hooks.',
              submissionDate: '2025-05-22T14:30:00Z'
            },
            {
              id: '2',
              title: 'State Management with Hooks',
              courseId: '1',
              courseName: 'React Fundamentals',
              dueDate: '2025-05-30T23:59:59Z',
              status: 'pending'
            },
            {
              id: '3',
              title: 'Build a RESTful API',
              courseId: '2',
              courseName: 'Node.js Backend Development',
              dueDate: '2025-05-18T23:59:59Z',
              status: 'late',
              submissionDate: '2025-05-19T10:15:00Z'
            },
            {
              id: '4',
              title: 'Database Integration',
              courseId: '2',
              courseName: 'Node.js Backend Development',
              dueDate: '2025-06-05T23:59:59Z',
              status: 'submitted',
              submissionDate: '2025-05-20T16:45:00Z'
            },
            {
              id: '5',
              title: 'Data Visualization Project',
              courseId: '3',
              courseName: 'Python for Data Science',
              dueDate: '2025-06-10T23:59:59Z',
              status: 'pending'
            }
          ];
          
          setAssignments(mockAssignments);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setIsLoading(false);
      }
    };
    
    fetchAssignments();
  }, []);
  
  // Filter and search assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = filter === 'all' || assignment.status === filter;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  // Format date for better display
  const formatDueDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Due Today';
    } else if (diffDays === 1) {
      return 'Due Tomorrow';
    } else if (diffDays > 1) {
      return `Due in ${diffDays} days`;
    } else {
      return `${Math.abs(diffDays)} days overdue`;
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Submitted
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
            Late
          </span>
        );
      case 'graded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Graded
          </span>
        );
      default:
        return null;
    }
  };
  
  // Get percentage of time remaining
  const getTimeRemainingPercentage = (dueDate: string): number => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (now > due) return 0;
    
    const total = 7 * 24 * 60 * 60 * 1000; // Assuming assignments are typically due within a week
    const remaining = due.getTime() - now.getTime();
    const percentage = Math.min(100, Math.round((remaining / total) * 100));
    
    return percentage;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="mt-1 text-gray-600">View and manage your assignments across all courses</p>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="sm:flex sm:justify-between sm:items-center">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'pending' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'submitted' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('submitted')}
            >
              Submitted
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'graded' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('graded')}
            >
              Graded
            </button>
          </div>
          
          <div className="max-w-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Search assignments..."
                className="form-input block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Assignments list */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "You don't have any assignments at the moment." 
              : `You don't have any ${filter} assignments.`}
          </p>
          {filter !== 'all' && (
            <Button variant="outline" onClick={() => setFilter('all')}>
              View All Assignments
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredAssignments.map((assignment) => (
              <li key={assignment.id} className="p-4 hover:bg-gray-50">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-1">
                      {getStatusBadge(assignment.status)}
                      <Link to={`/dashboard/student/courses/${assignment.courseId}`} className="ml-3 text-sm text-primary-600 hover:text-primary-800">
                        {assignment.courseName}
                      </Link>
                    </div>
                    <Link to={`/dashboard/student/assignments/${assignment.id}`} className="text-lg font-medium text-gray-900 hover:text-primary-600">
                      {assignment.title}
                    </Link>
                    
                    <div className="mt-2 sm:flex sm:items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{formatDueDate(assignment.dueDate)}</span>
                      </div>
                      {assignment.status === 'graded' && (
                        <div className="mt-1 sm:mt-0 sm:ml-4 flex items-center">
                          <span className="font-medium text-success-700">Grade: {assignment.grade}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {assignment.status === 'pending' && (
                      <Link to={`/dashboard/student/assignments/${assignment.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<ArrowUpOnSquareIcon className="h-5 w-5" />}
                        >
                          Submit
                        </Button>
                      </Link>
                    )}
                    
                    {(assignment.status === 'submitted' || assignment.status === 'late') && (
                      <Link to={`/dashboard/student/assignments/${assignment.id}`}>
                        <Button variant="outline" size="sm">
                          View Submission
                        </Button>
                      </Link>
                    )}
                    
                    {assignment.status === 'graded' && (
                      <Link to={`/dashboard/student/assignments/${assignment.id}`}>
                        <Button variant="outline" size="sm">
                          View Feedback
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                
                {assignment.status === 'pending' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Time remaining</span>
                      <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${getTimeRemainingPercentage(assignment.dueDate)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Calendar view link */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Need a better overview?</h3>
            <p className="text-sm text-gray-600 mt-1">
              View all your assignments in a calendar to plan ahead and meet all deadlines.
            </p>
          </div>
          <Link to="/dashboard/student/calendar">
            <Button
              variant="outline"
              rightIcon={<ChevronRightIcon className="h-5 w-5" />}
            >
              Calendar View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;