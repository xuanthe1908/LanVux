import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface CourseGrade {
  courseId: string;
  courseName: string;
  grade: number | null;
  status: 'in-progress' | 'completed';
  assignments: {
    id: string;
    title: string;
    grade: number | null;
    weight: number;
    dueDate: string;
    submissionDate?: string;
  }[];
}

const StudentGradesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [grades, setGrades] = useState<CourseGrade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [overallGPA, setOverallGPA] = useState<number | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchGrades = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        setTimeout(() => {
          // Mock data
          const mockGrades: CourseGrade[] = [
            {
              courseId: '1',
              courseName: 'React Fundamentals',
              grade: 92,
              status: 'in-progress',
              assignments: [
                {
                  id: '1',
                  title: 'Create a Simple React App',
                  grade: 94,
                  weight: 0.2,
                  dueDate: '2025-05-10T23:59:59Z',
                  submissionDate: '2025-05-09T14:30:00Z'
                },
                {
                  id: '2',
                  title: 'Component Lifecycle',
                  grade: 88,
                  weight: 0.15,
                  dueDate: '2025-05-20T23:59:59Z',
                  submissionDate: '2025-05-19T16:45:00Z'
                },
                {
                  id: '3',
                  title: 'State Management with Hooks',
                  grade: null,
                  weight: 0.25,
                  dueDate: '2025-05-30T23:59:59Z'
                },
                {
                  id: '4',
                  title: 'Final Project',
                  grade: null,
                  weight: 0.4,
                  dueDate: '2025-06-10T23:59:59Z'
                }
              ]
            },
            {
              courseId: '2',
              courseName: 'Node.js Backend Development',
              grade: 87,
              status: 'in-progress',
              assignments: [
                {
                  id: '5',
                  title: 'RESTful API Basics',
                  grade: 90,
                  weight: 0.15,
                  dueDate: '2025-05-08T23:59:59Z',
                  submissionDate: '2025-05-07T11:20:00Z'
                },
                {
                  id: '6',
                  title: 'Authentication Implementation',
                  grade: 85,
                  weight: 0.2,
                  dueDate: '2025-05-18T23:59:59Z',
                  submissionDate: '2025-05-17T09:15:00Z'
                },
                {
                  id: '7',
                  title: 'Database Integration',
                  grade: null,
                  weight: 0.25,
                  dueDate: '2025-05-28T23:59:59Z'
                },
                {
                  id: '8',
                  title: 'Final Backend Project',
                  grade: null,
                  weight: 0.4,
                  dueDate: '2025-06-15T23:59:59Z'
                }
              ]
            },
            {
              courseId: '3',
              courseName: 'Python for Data Science',
              grade: 95,
              status: 'completed',
              assignments: [
                {
                  id: '9',
                  title: 'Data Manipulation with Pandas',
                  grade: 92,
                  weight: 0.2,
                  dueDate: '2025-04-10T23:59:59Z',
                  submissionDate: '2025-04-09T15:30:00Z'
                },
                {
                  id: '10',
                  title: 'Data Visualization',
                  grade: 96,
                  weight: 0.2,
                  dueDate: '2025-04-20T23:59:59Z',
                  submissionDate: '2025-04-19T14:00:00Z'
                },
                {
                  id: '11',
                  title: 'Machine Learning Basics',
                  grade: 94,
                  weight: 0.25,
                  dueDate: '2025-04-30T23:59:59Z',
                  submissionDate: '2025-04-28T10:15:00Z'
                },
                {
                  id: '12',
                  title: 'Final Data Science Project',
                  grade: 97,
                  weight: 0.35,
                  dueDate: '2025-05-15T23:59:59Z',
                  submissionDate: '2025-05-13T16:20:00Z'
                }
              ]
            }
          ];
          
          setGrades(mockGrades);
          
          // Calculate overall GPA (on a 4.0 scale for demonstration)
          const completedCourses = mockGrades.filter(course => course.grade !== null);
          if (completedCourses.length > 0) {
            const totalGrade = completedCourses.reduce((acc, course) => acc + (course.grade || 0), 0);
            const gpa = (totalGrade / completedCourses.length) / 25; // Convert from 100 scale to 4.0 scale (simplified)
            setOverallGPA(parseFloat(gpa.toFixed(2)));
          }
          
          // Expand first course by default
          if (mockGrades.length > 0) {
            setExpandedCourses({ [mockGrades[0].courseId]: true });
          }
          
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching grades:', err);
        setIsLoading(false);
      }
    };
    
    fetchGrades();
  }, []);
  
  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };
  
  // Get color class based on grade
  const getGradeColorClass = (grade: number | null): string => {
    if (grade === null) return 'text-gray-500';
    if (grade >= 90) return 'text-success-600';
    if (grade >= 80) return 'text-primary-600';
    if (grade >= 70) return 'text-warning-600';
    return 'text-danger-600';
  };
  
  // Get letter grade
  const getLetterGrade = (grade: number | null): string => {
    if (grade === null) return 'N/A';
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
        <p className="mt-1 text-gray-600">View your academic performance across all courses</p>
      </div>
      
      {/* Overall performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <AcademicCapIcon className="h-10 w-10 text-primary-600 mr-4" />
            <div>
              <h2 className="text-sm font-medium text-gray-600">Overall GPA</h2>
              <div className="mt-1 flex items-baseline">
                <p className="text-3xl font-semibold text-primary-600">{overallGPA || 'N/A'}</p>
                <p className="ml-2 text-sm text-gray-500">/ 4.0</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BookOpenIcon className="h-10 w-10 text-accent-600 mr-4" />
            <div>
              <h2 className="text-sm font-medium text-gray-600">Courses Enrolled</h2>
              <div className="mt-1 flex items-baseline">
                <p className="text-3xl font-semibold text-accent-600">{grades.length}</p>
                <p className="ml-2 text-sm text-gray-500">
                  ({grades.filter(g => g.status === 'completed').length} completed)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-10 w-10 text-success-600 mr-4" />
            <div>
              <h2 className="text-sm font-medium text-gray-600">Assignments Graded</h2>
              <div className="mt-1 flex items-baseline">
                <p className="text-3xl font-semibold text-success-600">
                  {grades.reduce((acc, course) => 
                    acc + course.assignments.filter(a => a.grade !== null).length, 0)}
                </p>
                <p className="ml-2 text-sm text-gray-500">/ {grades.reduce((acc, course) => 
                  acc + course.assignments.length, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course grades list */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
              Course Grades
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detailed breakdown of your grades for each course
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {grades.map((course) => (
              <div key={course.courseId} className="overflow-hidden">
                {/* Course header */}
                <button
                  onClick={() => toggleCourse(course.courseId)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    {course.status === 'completed' ? (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-success-100 flex items-center justify-center">
                        <AcademicCapIcon className="h-5 w-5 text-success-600" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <BookOpenIcon className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                    
                    <div className="ml-4 text-left">
                      <h4 className="text-lg font-medium text-gray-900">{course.courseName}</h4>
                      <p className="text-sm text-gray-500">
                        {course.status === 'completed' ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="text-right mr-6">
                      <p className={`text-2xl font-bold ${getGradeColorClass(course.grade)}`}>
                        {course.grade !== null ? `${course.grade}%` : 'In Progress'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {course.grade !== null ? getLetterGrade(course.grade) : ''}
                      </p>
                    </div>
                    
                    <svg
                      className={`h-5 w-5 text-gray-400 transform transition-transform ${
                        expandedCourses[course.courseId] ? 'rotate-180' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
                
                {/* Assignment details */}
                {expandedCourses[course.courseId] && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assignment
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Due Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Weight
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Grade
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {course.assignments.map((assignment) => (
                            <tr key={assignment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link 
                                  to={`/dashboard/student/assignments/${assignment.id}`}
                                  className="text-sm font-medium text-primary-600 hover:text-primary-800"
                                >
                                  {assignment.title}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {Math.round(assignment.weight * 100)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {assignment.grade !== null ? (
                                  <div className="flex items-center">
                                    <span className={`text-sm font-medium ${getGradeColorClass(assignment.grade)}`}>
                                      {assignment.grade}%
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({getLetterGrade(assignment.grade)})
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link 
                        to={`/dashboard/student/courses/${course.courseId}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center"
                      >
                        <span>Go to course</span>
                        <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Performance trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-primary-600" />
            Performance Trend
          </h3>
        </div>
        
        {/* In a real app, this would be a chart component showing grade trends over time */}
        <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Grade performance chart would appear here</p>
        </div>
      </div>
    </div>
  );
};

export default StudentGradesPage;