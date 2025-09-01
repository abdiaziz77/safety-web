import React, { useEffect, useState } from 'react';
import { 
  FiUser, FiEdit, FiCheck, FiX, FiCamera, 
  FiMail, FiPhone, FiMapPin, FiAlertTriangle, 
  FiCalendar, FiLock, FiEye, FiEyeOff 
} from 'react-icons/fi';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [userData, setUserData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    dateOfBirth: '',
    gender: 'Male',
    emergencyContact: '',
    profilePhoto: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState({
    profile: false,
    password: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [originalData, setOriginalData] = useState(null);
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          'http://127.0.0.1:5000/api/auth/get_current_user',
          { 
            withCredentials: true
          }
        );

        const data = userResponse.data.user;
        if (!data) throw new Error('No user data received');

        const formattedData = {
          id: data.id,
          firstName: data.firstName || data.first_name || '',
          lastName: data.lastName || data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          addressLine1: data.addressLine1 || data.address_line_1 || '',
          addressLine2: data.addressLine2 || data.address_line_2 || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || data.zip_code || '',
          country: data.country || '',
          dateOfBirth: data.dateOfBirth || data.date_of_birth || '',
          gender: data.gender || 'Male',
          emergencyContact: data.emergencyContact || '',
          profilePhoto: data.profilePhoto || ''
        };

        setUserData(formattedData);
        setOriginalData(formattedData);
        setPhotoPreview(data.profilePhoto || '');
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Only JPG, PNG or GIF images are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        'http://127.0.0.1:5000/api/auth/profile',
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          addressLine1: userData.addressLine1,
          addressLine2: userData.addressLine2,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode,
          country: userData.country,
          emergencyContact: userData.emergencyContact
        },
        {
          withCredentials: true
        }
      );

      setSuccess('Profile updated successfully!');
      setEditMode({ ...editMode, profile: false });
      setOriginalData(userData);
      
      // Update user cookie if name changed
      const userCookie = Cookies.get('user');
      if (userCookie) {
        const updatedUser = {
          ...JSON.parse(userCookie),
          firstName: userData.firstName,
          lastName: userData.lastName
        };
        Cookies.set('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          withCredentials: true // This sends the session cookie
        }
      );

      setSuccess('Password updated successfully!');
      setEditMode({ ...editMode, password: false });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Password update error:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = (section) => {
    setEditMode({ ...editMode, [section]: false });
    setError('');
    setSuccess('');
    if (section === 'profile' && originalData) {
      setUserData(originalData);
      setPhotoPreview(originalData.profilePhoto || '');
    }
    if (section === 'password') {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !editMode.profile && !editMode.password) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your profile information and security settings
          </p>
        </div>

        {/* Success and error messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheck className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Profile Section */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profile Information
              </h3>
              {!editMode.profile ? (
                <button
                  type="button"
                  onClick={() => setEditMode({ ...editMode, profile: true })}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiEdit className="mr-1" /> Edit
                </button>
              ) : null}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Personal details and contact information
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={updateProfile}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Profile Photo */}
                <div className="sm:col-span-6 flex items-center">
                  <div className="relative">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    {editMode.profile && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition">
                        <FiCamera className="text-white h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                  {editMode.profile && (
                    <p className="ml-4 text-sm text-gray-500">
                      Click on the camera icon to change your profile photo
                    </p>
                  )}
                </div>

                {/* First Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={userData.firstName}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full rounded-md shadow-sm ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={userData.lastName}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full rounded-md shadow-sm ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={userData.email}
                      disabled // Email shouldn't be editable in this form
                      className="block w-full pl-10 rounded-md border-transparent bg-gray-50 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="sm:col-span-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={userData.phone}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full pl-10 rounded-md ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="sm:col-span-2">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={userData.dateOfBirth}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full pl-10 rounded-md ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* Address Line 1 */}
                <div className="sm:col-span-6">
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                    Address Line 1
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="addressLine1"
                      id="addressLine1"
                      value={userData.addressLine1}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full pl-10 rounded-md ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* Address Line 2 */}
                <div className="sm:col-span-6">
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                    Address Line 2
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="addressLine2"
                      id="addressLine2"
                      value={userData.addressLine2}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full rounded-md shadow-sm ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* City */}
                <div className="sm:col-span-3">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={userData.city}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full rounded-md shadow-sm ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* State */}
                <div className="sm:col-span-3">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State/Province
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="state"
                      id="state"
                      value={userData.state}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full rounded-md shadow-sm ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* Zip Code */}
                <div className="sm:col-span-2">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP/Postal Code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="zipCode"
                      id="zipCode"
                      value={userData.zipCode}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full rounded-md shadow-sm ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="sm:col-span-2">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="country"
                      id="country"
                      value={userData.country}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full rounded-md shadow-sm ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="sm:col-span-4">
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                    Emergency Contact
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiAlertTriangle className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="emergencyContact"
                      id="emergencyContact"
                      value={userData.emergencyContact}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full pl-10 rounded-md ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="sm:col-span-2">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <div className="mt-1">
                    <select
                      id="gender"
                      name="gender"
                      value={userData.gender}
                      onChange={handleUserDataChange}
                      disabled={!editMode.profile}
                      className={`block w-full rounded-md shadow-sm ${editMode.profile ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-transparent bg-gray-50'} sm:text-sm`}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                {editMode.profile && (
                  <div className="sm:col-span-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => cancelEdit('profile')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">↻</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheck className="mr-2" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Password & Security
              </h3>
              {!editMode.password ? (
                <button
                  type="button"
                  onClick={() => setEditMode({ ...editMode, password: true })}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiEdit className="mr-1" /> Change
                </button>
              ) : null}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Update your password and security settings
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {editMode.password ? (
              <form onSubmit={updatePassword}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Current Password */}
                  <div className="sm:col-span-6">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="currentPassword"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          {showPassword.current ? (
                            <FiEyeOff className="h-5 w-5" />
                          ) : (
                            <FiEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="sm:col-span-6">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                        minLength="8"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          {showPassword.new ? (
                            <FiEyeOff className="h-5 w-5" />
                          ) : (
                            <FiEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Must be at least 8 characters
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="sm:col-span-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          {showPassword.confirm ? (
                            <FiEyeOff className="h-5 w-5" />
                          ) : (
                            <FiEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="sm:col-span-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => cancelEdit('password')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">↻</span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiCheck className="mr-2" /> Update Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiLock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Password last changed: 3 months ago</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditMode({ ...editMode, password: true })}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;