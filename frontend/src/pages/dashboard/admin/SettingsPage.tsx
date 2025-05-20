// src/pages/dashboard/admin/SettingsPage.tsx
import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const SettingsPage: React.FC = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'E-Learning Platform',
    siteDescription: 'Quality education at your fingertips, anytime, anywhere.',
    supportEmail: 'support@e-learning.com',
    maintenanceMode: false
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.mailserver.com',
    smtpPort: '587',
    smtpUsername: 'notifications@e-learning.com',
    smtpPassword: '••••••••••••',
    senderName: 'E-Learning Support',
    senderEmail: 'notifications@e-learning.com'
  });

  const [paymentSettings, setPaymentSettings] = useState({
    currencyCode: 'USD',
    stripeEnabled: true,
    paypalEnabled: true,
    stripePublicKey: 'pk_test_••••••••••••••••••••••••',
    stripeSecretKey: 'sk_test_••••••••••••••••••••••••',
    paypalClientId: '••••••••••••••••••••••••'
  });

  // Handle form submissions
  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally save the settings to your backend
    alert('General settings saved successfully');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally save the settings to your backend
    alert('Email settings saved successfully');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally save the settings to your backend
    alert('Payment settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h1>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className="whitespace-nowrap py-4 px-1 border-b-2 border-primary-500 font-medium text-sm text-primary-600"
            >
              General
            </button>
            <button
              className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Email
            </button>
            <button
              className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Payment
            </button>
            <button
              className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Appearance
            </button>
            <button
              className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Integrations
            </button>
          </nav>
        </div>
        
        {/* General Settings Form */}
        <form onSubmit={handleGeneralSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={generalSettings.siteName}
              onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Site Description</label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={generalSettings.siteDescription}
              onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Support Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={generalSettings.supportEmail}
              onChange={(e) => setGeneralSettings({...generalSettings, supportEmail: e.target.value})}
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="maintenance-mode"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              checked={generalSettings.maintenanceMode}
              onChange={(e) => setGeneralSettings({...generalSettings, maintenanceMode: e.target.checked})}
            />
            <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-900">
              Enable Maintenance Mode
            </label>
          </div>
          
          <div className="pt-5">
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                Save Settings
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Other setting sections would go here but are not shown in the current tab */}
      
      {/* System Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Software Version</h3>
            <p className="mt-1 text-sm text-gray-900">E-Learning Platform v1.5.2</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Server Environment</h3>
            <p className="mt-1 text-sm text-gray-900">Production</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">PHP Version</h3>
            <p className="mt-1 text-sm text-gray-900">8.1.12</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Database Version</h3>
            <p className="mt-1 text-sm text-gray-900">MySQL 8.0.28</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last System Update</h3>
            <p className="mt-1 text-sm text-gray-900">May 10, 2025</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Server Time</h3>
            <p className="mt-1 text-sm text-gray-900">May 20, 2025 15:30:45 UTC</p>
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="outline">
            Check for Updates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;