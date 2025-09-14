import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [editForm, setEditForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "",
    role: "citizen",
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch all users
  useEffect(() => {
    // Simulate initial page loading with a timeout
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2500); // Increased to 2.5 seconds for better visibility
    
    fetchUsers();
    
    return () => clearTimeout(timer);
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm)) ||
        (user.id && user.id.toString().includes(searchTerm))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/auth/users", { 
        withCredentials: true
      });
      
      // Handle the response format
      let usersData = [];
      
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else {
        usersData = response.data || [];
      }
      
      setUsers(usersData);
      setFilteredUsers(usersData);
     
      
    } catch (err) {
      console.error("Error fetching user data:", err);
      toast.error("Failed to load user data. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || user.first_name || "",
      lastName: user.lastName || user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: "citizen",
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setShowEditModal(true);
  };

  // View user details
  const viewDetails = (user) => {
    setViewingUser(user);
    setShowDetailModal(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({ 
      firstName: "", 
    lastName: "", 
    email: "", 
    phone: "",
    role: "citizen",
    isActive: true
    });
    setShowEditModal(false);
  };

  const closeDetails = () => {
    setViewingUser(null);
    setShowDetailModal(false);
  };

  // Update user
  const updateUser = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      toast.error("First name, last name, and email cannot be empty", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    
    try {
      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        role: "citizen",
        isActive: editForm.isActive
      };

      await axios.put(`http://127.0.0.1:5000/api/auth/users/${editingUser.id}`, updateData, { 
        withCredentials: true 
      });
      
      fetchUsers();
      cancelEdit();
      
      // Personalized success message with user's name
      toast.success(`User ${editForm.firstName} ${editForm.lastName} updated successfully`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Failed to update user:", err);
      const errorMessage = err.response?.data?.message || "Please try again.";
      toast.error(`Failed to update user: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Delete user with toastify confirmation
  const deleteUser = async (id, name) => {
    toast.info(
      <div>
        <p className="text-center mb-3">Are you sure you want to delete {name}?</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => {
              toast.dismiss();
              confirmDelete(id, name);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Yes, Delete
          </button>
          <button 
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  // Actual delete confirmation
  const confirmDelete = async (id, name) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/auth/users/${id}`, { 
        withCredentials: true 
      });
      
      fetchUsers();
      
      toast.success(`User ${name} deleted successfully`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Failed to delete user:", err);
      const errorMessage = err.response?.data?.message || "Please try again.";
      toast.error(`Failed to delete user: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Page Pre-loader Component - Changed to normal page reload style
  const PagePreLoader = () => {
    return (
      // <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-gray-600 mb-4 text-lg font-medium">Loading User Management...</div>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-4 text-gray-500">Please wait while we load your dashboard</p>
        </div>
      /* </div> */
    );
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => {
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <div className="h-8 bg-blue-500 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-blue-400 rounded w-1/2 animate-pulse"></div>
          </div>
          
          {/* Search Bar Skeleton */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-lg w-full sm:w-32 animate-pulse"></div>
            </div>
          </div>
          
          {/* Table Skeleton */}
          <div className="overflow-auto p-6">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <th key={item} className="px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row} className="animate-pulse">
                    {[1, 2, 3, 4, 5].map((cell) => (
                      <td key={cell} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Show page pre-loader before content loads
  if (pageLoading) {
    return <PagePreLoader />;
  }

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ToastContainer />
      
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5">
              <h3 className="text-xl font-bold">Edit User</h3>
              <p className="text-blue-100 text-sm mt-1">Update user information</p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">First Name *</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={e => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Last Name *</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={e => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Status</label>
                <select
                  value={editForm.isActive ? "active" : "inactive"}
                  onChange={e => setEditForm(prev => ({ ...prev, isActive: e.target.value === "active" }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  onClick={cancelEdit} 
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={updateUser} 
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition font-medium shadow-md order-1 sm:order-2"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailModal && viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5">
              <h3 className="text-xl font-bold">User Details</h3>
              <p className="text-blue-100 text-sm mt-1">Complete user information</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 sm:mb-0 sm:mr-4">
                  {(viewingUser.firstName || viewingUser.first_name || '').charAt(0)}{(viewingUser.lastName || viewingUser.last_name || '').charAt(0)}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-gray-800">
                    {viewingUser.firstName || viewingUser.first_name} {viewingUser.lastName || viewingUser.last_name}
                  </h2>
                  <p className="text-gray-600 break-all">{viewingUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between border-b pb-2">
                  <span className="text-gray-600 font-medium mb-1 sm:mb-0">User ID:</span>
                  <span className="text-gray-800 font-mono break-all">#{viewingUser.id}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between border-b pb-2">
                  <span className="text-gray-600 font-medium mb-1 sm:mb-0">Email:</span>
                  <span className="text-gray-800 break-all">{viewingUser.email}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between border-b pb-2">
                  <span className="text-gray-600 font-medium mb-1 sm:mb-0">Phone:</span>
                  <span className="text-gray-800 break-all">{viewingUser.phone || "Not provided"}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between border-b pb-2">
                  <span className="text-gray-600 font-medium mb-1 sm:mb-0">Role:</span>
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Citizen
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between border-b pb-2">
                  <span className="text-gray-600 font-medium mb-1 sm:mb-0">Status:</span>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    viewingUser.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {viewingUser.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  onClick={closeDetails} 
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium order-2 sm:order-1"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    closeDetails();
                    startEdit(viewingUser);
                  }} 
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition font-medium shadow-md order-1 sm:order-2"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-white text-black p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold">User Management</h2>
            <p className="mt-2 text-black text-sm sm:text-base">Manage all users in the system</p>
          </div>
          
          {/* Search Bar */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search users by ID, name, email, or phone..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={fetchUsers}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition flex items-center justify-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>
          </div>
          
          {/* Users Table Container with Scroll */}
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-4 text-lg font-medium">
                          {searchTerm ? "No users match your search." : "No users found."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-600">
                          #{user.id}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold mr-2 sm:mr-3">
                            {(user.firstName || user.first_name || '').charAt(0)}{(user.lastName || user.last_name || '').charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName || user.first_name} {user.lastName || user.last_name}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">{user.email}</div>
                            <div className="text-xs text-gray-500">{user.phone || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <button 
                            onClick={() => viewDetails(user)} 
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition text-xs font-medium"
                          >
                            Details
                          </button>
                          <button 
                            onClick={() => startEdit(user)} 
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteUser(user.id, `${user.firstName || user.first_name} ${user.lastName || user.last_name}`)} 
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;