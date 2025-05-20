import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import Button from '../../../components/ui/Button';
import { 
  UserCircleIcon, 
  KeyIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const TeacherSettingsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Render tabs
  const renderTabs = () => {
    const tabs = [
      { id: 'profile', label: 'Profile', icon: <UserCircleIcon className="h-5 w-5" /> },
      { id: 'password', label: 'Password', icon: <KeyIcon className="h-5 w-5" /> },
      { id: 'notifications', label: 'Notifications', icon: <BellIcon className="h-5 w-5" /> },
      { id: 'appearance', label: 'Appearance', icon: <Cog6ToothIcon className="h-5 w-5" /> }
    ];
    
    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-1 flex items-center whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                  : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };
  
  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
            <p className="text-gray-600 mb-2">
              This tab would contain forms for updating your profile information including:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li>Profile picture</li>
              <li>Personal information (name, contact info)</li>
              <li>Professional information (bio, specialization)</li>
              <li>Social media links</li>
            </ul>
            <div className="flex justify-end">
              <Button variant="primary">Save Changes</Button>
            </div>
          </div>
        );
      case 'password':
        return (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Password Settings</h3>
            <p className="text-gray-600 mb-4">
              This tab would contain forms for changing your password.
            </p>
            <div className="flex justify-end">
              <Button variant="primary">Change Password</Button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
            <p className="text-gray-600 mb-2">
              This tab would contain options to manage your notification preferences:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li>Email notifications</li>
              <li>Assignment submissions</li>
              <li>Course announcements</li>
              <li>Messages</li>
              <li>System updates</li>
            </ul>
            <div className="flex justify-end">
              <Button variant="primary">Save Preferences</Button>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance Settings</h3>
            <p className="text-gray-600 mb-2">
              This tab would contain options to customize your interface:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li>Theme (Light/Dark)</li>
              <li>Font size</li>
              <li>Language preferences</li>
            </ul>
            <div className="flex justify-end">
              <Button variant="primary">Save Settings</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      {renderTabs()}
      {renderTabContent()}
    </div>
  );
};

export default TeacherSettingsPage;