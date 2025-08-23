import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';


const AdminSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'admin',
    department: '',
    adminNotifications: true,
    manageUsers: false,
  });

  useEffect(() => {
    if (user && user.id) {
      fetch(`http://localhost:5000/api/admins/${user.id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error("Admin not found");
          }
          return res.json();
        })
        .then(data => {
          setFormData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'admin',
            department: data.department || '',
            adminNotifications: data.admin_notifications ?? true,
            manageUsers: data.manage_users ?? false,
          });
        })
        .catch(err => {
          alert("Failed to fetch admin data.");
          console.error(err);
        });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/admins/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update admin settings");
      }

      alert("Settings updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating admin settings.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-3/4 mx-auto pt-30 px-4 sm:px-6 md:px-8">
      <h2 className="text-2xl font-bold mb-6">Admin Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., IT, Security, Operations"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="adminNotifications"
                name="adminNotifications"
                checked={formData.adminNotifications}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="adminNotifications" className="ml-3 block text-sm font-medium text-gray-700">
                Receive Admin Notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="manageUsers"
                name="manageUsers"
                checked={formData.manageUsers}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="manageUsers" className="ml-3 block text-sm font-medium text-gray-700">
                Permission to Manage Users
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
