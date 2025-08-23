import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Send, Users, MessageSquare, Search, ChevronLeft } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000";

function AdminChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const axiosConfig = {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  // Verify admin session
  const verifyAdminSession = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/get_current_admin_user`,
        axiosConfig
      );
      if (response.data && response.data.id) {
        setIsAdmin(true);
        return true;
      }
      setIsAdmin(false);
      return false;
    } catch (error) {
      console.error(
        "Admin verification failed:",
        error.response?.data?.error || error.message
      );
      setIsAdmin(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    // Append to open chat
    if (activeChat && message.chat_id === activeChat.id) {
      setMessages((prev) => [...prev, message]);
    }
    // Refresh chat list for unread counts / last message
    fetchUserChats();
  };

  const fetchUserChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/`, axiosConfig);
      setUserChats(response.data);

      if (response.data.length > 0 && !activeChat) {
        setActiveChat(response.data[0]);
      }
    } catch (error) {
      console.error(
        "Error fetching chats:",
        error.response?.data?.error || error.message
      );
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chat/${chatId}`,
        axiosConfig
      );
      setMessages(response.data.messages || []);

      // Mark unread user messages as read
      if (response.data.messages?.some((msg) => !msg.is_read && !msg.is_admin)) {
        await markMessagesAsRead(chatId);
      }
    } catch (error) {
      console.error(
        "Error fetching messages:",
        error.response?.data?.error || error.message
      );
    }
  };

  const markMessagesAsRead = async (chatId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/chat/${chatId}/read`, {}, axiosConfig);
    } catch (error) {
      console.error(
        "Error marking as read:",
        error.response?.data?.error || error.message
      );
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    const tempMessage = {
      id: Date.now().toString(),
      chat_id: activeChat.id,
      content: message,
      created_at: new Date().toISOString(),
      is_admin: true,
      is_read: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    const contentToSend = message;
    setMessage("");

    try {
      // Persist via REST (keeps DB source of truth)
      await axios.post(
        `${API_BASE_URL}/api/chat/${activeChat.id}/messages`,
        { content: contentToSend },
        axiosConfig
      );

      // Real-time notify via Socket.IO (backend expects user_id + content)
      if (socket) {
        socket.emit("admin_send_message", {
          user_id: activeChat.user_id,
          content: contentToSend,
        });
      }

      fetchUserChats();
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response?.data?.error || error.message
      );
      // rollback optimistic UI
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    }
  };

  const closeChat = async (chatId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/chat/${chatId}/close`, {}, axiosConfig);
      fetchUserChats();
      if (activeChat?.id === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error(
        "Error closing chat:",
        error.response?.data?.error || error.message
      );
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      const ok = await verifyAdminSession();
      if (!ok) return;

      const newSocket = io(API_BASE_URL, {
        withCredentials: true, // send Flask session cookies
        transports: ["websocket", "polling"], // allow fallback for cookie flow
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnected(true);
        // Ask server for all active chats
        newSocket.emit("admin_get_chats");
        // Also keep REST list in sync (optional)
        fetchUserChats();
      });

      newSocket.on("disconnect", () => setIsConnected(false));
      newSocket.on("connect_error", (err) =>
        console.error("Socket error:", err.message)
      );

      // Server-sent chat list
      newSocket.on("admin_chat_list", (payload) => {
        if (Array.isArray(payload?.chats)) {
          setUserChats(payload.chats);
          // Select a default chat if none selected
          if (!activeChat && payload.chats.length > 0) {
            setActiveChat(payload.chats[0]);
          }
        }
      });

      // Server-sent new message
      newSocket.on("new_message", handleNewMessage);

      // Initial REST fetch
      fetchUserChats();

      return () => {
        newSocket.off("admin_chat_list");
        newSocket.off("new_message");
        newSocket.disconnect();
      };
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When selecting a chat: fetch history and join room
  useEffect(() => {
    if (activeChat && socket) {
      fetchChatMessages(activeChat.id);
      // join_chat expects the raw chat_id per your backend
      socket.emit("join_chat", activeChat.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat, socket]);

  const filteredChats = userChats.filter(
    (chat) =>
      (chat.user_email &&
        chat.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.title &&
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.last_message &&
        chat.last_message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
          <p>You don't have admin privileges to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">
            Error: Could not verify admin session. Please ensure you're logged
            in as an admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - User List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="mr-2" size={20} /> User Chats
          </h2>
        </div>

        <div className="p-2 border-b">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 relative ${
                  activeChat?.id === chat.id ? "bg-gray-100" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium">
                    {chat.user_email || chat.title || "Unknown User"}
                  </div>
                  <span className="text-xs text-gray-500">
                    {chat.updated_at
                      ? new Date(chat.updated_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {chat.last_message || "No messages yet"}
                </p>
                {chat.unread_count > 0 && (
                  <span className="absolute right-3 top-3 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {chat.unread_count}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No chats found</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden mr-2 text-gray-600"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                  {activeChat.user_email?.charAt(0).toUpperCase() ||
                    activeChat.title?.charAt(0).toUpperCase() ||
                    "U"}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">
                    {activeChat.user_email || activeChat.title || "Unknown User"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isConnected ? "Online" : "Offline"} • {activeChat.status}
                  </p>
                </div>
              </div>
              {activeChat.status === "open" && (
                <button
                  onClick={() => closeChat(activeChat.id)}
                  className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                >
                  Close Chat
                </button>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.is_admin ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.is_admin
                            ? "bg-green-100 text-gray-800 rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none"
                        } shadow`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {msg.created_at
                            ? new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                          {!msg.is_read && !msg.is_admin && (
                            <span className="ml-1 text-green-500">• Unread</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeChat.status === "open" && (
              <div className="bg-gray-100 p-3 border-t">
                <form onSubmit={sendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                  />
                  <button
                    type="submit"
                    className="ml-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Admin Chat
              </h3>
              <p className="text-gray-500 max-w-md">
                {userChats.length > 0
                  ? "Select a conversation from the sidebar"
                  : "No active chats available"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminChat;
