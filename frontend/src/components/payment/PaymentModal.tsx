// frontend/src/components/payment/PaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { createPayment } from '../../redux/slices/paymentSlice';
import { usePaymentMethods } from '../../hooks/usePayments';
import { useCouponOperations } from '../../hooks/useCoupons';
import { Course } from '../../services/apiServices';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { 
  CreditCardIcon, 
  TagIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface PaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ course, isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { data: paymentMethodsData } = usePaymentMethods();
  const { validateCoupon, loading: couponLoading } = useCouponOperations();

  const [selectedMethod, setSelectedMethod] = useState('vnpay');
  const [couponCode, setCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [finalPrice, setFinalPrice] = useState(course.price);

  useEffect(() => {
    if (validatedCoupon) {
      const discount = validatedCoupon.discountType === 'percentage' 
        ? (course.price * validatedCoupon.discountValue / 100)
        : validatedCoupon.discountValue;
      setFinalPrice(Math.max(0, course.price - discount));
    } else {
      setFinalPrice(course.price);
    }
  }, [validatedCoupon, course.price]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setCouponError('');
      const result = await validateCoupon(couponCode, course.id);
      setValidatedCoupon(result.coupon);
    } catch (error: any) {
      setCouponError(error.message || 'Invalid coupon code');
      setValidatedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setValidatedCoupon(null);
    setCouponError('');
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      const paymentData = {
        courseId: course.id,
        paymentMethod: selectedMethod,
        returnUrl: `${window.location.origin}/payment/return`,
        couponCode: validatedCoupon ? couponCode : undefined
      };

      const result = await dispatch(createPayment(paymentData)).unwrap();
      
      // Redirect to payment gateway
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        // Handle direct payment success
        onSuccess();
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Complete Purchase</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Course Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{course.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{course.shortDescription}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Instructor:</span>
              <span className="text-sm font-medium">
                {course.teacher?.firstName} {course.teacher?.lastName}
              </span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Coupon Code (Optional)
            </label>
            {!validatedCoupon ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={handleValidateCoupon}
                  isLoading={couponLoading}
                  disabled={!couponCode.trim()}
                  size="sm"
                >
                  <TagIcon className="h-4 w-4 inline mr-1" />
                  Apply
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Coupon "{couponCode}" applied
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {couponError && (
              <div className="flex items-center space-x-2 text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="text-sm">{couponError}</span>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethodsData?.methods.filter(method => method.enabled).map((method) => (
                <label key={method.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <CreditCardIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between">
              <span className="text-gray-600">Original Price:</span>
              <span className="font-medium">${course.price.toFixed(2)}</span>
            </div>
            
            {validatedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({validatedCoupon.discountType === 'percentage' ? `${validatedCoupon.discountValue}%` : `${validatedCoupon.discountValue}`}):</span>
                <span>-${(course.price - finalPrice).toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-semibold border-t pt-3">
              <span>Total:</span>
              <span>${finalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            isLoading={processing}
            disabled={processing || finalPrice < 0}
            className="w-full"
            size="lg"
          >
            {finalPrice === 0 ? 'Enroll for Free' : `Pay ${finalPrice.toFixed(2)}`}
          </Button>

          {/* Security Notice */}
          <p className="text-xs text-gray-500 text-center">
            Your payment information is secure and encrypted. 
            You will be redirected to our payment partner to complete the transaction.
          </p>
        </div>
      </div>
    </div>
  );
};
export default PaymentModal;