// src/pages/dashboard/teacher/AssignmentsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon,
  ClipboardDocumentListIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

interface Assignment {
  id: string;
  title: string;
  course: {
    id: string;
    title: string;
  };
  dueDate: string;
  totalStudents: number;
  submissionCount: number;
  status: 'draft' | 'published' | 'closed';
  type: 'quiz' | 'assignment' | 'project' | 'exam';
}

const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch assignments data
  useEffect(() => {
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      const mockAssignments: Assignment[] = [
        {
          id: 'a1',
          title: 'React Components Assignment',
          course: { id: 'c1', title: 'React Fundamentals' },
          dueDate: '2025-05-25',
          totalStudents: 42,
          submissionCount: 28,
          status: 'published',
          type: 'assignment'
        },
        {
          id: 'a2',
          title: 'Node.js API Project',
          course: { id: 'c2', title: 'Node.js Backend Development' },
          dueDate: '2025-06-10',
          totalStudents: 37,
          submissionCount: 12,
          status: 'published',
          type: 'project'
        },
        {
          id: 'a3',
          title: 'JavaScript Midterm Exam',
          course: { id: 'c3', title: 'JavaScript Masterclass' },
          dueDate: '2025-05-30',
          totalStudents: 45,
          submissionCount: 0,
          status: 'draft',
          type: 'exam'
        },
        {
          id: 'a4',
          title: 'React Hooks Quiz',
          course: { id: 'c1', title: 'React Fundamentals' },
          dueDate: '2025-05-20',
          totalStudents: 42,
          submissionCount: 39,
          status: 'published',
          type: 'quiz'
        },
        {
          id: 'a5',
          title: 'CSS Layouts Assignment',
          course: { id: 'c4', title: 'Advanced CSS Techniques' },
          dueDate: '2025-05-15',
          totalStudents: 32,
          submissionCount: 31,
          status: 'closed',
          type: 'assignment'
        }
      ];
      
      setAssignments(mockAssignments);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = searchTerm === '' || 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || assignment.course.id === courseFilter;
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesType = typeFilter === 'all' || assignment.type === typeFilter;
    
    return matchesSearch && matchesCourse && matchesStatus && matchesType;
  });

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique courses for filter
  const courses = [
    { id: 'all', title: 'All Courses' },
    ...Array.from(new Set(assignments.map(a => a.course.id)))
      .map(id => {
        const course = assignments.find(a => a.course.id === id)?.course;
        return { id, title: course?.title || '' };
      })
  ];

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setCourseFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success-100 text-success-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'closed':
        return 'bg-accent-100 text-accent-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Type badge colors
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-primary-100 text-primary-800';
      case 'assignment':
        return 'bg-success-100 text-success-800';
      case 'project':
        return 'bg-warning-100 text-warning-800';
      case 'exam':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <Link to="/dashboard/teacher/assignments/create">
            <Button 
              variant="primary" 
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Create Assignment
            </Button>
          </Link>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            {/* Search box */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input w-full pl-10 rounded-md border-gray-300"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Select
                options={courses.map(c => ({ value: c.id, label: c.title }))}
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                fullWidth={false}
                className="w-40"
              />
              
              <Select
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'closed', label: 'Closed' }
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                fullWidth={false}
                className="w-40"
              />
              
              <Select
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'quiz', label: 'Quiz' },
                  { value: 'assignment', label: 'Assignment' },
                  { value: 'project', label: 'Project' },
                  { value: 'exam', label: 'Exam' }
                ]}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                fullWidth={false}
                className="w-40"
              />
              
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
          </div>
          
          {/* Filter summary */}
          {(searchTerm || courseFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all') && (
            <div className="mt-3 flex items-center">
              <FunnelIcon className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-500">
                Filtered: {filteredAssignments.length} assignments found
              </span>
            </div>
          )}
        </div>
        
        {/* Assignments table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center text-primary-700">
                          <ClipboardDocumentListIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.course.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(assignment.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {assignment.submissionCount} / {assignment.totalStudents}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary-600 h-1.5 rounded-full" 
                          style={{ width: `${(assignment.submissionCount / assignment.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(assignment.status)}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(assignment.type)}`}>
                        {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/dashboard/teacher/assignments/${assignment.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/dashboard/teacher/assignments/${assignment.id}/edit`}
                        className="text-accent-600 hover:text-accent-900 mr-3"
                      >
                        Edit
                      </Link>
                      <button className="text-danger-600 hover:text-danger-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredAssignments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No assignments found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsPage;