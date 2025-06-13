import React, { useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { useEnrollmentOperations } from '../../hooks/useEnrollments';
import { Course } from '../../services/apiServices';
import PaymentModal from '../payment/PaymentModal';
import Button from '../ui/Button';
import { 
  CurrencyDollarIcon, 
  AcademicCapIcon,
  LockClosedIcon 
} from '@heroicons/react/24/outline';

interface CourseEnrollmentProps {
  course: Course;
  isEnrolled?: boolean;
  onEnrollmentChange?: () => void;
}

const CourseEnrollment: React.FC<CourseEnrollmentProps> = ({ 
  course, 
  isEnrolled = false, 
  onEnrollmentChange 
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { enrollInCourse, loading } = useEnrollmentOperations();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (course.price === 0) {
      // Free course - direct enrollment
      try {
        await enrollInCourse(course.id);
        onEnrollmentChange?.();
      } catch (error) {
        console.error('Enrollment failed:', error);
      }
    } else {
      // Paid course - show payment modal
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onEnrollmentChange?.();
  };

  // If user is the instructor
  if (user?.id === course.teacherId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <AcademicCapIcon className="h-5 w-5" />
          <span className="font-medium">You are the instructor of this course</span>
        </div>
      </div>
    );
  }

  // If already enrolled
  if (isEnrolled) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-green-800">
            <AcademicCapIcon className="h-5 w-5" />
            <span className="font-medium">You are enrolled in this course</span>
          </div>
          <Button
            onClick={() => window.location.href = `/courses/${course.id}/learn`}
            size="sm"
          >
            Continue Learning
          </Button>
        </div>
      </div>
    );
  }

  // Course not published
  if (course.status !== 'published') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <LockClosedIcon className="h-5 w-5" />
          <span className="font-medium">This course is not available for enrollment</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {course.price === 0 ? 'Free' : `${course.price}`}
            </span>
          </div>
          {course.price > 0 && (
            <span className="text-sm text-gray-600">One-time payment</span>
          )}
        </div>

        <Button
          onClick={handleEnrollment}
          isLoading={loading}
          disabled={loading}
          className="w-full mb-4"
          size="lg"
        >
          {course.price === 0 ? 'Enroll for Free' : 'Buy Now'}
        </Button>

        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-center justify-between">
            <span>Full lifetime access</span>
            <span>✓</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Access on mobile and desktop</span>
            <span>✓</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Certificate of completion</span>
            <span>✓</span>
          </div>
          {course.price > 0 && (
            <div className="flex items-center justify-between">
              <span>30-day money-back guarantee</span>
              <span>✓</span>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        course={course}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default CourseEnrollment;