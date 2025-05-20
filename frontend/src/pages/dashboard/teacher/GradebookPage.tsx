// src/pages/dashboard/teacher/GradebookPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
  CloudArrowDownIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

interface StudentGrade {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  assignments: {
    [key: string]: {
      score: number | null;
      outOf: number;
      submitted: boolean;
      late: boolean;
    }
  };
  finalGrade: number | null;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  totalPoints: number;
  weight: number;
}

const GradebookPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('c1');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  // Fetch gradebook data
  useEffect(() => {
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      // Courses data
      setCourses([
        { id: 'c1', title: 'React Fundamentals' },
        { id: 'c2', title: 'Node.js Backend Development' },
        { id: 'c3', title: 'JavaScript Masterclass' }
      ]);
      
      // Assignments data
      setAssignments([
        { id: 'a1', title: 'React Components', dueDate: '2025-05-10', totalPoints: 100, weight: 15 },
        { id: 'a2', title: 'React Hooks Quiz', dueDate: '2025-05-15', totalPoints: 50, weight: 10 },
        { id: 'a3', title: 'React Project', dueDate: '2025-05-25', totalPoints: 150, weight: 25 },
        { id: 'a4', title: 'Midterm Exam', dueDate: '2025-05-20', totalPoints: 100, weight: 20 }
      ]);
      
      // Student grades data
      setStudentGrades([
        {
          studentId: 's1',
          firstName: 'Alex',
          lastName: 'Johnson',
          email: 'alex@example.com',
          assignments: {
            'a1': { score: 92, outOf: 100, submitted: true, late: false },
            'a2': { score: 45, outOf: 50, submitted: true, late: false },
            'a3': { score: null, outOf: 150, submitted: false, late: false },
            'a4': { score: 85, outOf: 100, submitted: true, late: false }
          },
          finalGrade: 89
        },
        {
          studentId: 's2',
          firstName: 'Sarah',
          lastName: 'Williams',
          email: 'sarah@example.com',
          assignments: {
            'a1': { score: 78, outOf: 100, submitted: true, late: false },
            'a2': { score: 42, outOf: 50, submitted: true, late: false },
            'a3': { score: null, outOf: 150, submitted: false, late: false },
            'a4': { score: 92, outOf: 100, submitted: true, late: false }
          },
          finalGrade: 85
        },
        {
          studentId: 's3',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael@example.com',
          assignments: {
            'a1': { score: 95, outOf: 100, submitted: true, late: false },
            'a2': { score: 48, outOf: 50, submitted: true, late: false },
            'a3': { score: null, outOf: 150, submitted: false, late: false },
            'a4': { score: 90, outOf: 100, submitted: true, late: false }
          },
          finalGrade: 92
        },
        {
          studentId: 's4',
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily@example.com',
          assignments: {
            'a1': { score: 85, outOf: 100, submitted: true, late: true },
            'a2': { score: 38, outOf: 50, submitted: true, late: false },
            'a3': { score: null, outOf: 150, submitted: false, late: false },
            'a4': { score: 78, outOf: 100, submitted: true, late: false }
          },
          finalGrade: 80
        },
        {
          studentId: 's5',
          firstName: 'David',
          lastName: 'Miller',
          email: 'david@example.com',
          assignments: {
            'a1': { score: 88, outOf: 100, submitted: true, late: false },
            'a2': { score: 44, outOf: 50, submitted: true, late: false },
            'a3': { score: null, outOf: 150, submitted: false, late: false },
            'a4': { score: 82, outOf: 100, submitted: true, late: false }
          },
          finalGrade: 86
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, [selectedCourse]);

  // Sort students
  const sortedStudents = [...studentGrades].sort((a, b) => {
    if (sortField === 'name') {
      const nameA = `${a.lastName}, ${a.firstName}`;
      const nameB = `${b.lastName}, ${b.firstName}`;
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    } else if (sortField === 'finalGrade') {
      const gradeA = a.finalGrade || 0;
      const gradeB = b.finalGrade || 0;
      return sortDirection === 'asc' 
        ? gradeA - gradeB 
        : gradeB - gradeA;
    } else {
      // Sort by a specific assignment score
      const assignmentIdMatch = sortField.match(/assignment_(.*)/);
      if (assignmentIdMatch) {
        const assignmentId = assignmentIdMatch[1];
        const scoreA = a.assignments[assignmentId]?.score || 0;
        const scoreB = b.assignments[assignmentId]?.score || 0;
        return sortDirection === 'asc' 
          ? scoreA - scoreB 
          : scoreB - scoreA;
      }
      return 0;
    }
  });

  // Format percentage
  const formatPercentage = (score: number | null, outOf: number): string => {
    if (score === null) return '-';
    const percentage = (score / outOf) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  // Get grade color based on percentage
  const getGradeColor = (score: number | null, outOf: number): string => {
    if (score === null) return 'text-gray-400';
    
    const percentage = (score / outOf) * 100;
    if (percentage >= 90) return 'text-success-600';
    if (percentage >= 80) return 'text-success-500';
    if (percentage >= 70) return 'text-warning-500';
    if (percentage >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  // Toggle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4 text-primary-600" />
      : <ArrowDownIcon className="h-4 w-4 text-primary-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gradebook</h1>
          
          <div className="flex mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              leftIcon={<CloudArrowDownIcon className="h-4 w-4" />}
              className="mr-2"
            >
              Export Grades
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="w-full sm:w-64">
            <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Course
            </label>
            <Select
              id="course-select"
              options={courses.map(course => ({ value: course.id, label: course.title }))}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left">
                    <button
                      className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                      onClick={() => handleSort('name')}
                    >
                      Student
                      <span className="ml-1 flex-none rounded text-gray-400">
                        {renderSortIcon('name')}
                      </span>
                    </button>
                  </th>
                  
                  {assignments.map((assignment) => (
                    <th key={assignment.id} scope="col" className="px-6 py-3 text-center">
                      <button
                        className="group inline-flex flex-col items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                        onClick={() => handleSort(`assignment_${assignment.id}`)}
                      >
                        <div className="flex items-center mb-1">
                          {assignment.title}
                          <span className="ml-1 flex-none rounded text-gray-400">
                            {renderSortIcon(`assignment_${assignment.id}`)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 normal-case font-normal">
                          {new Date(assignment.dueDate).toLocaleDateString()} • {assignment.totalPoints} pts
                        </div>
                      </button>
                    </th>
                  ))}
                  
                  <th scope="col" className="px-6 py-3 text-center">
                    <button
                      className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                      onClick={() => handleSort('finalGrade')}
                    >
                      Final Grade
                      <span className="ml-1 flex-none rounded text-gray-400">
                        {renderSortIcon('finalGrade')}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.map((student) => (
                  <tr key={student.studentId}>
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                          {student.firstName.charAt(0) + student.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link 
                              to={`/dashboard/teacher/students/${student.studentId}`}
                              className="hover:text-primary-600"
                            >
                              {student.lastName}, {student.firstName}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    {assignments.map((assignment) => {
                      const grade = student.assignments[assignment.id];
                      return (
                        <td key={`${student.studentId}_${assignment.id}`} className="px-6 py-4 whitespace-nowrap text-center">
                          {grade ? (
                            <div>
                              {grade.submitted ? (
                                <div>
                                  <div className={`font-medium ${getGradeColor(grade.score, grade.outOf)}`}>
                                    {grade.score !== null ? `${grade.score}/${grade.outOf}` : '-'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatPercentage(grade.score, grade.outOf)}
                                    {grade.late && <span className="ml-1 text-warning-600">(Late)</span>}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">Not submitted</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-sm font-medium ${getGradeColor(student.finalGrade, 100)}`}>
                        {student.finalGrade !== null ? `${student.finalGrade}%` : '-'}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {sortedStudents.length === 0 && (
                  <tr>
                    <td colSpan={assignments.length + 2} className="px-6 py-4 text-center text-gray-500">
                      No student grades found for this course.
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

export default GradebookPage;