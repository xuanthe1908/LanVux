// src/pages/dashboard/student/SettingsPage.tsx (continued)
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  BellIcon, 
  AcademicCapIcon,
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  profileImage: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  assignmentReminders: boolean;
  courseAnnouncements: boolean;
  messages: boolean;
  marketingEmails: boolean;
}

interface PrivacySettings {
  showProfile: boolean;
  showCourses: boolean;
  showProgress: boolean;
}

const StudentSettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'privacy'>('profile');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileSettings>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    assignmentReminders: true,
    courseAnnouncements: true,
    messages: true,
    marketingEmails: false
  });
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showProfile: true,
    showCourses: true,
    showProgress: false
  });
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  
  useEffect(() => {
    // In a real app, this would fetch user settings from an API
    // For now, we'll just pre-populate with mock data
    if (user) {
      setProfileForm({
        firstName: user.firstName || 'John',
        lastName: user.lastName || 'Doe',
        email: user.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Computer science student with a passion for web development and data science. Currently learning React and Node.js.',
        profileImage: '/images/user-avatar.jpg'
      });
    }
  }, [user]);
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle notification settings changes
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle privacy settings changes
  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      // In a real app, this would be an API call to update the profile
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update successful
      setSuccessMessage('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }
    
    try {
      setIsLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      // In a real app, this would be an API call to update the password
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update successful
      setSuccessMessage('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error updating password:', err);
      setErrorMessage('Failed to update password. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle notification settings submission
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      // In a real app, this would be an API call to update notification settings
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update successful
      setSuccessMessage('Notification settings updated successfully!');
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setErrorMessage('Failed to update notification settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle privacy settings submission
  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      // In a real app, this would be an API call to update privacy settings
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update successful
      setSuccessMessage('Privacy settings updated successfully!');
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setErrorMessage('Failed to update privacy settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to upload a profile image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, this would upload the image to a server
    // For now, we'll just use a local URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileForm(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      {/* Settings container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="sm:flex">
          {/* Navigation sidebar */}
          <div className="sm:w-64 bg-gray-50 p-6 border-r border-gray-200">
            <nav className="space-y-1">
              <button
                className={`flex items-center px-3 py-2 w-full text-sm font-medium rounded-md ${
                  activeTab === 'profile' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <UserCircleIcon className="h-5 w-5 mr-3" />
                Profile
              </button>
              <button
                className={`flex items-center px-3 py-2 w-full text-sm font-medium rounded-md ${
                  activeTab === 'password' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('password')}
              >
                <LockClosedIcon className="h-5 w-5 mr-3" />
                Password
              </button>
              <button
                className={`flex items-center px-3 py-2 w-full text-sm font-medium rounded-md ${
                  activeTab === 'notifications' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <BellIcon className="h-5 w-5 mr-3" />
                Notifications
              </button>
              <button
                className={`flex items-center px-3 py-2 w-full text-sm font-medium rounded-md ${
                  activeTab === 'privacy' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('privacy')}
              >
                <AcademicCapIcon className="h-5 w-5 mr-3" />
                Privacy
              </button>
            </nav>
          </div>
          
          {/* Content area */}
          <div className="p-6 sm:flex-1">
            {/* Success/error messages */}
            {successMessage && (
              <div className="mb-4">
                <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-4">
                <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
              </div>
            )}
            
            {/* Profile settings */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                  {!isEditingProfile ? (
                    <Button 
                      variant="outline" 
                      leftIcon={<PencilIcon className="h-5 w-5" />}
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        leftIcon={<XMarkIcon className="h-5 w-5" />}
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        leftIcon={<CheckIcon className="h-5 w-5" />}
                        onClick={handleProfileSubmit}
                        isLoading={isLoading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row mb-6">
                  <div className="sm:w-1/3 mb-4 sm:mb-0 flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-3">
                      {profileForm.profileImage ? (
                        <img 
                          src={profileForm.profileImage} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      
                      {isEditingProfile && (
                        <div className="absolute bottom-0 right-0">
                          <label 
                            htmlFor="profile-image" 
                            className="cursor-pointer bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
                          >
                            <PencilIcon className="h-5 w-5 text-gray-600" />
                            <input
                              type="file"
                              id="profile-image"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-gray-900">
                      {profileForm.firstName} {profileForm.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">Student</p>
                  </div>
                  
                  <div className="sm:w-2/3">
                    <form onSubmit={handleProfileSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className="form-input rounded-md w-full"
                            value={profileForm.firstName}
                            onChange={handleProfileChange}
                            disabled={!isEditingProfile}
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className="form-input rounded-md w-full"
                            value={profileForm.lastName}
                            onChange={handleProfileChange}
                            disabled={!isEditingProfile}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input rounded-md w-full"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            disabled={!isEditingProfile}
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="form-input rounded-md w-full"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            disabled={!isEditingProfile}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          className="form-input rounded-md w-full"
                          value={profileForm.bio}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                        ></textarea>
                        <p className="mt-1 text-xs text-gray-500">
                          A brief description about yourself.
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
            {/* Password settings */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                
                <form onSubmit={handlePasswordSubmit} className="max-w-md">
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className="form-input rounded-md w-full"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="form-input rounded-md w-full"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters long.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input rounded-md w-full"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                  >
                    Update Password
                  </Button>
                </form>
              </div>
            )}
            
            {/* Notification settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                
                <form onSubmit={handleNotificationSubmit}>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="emailNotifications"
                          name="emailNotifications"
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                          Email Notifications
                        </label>
                        <p className="text-gray-500">
                          Receive notifications via email.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="assignmentReminders"
                          name="assignmentReminders"
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={notificationSettings.assignmentReminders}
                          onChange={handleNotificationChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="assignmentReminders" className="font-medium text-gray-700">
                          Assignment Reminders
                        </label>
                        <p className="text-gray-500">
                          Receive reminders about upcoming assignments and deadlines.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="courseAnnouncements"
                          name="courseAnnouncements"
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={notificationSettings.courseAnnouncements}
                          onChange={handleNotificationChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="courseAnnouncements" className="font-medium text-gray-700">
                          Course Announcements
                        </label>
                        <p className="text-gray-500">
                          Receive notifications about course announcements and updates.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="messages"
                          name="messages"
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={notificationSettings.messages}
                          onChange={handleNotificationChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="messages" className="font-medium text-gray-700">
                          Messages
                        </label>
                        <p className="text-gray-500">
                          Receive notifications about new messages from instructors and classmates.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="marketingEmails"
                          name="marketingEmails"
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={notificationSettings.marketingEmails}
                          onChange={handleNotificationChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="marketingEmails" className="font-medium text-gray-700">
                          Marketing Emails
                        </label>
                        <p className="text-gray-500">
                          Receive promotional emails about new courses and features.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                    >
                      Save Notification Settings
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Privacy settings */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                
                <form onSubmit={handlePrivacySubmit}>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="showProfile"
                          name="showProfile"
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={privacySettings.showProfile}
                          onChange={handlePrivacyChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="showProfile" className="font-medium text-gray-700">
                          Show Profile
                        </label>
                        <p className="text-gray-500">
                          Allow other students and instructors to view your profile information.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="showCourses"
                          name="showCourses"
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={privacySettings.showCourses}
                          onChange={handlePrivacyChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="showCourses" className="font-medium text-gray-700">
                          Show Enrolled Courses
                        </label>
                        <p className="text-gray-500">
                          Allow others to see which courses you are enrolled in.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="showProgress"
                          name="showProgress"
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={privacySettings.showProgress}
                          onChange={handlePrivacyChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="showProgress" className="font-medium text-gray-700">
                          Show Course Progress
                        </label>
                        <p className="text-gray-500">
                          Allow others to see your progress in courses.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                    >
                      Save Privacy Settings
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettingsPage;