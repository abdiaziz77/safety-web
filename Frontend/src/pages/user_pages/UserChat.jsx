import React, { useEffect, useState } from "react";
import { Send, HelpCircle, Mail, Phone, MessageCircle, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../auth/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = "http://127.0.0.1:5000";

function UserChat() {
  const { user, loading: authLoading } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatTitle, setChatTitle] = useState("Support Chat");
  const [showSupportOptions, setShowSupportOptions] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!user || !showChat) return;

    // Load existing chats if any
    const loadExistingChats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/chat/`, {
          withCredentials: true,
        });
        if (response.data.length > 0) {
          const openChat = response.data.find(chat => chat.status === "open");
          if (openChat) {
            setChatId(openChat.id);
            setChatTitle(openChat.title);
            loadChatMessages(openChat.id);
            setIsFirstMessage(false);
          }
        }
      } catch (error) {
        console.error("Error loading chats:", error);
      }
    };

    loadExistingChats();

    // Polling for new messages every 5s
    const interval = setInterval(() => {
      if (chatId && showChat) {
        loadChatMessages(chatId);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, chatId, showChat]);

  const loadChatMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/${chatId}`, {
        withCredentials: true,
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === "" || !user) return;

    setLoading(true);

    try {
      if (isFirstMessage) {
        // First message → create chat
        const response = await axios.post(
          `${API_BASE_URL}/api/chat/`,
          { title: `Support Request from ${user.email}` },
          { withCredentials: true }
        );

        const newChat = response.data.chat;
        setChatId(newChat.id);
        setChatTitle(newChat.title);
        setIsFirstMessage(false);

        // Send first message
        await sendMessageToChat(newChat.id, message);
      } else if (chatId) {
        // Subsequent messages
        await sendMessageToChat(chatId, message);
      }

      setMessage("");
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const sendMessageToChat = async (chatId, messageContent) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/${chatId}/messages`,
        { content: messageContent },
        { withCredentials: true }
      );

      const newMessage = response.data.data;
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Error sending message to chat:", error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!chatId) return;
    try {
      await axios.put(
        `${API_BASE_URL}/api/chat/${chatId}/read`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const closeChat = async () => {
    if (!chatId) return;
    try {
      await axios.put(
        `${API_BASE_URL}/api/chat/${chatId}/close`,
        {},
        { withCredentials: true }
      );
      toast.success("Chat closed successfully");
      setShowChat(false);
      setShowSupportOptions(true);
      setMessages([]);
      setChatId(null);
      setIsFirstMessage(true);
    } catch (error) {
      console.error("Error closing chat:", error);
      toast.error("Failed to close chat");
    }
  };

  const startLiveChat = () => {
    setShowSupportOptions(false);
    setShowChat(true);
  };

  const contactEmail = () => {
    window.location.href = "mailto:support@safezone101.com";
    toast.info("Opening email client...");
  };

  const contactPhone = () => {
    toast.info("Please call: +1-555-0123", { autoClose: 5000 });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">Loading...</div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access support</h2>
          <p className="text-gray-600">
            You need to be authenticated to use our support services.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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

      {/* Support Options */}
      {showSupportOptions && (
        <div className="flex-1 p-4 md:p-6 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-4 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <HelpCircle size={32} className="text-green-600 md:w-10 md:h-10" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Need Help?</h1>
              <p className="text-gray-600 text-base md:text-lg">
                We're here to help you with any issues or questions you might have.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="text-center p-4 md:p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Mail size={20} className="text-white md:w-6 md:h-6" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Email Support</h3>
                <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                  Send us an email and we'll get back to you within 24 hours
                </p>
                <button
                  onClick={contactEmail}
                  className="bg-blue-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
                >
                  Email Us
                </button>
              </div>

              <div className="text-center p-4 md:p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Phone size={20} className="text-white md:w-6 md:h-6" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Phone Support</h3>
                <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                  Call us directly for immediate assistance during business hours
                </p>
                <button
                  onClick={contactPhone}
                  className="bg-green-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-green-600 transition-colors text-sm md:text-base"
                >
                  Call Now
                </button>
              </div>

              <div className="text-center p-4 md:p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <MessageCircle size={20} className="text-white md:w-6 md:h-6" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Live Chat</h3>
                <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                  Chat with our support team in real-time for instant help
                </p>
                <button
                  onClick={startLiveChat}
                  className="bg-purple-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm md:text-base"
                >
                  Start Chat
                </button>
              </div>
            </div>

            <div className="text-center text-gray-500 text-xs md:text-sm">
              <p>Business Hours: Monday - Friday, 9 AM - 6 PM EST</p>
              <p>Emergency support available 24/7 for critical issues</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {showChat && (
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-3 md:p-4 flex items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-green-600 flex items-center justify-center font-bold mr-2 md:mr-3">
              <HelpCircle size={16} className="md:w-5 md:h-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-sm md:text-base">Support Team</h2>
              <p className="text-xs opacity-80">We'll get back to you as soon as possible</p>
            </div>
            <button
              onClick={() => {
                setShowChat(false);
                setShowSupportOptions(true);
              }}
              className="mr-2 p-1 md:p-2 text-white hover:bg-green-700 rounded-full transition-colors"
              title="Minimize chat"
            >
              <X size={16} className="md:w-5 md:h-5" />
            </button>
            {chatId && (
              <button
                onClick={closeChat}
                className="bg-red-500 text-white px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm hover:bg-red-600 transition-colors"
              >
                End Chat
              </button>
            )}
          </div>

          {/* Chat Messages - WhatsApp Style */}
          <div
            className="flex-1 p-3 md:p-4 overflow-y-auto bg-[#e5ddd5] bg-whatsapp-background"
            onScroll={markMessagesAsRead}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E")'
            }}
          >
            {messages.length === 0 && isFirstMessage ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-2">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
                  <MessageCircle size={24} className="text-green-600 md:w-8 md:h-8" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                  Start a Conversation
                </h3>
                <p className="text-gray-600 max-w-md text-sm md:text-base mb-4 md:mb-6">
                  Our support team is ready to help you. Describe your issue and we'll
                  connect you with the right person to assist you.
                </p>
                <div className="bg-white rounded-lg p-3 md:p-4 max-w-md text-left shadow-sm text-xs md:text-sm">
                  <h4 className="font-semibold text-green-600 mb-2">💡 Quick Tips:</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Describe your issue in detail</li>
                    <li>• Include any error messages you're seeing</li>
                    <li>• Let us know what you've already tried</li>
                    <li>• We're here to help 24/7 for urgent issues</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, i) => {
                  const isUserMessage = msg.sender_id === user.id;
                  const isAdminMessage = !isUserMessage;
                  
                  return (
                    <div
                      key={i}
                      className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-3 py-2 md:px-4 md:py-2 rounded-lg ${
                          isUserMessage
                            ? "bg-[#d9fdd3] text-gray-800 rounded-tr-none" // User messages (green)
                            : "bg-white text-gray-800 rounded-tl-none border border-gray-100" // Admin messages (white)
                        } shadow-sm relative`}
                        style={{
                          maxWidth: '85%'
                        }}
                      >
                        <p className="text-sm mb-1">{msg.content}</p>
                        <p className="text-xs text-gray-500 text-right">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        
                        {/* WhatsApp-style message tail */}
                        {isUserMessage && (
                          <div className="absolute top-0 right-0 w-2 h-2 overflow-hidden -mr-1">
                            <div className="w-4 h-4 bg-[#d9fdd3] transform rotate-45 origin-bottom-left"></div>
                          </div>
                        )}
                        
                        {isAdminMessage && (
                          <div className="absolute top-0 left-0 w-2 h-2 overflow-hidden -ml-1">
                            <div className="w-4 h-4 bg-white transform rotate-45 origin-bottom-right"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message Input - WhatsApp Style */}
          <div className="bg-gray-100 p-2 md:p-3 border-t border-gray-300">
            <form onSubmit={sendMessage} className="flex items-center space-x-2">
              <div className="flex-1 bg-white rounded-full border border-gray-300 flex items-center px-3 md:px-4 py-1.5 md:py-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isFirstMessage
                      ? "Describe your issue here..."
                      : "Type a message"
                  }
                  className="flex-1 outline-none bg-transparent text-sm"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || message.trim() === ""}
                className="bg-green-500 text-white p-2 md:p-3 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="Send message"
              >
                <Send size={16} className="md:w-5 md:h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserChat;