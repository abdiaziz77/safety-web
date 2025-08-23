import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Send, MessageSquare, HelpCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../auth/AuthContext";

const API_BASE_URL = "http://127.0.0.1:5000";

function UserChat() {
  const { user, loading: authLoading } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatTitle, setChatTitle] = useState("Support Chat");

  useEffect(() => {
    if (!user) return;

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

    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    newSocket.on("new_message", (message) => {
      if (message.chat_id === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, chatId]);

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
          { title: chatTitle },
          { withCredentials: true }
        );

        const newChat = response.data.chat;
        setChatId(newChat.id);

        // Send first message into this chat
        await sendMessageToChat(newChat.id, message);
      } else if (chatId) {
        // Subsequent messages
        await sendMessageToChat(chatId, message);
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessageToChat = async (chatId, messageContent) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/chat/${chatId}/messages`,
      { content: messageContent },
      { withCredentials: true }
    );

    const newMessage = response.data.data;
    setMessages((prev) => [...prev, newMessage]);
    
    if (socket) {
      socket.emit("send_message", {
        chat_id: chatId,
        content: newMessage.content,
        sender_id: user.id,
        created_at: new Date().toISOString(),
      });
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
      // Optionally handle chat closure UI
    } catch (error) {
      console.error("Error closing chat:", error);
    }
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
          <h2 className="text-2xl font-bold mb-4">Please log in to access chat</h2>
          <p className="text-gray-600">
            You need to be authenticated to use the chat feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-green-600 text-white p-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-white text-green-600 flex items-center justify-center font-bold mr-3">
          <HelpCircle size={20} />
        </div>
        <div>
          <h2 className="font-semibold">{chatTitle}</h2>
          <p className="text-xs opacity-80">
            {isConnected
              ? "Online - We'll reply soon"
              : "Offline - We'll get back to you"}
          </p>
        </div>
        {chatId && (
          <button 
            onClick={closeChat}
            className="ml-auto bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Close Chat
          </button>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5]" onScroll={markMessagesAsRead}>
        {messages.length === 0 && isFirstMessage ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <HelpCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Need help?
            </h3>
            <p className="text-gray-600 max-w-md mb-6">
              Start chatting with our admin team. Describe your issue and we'll
              help you as soon as possible.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender_id === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender_id === user.id
                      ? "bg-green-100 text-gray-800 rounded-br-none"
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
            placeholder={
              isFirstMessage
                ? "Type your question here..."
                : "Type a message"
            }
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="ml-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserChat;