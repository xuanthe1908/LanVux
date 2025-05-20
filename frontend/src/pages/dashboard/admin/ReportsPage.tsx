// src/pages/dashboard/admin/ReportsPage.tsx
import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('users');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="w-5 h-5 inline mr-2" />
              User Reports
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpenIcon className="w-5 h-5 inline mr-2" />
              Course Reports
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CurrencyDollarIcon className="w-5 h-5 inline mr-2" />
              Revenue Reports
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'engagement'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              Engagement Reports
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="py-4">
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                  <p className="text-3xl font-bold text-primary-600 mt-2">2,547</p>
                  <p className="text-sm text-gray-500 mt-1">+126 this month</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Active Users</h3>
                  <p className="text-3xl font-bold text-success-600 mt-2">1,892</p>
                  <p className="text-sm text-gray-500 mt-1">74.3% of total users</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">New Users</h3>
                  <p className="text-3xl font-bold text-accent-600 mt-2">126</p>
                  <p className="text-sm text-gray-500 mt-1">+15.2% from last month</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">User growth chart would be displayed here</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Total Courses</h3>
                  <p className="text-3xl font-bold text-primary-600 mt-2">87</p>
                  <p className="text-sm text-gray-500 mt-1">+5 this month</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Active Courses</h3>
                  <p className="text-3xl font-bold text-success-600 mt-2">76</p>
                  <p className="text-sm text-gray-500 mt-1">87.4% of total courses</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Average Rating</h3>
                  <p className="text-3xl font-bold text-accent-600 mt-2">4.6</p>
                  <p className="text-sm text-gray-500 mt-1">+0.2 from last month</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Courses</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">React Fundamentals</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">342</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4.8</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Python for Data Science</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">287</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4.7</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Node.js Backend Development</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">246</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4.6</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Total Revenue</h3>
                  <p className="text-3xl font-bold text-primary-600 mt-2">$154,875</p>
                  <p className="text-sm text-gray-500 mt-1">+15.2% from last month</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Monthly Revenue</h3>
                  <p className="text-3xl font-bold text-success-600 mt-2">$28,540</p>
                  <p className="text-sm text-gray-500 mt-1">+4.8% from last month</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Avg. Order Value</h3>
                  <p className="text-3xl font-bold text-accent-600 mt-2">$68.32</p>
                  <p className="text-sm text-gray-500 mt-1">+2.1% from last month</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Month</h3>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Revenue chart would be displayed here</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'engagement' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Completion Rate</h3>
                  <p className="text-3xl font-bold text-primary-600 mt-2">68.5%</p>
                  <p className="text-sm text-gray-500 mt-1">+2.3% from last month</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Avg. Session Time</h3>
                  <p className="text-3xl font-bold text-success-600 mt-2">42 min</p>
                  <p className="text-sm text-gray-500 mt-1">+5 min from last month</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Total Lessons Completed</h3>
                  <p className="text-3xl font-bold text-accent-600 mt-2">128,450</p>
                  <p className="text-sm text-gray-500 mt-1">+12.4% from last month</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Completion Rate by Category</h3>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Completion rate chart would be displayed here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;