import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../hooks/useCourses';
import { useEnrollments } from '../hooks/useEnrollments';
import { useAppSelector } from '../redux/hooks';
import CourseEnrollment from '../components/course/CourseEnrollment';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { 
  BookOpenIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  PlayIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const { data: courseData, loading, error, refetch } = useCourse(id!);
  const { data: enrollmentsData } = useEnrollments({ userId: user?.id, courseId: id });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (enrollmentsData?.enrollments) {
      const enrollment = enrollmentsData.enrollments.find(e => e.courseId === id);
      setIsEnrolled(!!enrollment);
    }
  }, [enrollmentsData, id]);

  const handleEnrollmentChange = () => {
    setIsEnrolled(true);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message={error || "An unexpected error occurred."} />
    );
  }

  if (!courseData?.course) {
    return (
      <Alert type="error" message={error || "An unexpected error occurred."} />
    );
  }

  const course = courseData.course;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <div className="mb-8">
            {/* Breadcrumb */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a href="/courses" className="text-gray-500 hover:text-gray-700">
                    Courses
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-900">{course.title}</span>
                  </div>
                </li>
              </ol>
            </nav>

            {/* Course Image */}
            <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpenIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="space-y-4">
              <div>
                <span className="inline-block px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full mb-3">
                  {course.category?.name}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-xl text-gray-600 mt-2">{course.shortDescription}</p>
              </div>

              {/* Course Meta */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>
                    Instructor: {course.teacher?.firstName} {course.teacher?.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  <span>{course.studentCount || 0} students</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 mr-2 text-yellow-400" />
                  <span>{course.rating?.toFixed(1) || 'N/A'} ({course.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'curriculum', name: 'Curriculum' },
                { id: 'reviews', name: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this course</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Master the fundamentals',
                      'Build real-world projects',
                      'Best practices and industry standards',
                      'Advanced techniques and tips'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Basic computer skills</li>
                    <li>Internet connection</li>
                    <li>Willingness to learn</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Course Curriculum</h3>
                <div className="space-y-3">
                  {/* This would be populated from actual lecture data */}
                  {[1, 2, 3, 4, 5].map((section) => (
                    <div key={section} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h4 className="font-medium text-gray-900">
                          Section {section}: Introduction to Concepts
                        </h4>
                        <p className="text-sm text-gray-600">3 lectures • 45 minutes</p>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {[1, 2, 3].map((lecture) => (
                          <div key={lecture} className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center">
                              <PlayIcon className="h-4 w-4 text-gray-400 mr-3" />
                              <span className="text-sm text-gray-900">
                                Lecture {lecture}: Understanding the Basics
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">15:30</span>
                              {lecture === 1 && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  Preview
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Student Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-5 w-5 ${
                            star <= (course.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {course.rating?.toFixed(1)} out of 5
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Mock reviews - would be populated from actual review data */}
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">John Doe</h4>
                          <div className="flex items-center mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">2 days ago</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Excellent course! The instructor explains everything clearly and the 
                        examples are very practical. I learned a lot and would definitely recommend 
                        this to anyone looking to improve their skills.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CourseEnrollment
              course={course}
              isEnrolled={isEnrolled}
              onEnrollmentChange={handleEnrollmentChange}
            />

            {/* Course Info */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Course Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{course.duration || 'Self-paced'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium capitalize">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">English</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-medium">{course.studentCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            {course.teacher && (
              <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Instructor</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {course.teacher.profilePicture ? (
                      <img
                        src={course.teacher.profilePicture}
                        alt={`${course.teacher.firstName} ${course.teacher.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {course.teacher.firstName} {course.teacher.lastName}
                    </h5>
                    <p className="text-sm text-gray-600">Course Instructor</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;