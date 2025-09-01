import React, { useEffect, useState } from "react";
import { Send, MessageSquare, Users, Search, ArrowLeft, Trash2, Menu, X } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = "http://127.0.0.1:5000";

function AdminChat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ open_chats: 0, closed_chats: 0, total_messages: 0 });
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar when switching to mobile if chat is selected
      if (mobile && selectedChat) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/`, {
        withCredentials: true,
      });
      setChats(response.data);
    } catch (error) {
      console.error("Error loading chats:", error);
      toast.error("Failed to load chats");
    }
  };

  const loadChatStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/admin/stats`, {
        withCredentials: true,
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error loading chat stats:", error);
    }
  };

  const loadChatMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/${chatId}`, {
        withCredentials: true,
      });
      setMessages(response.data.messages);
      
      // Update the chat in the list with latest message info
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, unread_count: 0 } 
            : chat
        )
      );
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    await loadChatMessages(chat.id);
    markMessagesAsRead(chat.id);
    
    // On mobile, close sidebar after selecting a chat
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === "" || !selectedChat) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/${selectedChat.id}/messages`,
        { content: message },
        { withCredentials: true }
      );

      const newMessage = response.data.data;
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (chatId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/chat/${chatId}/read`,
        {},
        { withCredentials: true }
      );
      
      // Update the chat in the list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, unread_count: 0 } 
            : chat
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const closeChat = async (chatId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/chat/${chatId}/close`,
        {},
        { withCredentials: true }
      );
      
      // Update the chat in the list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, status: "closed" } 
            : chat
        )
      );
      
      // If this was the selected chat, clear selection
      if (selectedChat && selectedChat.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
      
      // Refresh stats after closing a chat
      loadChatStats();
      
      toast.success("Chat closed successfully");
    } catch (error) {
      console.error("Error closing chat:", error);
      toast.error("Failed to close chat");
    }
  };

  const showDeleteConfirmation = (chatId, event) => {
    event.stopPropagation(); // Prevent selecting the chat when deleting
    setChatToDelete(chatId);
    
    // Custom confirmation toast
    toast.info(
      <div className="p-2">
        <h3 className="font-semibold mb-2">Delete Chat?</h3>
        <p className="text-sm mb-4">Are you sure you want to delete this chat? This action cannot be undone.</p>
        <div className="flex space-x-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss();
              setChatToDelete(null);
            }}
            className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss();
              deleteChat(chatId);
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        className: 'w-full max-w-md'
      }
    );
  };

  const deleteChat = async (chatId) => {
    const toastId = toast.loading("Deleting chat...");

    try {
      await axios.delete(
        `${API_BASE_URL}/api/chat/${chatId}`,
        { withCredentials: true }
      );
      
      // Remove the chat from the list
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      // If this was the selected chat, clear selection
      if (selectedChat && selectedChat.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
      
      // Refresh stats after deleting a chat
      loadChatStats();
      
      toast.update(toastId, {
        render: "Chat deleted successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeButton: true
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.update(toastId, {
        render: "Failed to delete chat",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeButton: true
      });
    } finally {
      setChatToDelete(null);
    }
  };

  const assignChatToAdmin = async (chatId, adminId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/chat/${chatId}/assign`,
        { admin_id: adminId },
        { withCredentials: true }
      );
      
      // Refresh chats after assignment
      loadChats();
      toast.success("Chat assigned successfully");
    } catch (error) {
      console.error("Error assigning chat:", error);
      toast.error("Failed to assign chat");
    }
  };

  // Polling for new chats and messages
  useEffect(() => {
    loadChats();
    loadChatStats();
    
    const interval = setInterval(() => {
      loadChats();
      if (selectedChat) {
        loadChatMessages(selectedChat.id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedChat]);

  const filteredChats = chats.filter(chat => {
    const userName = chat.user_name || chat.user_email || 'Unknown User';
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chat.user_email && chat.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.title && chat.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Mobile Header */}
      {isMobile && (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-20 flex items-center justify-between">
          {selectedChat ? (
            <>
              <button 
                onClick={() => setSelectedChat(null)}
                className="p-1 rounded hover:bg-blue-700"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1 truncate px-2">
                <h2 className="font-semibold truncate">
                  {selectedChat.user_name || selectedChat.user_email || 'Unknown User'}
                </h2>
              </div>
              <button 
                onClick={toggleSidebar}
                className="p-1 rounded hover:bg-blue-700"
              >
                <Menu size={20} />
              </button>
            </>
          ) : (
            <>
              <h1 className="font-semibold">Admin Chat</h1>
              <button 
                onClick={toggleSidebar}
                className="p-1 rounded hover:bg-blue-700"
              >
                <Menu size={20} />
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col z-40
        ${isMobile ? 
          `fixed left-0 top-0 h-full w-80 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : 'w-80 relative'}`}
      >
        {isMobile && (
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chats</h2>
            <button onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users size={20} className="mr-2 text-blue-600" />
              <h2 className="text-lg font-semibold">Customer Chats</h2>
            </div>
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {stats.open_chats} Open • {stats.closed_chats} Closed
            </div>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {chats.length === 0 ? "No chats available" : "No matching chats found"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.map(chat => (
                <div
                  key={chat.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 group ${
                    selectedChat && selectedChat.id === chat.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => selectChat(chat)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">
                        {chat.user_name || chat.user_email || 'Unknown User'}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{chat.title}</p>
                      {chat.user_email && (
                        <p className="text-xs text-gray-400 truncate mt-1">{chat.user_email}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        chat.status === "open" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {chat.status}
                      </span>
                      {chat.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(chat.updated_at).toLocaleString()}
                    </p>
                    <button
                      onClick={(e) => showDeleteConfirmation(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${isMobile ? 'pt-12' : ''}`}>
        {selectedChat ? (
          <>
            {/* Chat Header - Desktop */}
            {!isMobile && (
              <div className="bg-blue-600 text-white p-4 flex items-center">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="mr-3 p-1 rounded hover:bg-blue-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                  <h2 className="font-semibold">
                    {selectedChat.user_name || selectedChat.user_email || 'Unknown User'}
                  </h2>
                  <p className="text-xs opacity-80">{selectedChat.title}</p>
                  {selectedChat.user_email && (
                    <p className="text-xs opacity-70">{selectedChat.user_email}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => closeChat(selectedChat.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    disabled={selectedChat.status === "closed"}
                  >
                    {selectedChat.status === "open" ? "Close Chat" : "Chat Closed"}
                  </button>
                  <button
                    onClick={(e) => showDeleteConfirmation(selectedChat.id, e)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    title="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className={`flex-1 p-4 overflow-y-auto bg-[#e5ddd5] ${isMobile ? 'pt-2' : ''}`}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Start the conversation with the customer.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.is_admin ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.is_admin
                            ? "bg-blue-100 text-gray-800 rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none"
                        } shadow`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-gray-100 p-3 border-t">
              <form onSubmit={sendMessage} className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  disabled={loading || selectedChat.status === "closed"}
                />
                <button
                  type="submit"
                  disabled={loading || selectedChat.status === "closed"}
                  className="ml-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={48} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
              Admin Chat Dashboard
            </h3>
            <p className="text-gray-600 max-w-md text-center mb-6">
              {isMobile ? "Tap the menu icon to view chats" : "Select a chat from the sidebar to start messaging with customers."}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center w-full max-w-md">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">{stats.open_chats}</div>
                <div className="text-sm text-gray-600">Open Chats</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-600">{stats.closed_chats}</div>
                <div className="text-sm text-gray-600">Closed Chats</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{stats.total_messages}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
            </div>
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Menu size={20} className="mr-2" />
                View All Chats
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminChat;