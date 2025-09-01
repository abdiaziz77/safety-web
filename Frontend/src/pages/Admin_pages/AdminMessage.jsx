import React, { useState, useEffect } from 'react';
import { FiMail, FiUser, FiClock, FiMessageSquare, FiTrash2, FiCornerUpLeft, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please login as admin first');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages. Make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (messageId, userEmail) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setIsReplying(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message_id: messageId,      // Fixed: snake_case to match backend
          user_email: userEmail,      // Fixed: snake_case to match backend
          reply_text: replyText       // Fixed: snake_case to match backend
        }),
      });

      if (response.ok) {
        toast.success('Reply sent successfully! Email notification sent to user.');
        setReplyText('');
        setSelectedMessage(null);
        fetchMessages();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Reply error:', error);
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Message deleted successfully');
        fetchMessages();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete message');
    }
  };

  const updateMessageStatus = async (messageId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Message marked as ${status}`);
        fetchMessages();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update message status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.message || 'Failed to update message status');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Customer Messages</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Messages</h1>
        <button
          onClick={fetchMessages}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <FiMail className="mx-auto text-gray-400 text-4xl mb-4" />
          <p className="text-gray-600">No messages found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FiUser className="text-gray-500 mr-2" />
                  <span className="font-medium">{msg.email}</span>
                  {msg.user && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Registered User: {msg.user.first_name} {msg.user.last_name})
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FiClock className="mr-1" />
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{msg.title}</h3>
              
              <div className="flex items-start mb-3">
                <FiMessageSquare className="text-gray-500 mr-2 mt-1" />
                <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
              </div>

              {msg.response && (
                <div className="bg-blue-50 p-3 rounded mb-3">
                  <h4 className="font-semibold text-blue-800 mb-1">Admin Response:</h4>
                  <p className="text-blue-700 whitespace-pre-wrap">{msg.response}</p>
                  {msg.response_date && (
                    <p className="text-xs text-blue-600 mt-1">
                      Replied on: {new Date(msg.response_date).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    msg.status === 'new' 
                      ? 'bg-blue-100 text-blue-800' 
                      : msg.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {msg.status}
                  </span>
                  
                  <span className={`px-2 py-1 rounded text-xs ${
                    msg.priority === 'urgent' 
                      ? 'bg-red-100 text-red-800' 
                      : msg.priority === 'high'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.priority} priority
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Reply"
                  >
                    <FiCornerUpLeft />
                  </button>
                  
                  <button
                    onClick={() => updateMessageStatus(msg.id, 'resolved')}
                    className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                    title="Mark as Resolved"
                    disabled={msg.status === 'resolved'}
                  >
                    <FiCheck />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {selectedMessage?.id === msg.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">Reply to {msg.email}</h4>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here. This will be sent as an email to the user..."
                    className="w-full p-3 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMessage(null);
                        setReplyText('');
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(msg.id, msg.email)}
                      disabled={isReplying || !replyText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isReplying ? (
                        <>
                          <span className="animate-spin inline-block mr-2">⏳</span>
                          Sending...
                        </>
                      ) : (
                        'Send Email Reply'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;