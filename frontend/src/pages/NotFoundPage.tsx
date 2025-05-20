// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ExclamationTriangleIcon, HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex justify-center">
            <ExclamationTriangleIcon className="h-20 w-20 text-warning-500" />
          </div>
          <h1 className="mt-6 text-5xl font-extrabold text-gray-900">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Page Not Found</h2>
          <p className="mt-4 text-lg text-gray-500">
            We're sorry, the page you requested could not be found.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            The page might have been moved, deleted, or it never existed. 
          </p>
          
          {/* Search form */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search for courses..."
              />
            </div>
          </div>
          
          {/* Navigation options */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center mt-6">
            <Link to="/">
              <Button variant="primary" leftIcon={<HomeIcon className="h-5 w-5" />}>
                Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
            >
              Go Back
            </Button>
          </div>
        </div>
        
        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-base text-gray-500">
            Looking for something specific? Check out some popular pages:
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/courses" className="text-primary-600 hover:text-primary-800 font-medium">
              All Courses
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/courses?category=web-development" className="text-primary-600 hover:text-primary-800 font-medium">
              Web Development
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/courses?category=data-science" className="text-primary-600 hover:text-primary-800 font-medium">
              Data Science
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/about" className="text-primary-600 hover:text-primary-800 font-medium">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;