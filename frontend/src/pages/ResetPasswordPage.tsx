// src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import authService from '../services/authService';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });
  
  // For password confirmation validation
  const password = watch("password");

  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setTokenLoading(true);
        // In a real application, this would call an API endpoint
        // For now, we'll simulate token verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, consider token valid if it's at least 10 chars
        const isValid = typeof token === 'string' && token.length >= 10;
        
        // Uncomment this when you implement the actual API call
        // const isValid = await authService.verifyResetToken(token);
        
        setTokenValid(isValid);
      } catch (err) {
        setTokenValid(false);
        setError('Invalid or expired password reset token.');
      } finally {
        setTokenLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setTokenLoading(false);
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real application, this would call an API endpoint
      // For now, we'll simulate a successful password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Uncomment this when you implement the actual API call
      // await authService.resetPassword(token, data.password);
      
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <img
            className="h-12 w-auto"
            src="/logo.svg"
            alt="E-Learning Platform Logo"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {tokenLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : !tokenValid ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Invalid or expired link</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      The password reset link is invalid or has expired. Please request a new password reset link.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <Link 
                        to="/forgot-password" 
                        className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100"
                      >
                        Request a new link
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Password reset successful</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your password has been reset successfully. You will be redirected to the login page in a few seconds.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <Link 
                        to="/login" 
                        className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100"
                      >
                        Go to login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Show error if any */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                  <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`block w-full pl-10 pr-10 py-2 sm:text-sm border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                          message: 'Password must include uppercase, lowercase, number and special character'
                        }
                      })}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password ? (
                    <p className="mt-2 text-sm text-red-600" id="password-error">
                      {errors.password.message}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">
                      Password must be at least 6 characters and include uppercase, lowercase, number and special character
                    </p>
                  )}
                </div>

                {/* Confirm Password field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`block w-full pl-10 pr-10 py-2 sm:text-sm border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600" id="confirmPassword-error">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                  >
                    Reset password
                  </Button>
                </div>
              </form>

              <div className="mt-6">
                <div className="text-center">
                  <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                    Back to login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;