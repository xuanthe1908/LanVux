import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePaymentOperations } from '../hooks/usePayments';
import { useAppDispatch } from '../redux/hooks';
import { enrollInCourse } from '../redux/slices/enrollmentSlice';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { handleVNPayReturn } = usePaymentOperations();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Convert URLSearchParams to object
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        const result = await handleVNPayReturn(params);
        
        if (result.status === 'success' && result.data.paymentStatus === 'success') {
          setStatus('success');
          setPaymentDetails(result.data);
          
          // Auto-enroll user in the course
          if (result.data.courseId) {
            await dispatch(enrollInCourse(result.data.courseId));
          }
        } else {
          setStatus('failed');
          setError(result.data.message || 'Payment failed');
        }
      } catch (err: any) {
        setStatus('failed');
        setError(err.message || 'An error occurred while processing your payment');
      }
    };

    processPayment();
  }, [searchParams, handleVNPayReturn, dispatch]);

  const handleContinue = () => {
    if (status === 'success' && paymentDetails?.courseId) {
      navigate(`/courses/${paymentDetails.courseId}`);
    } else {
      navigate('/dashboard/student/courses');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <Spinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. You have been successfully enrolled in the course.
            </p>
            
            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-medium text-gray-900 mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{paymentDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>${paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{paymentDetails.paymentMethod}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowRightIcon className="h-5 w-5" />
              Start Learning
            </Button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'We couldn\'t process your payment. Please try again.'}
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate('/dashboard/student/courses')}
                className="w-full"
              >
                Back to Courses
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentReturnPage;
