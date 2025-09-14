import React, { useEffect, useState } from "react";
import { HelpCircle, Mail, Phone, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserChat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const contactEmail = () => {
    window.location.href = "mailto:support@safezone101.com";
    toast.info("Opening email client...");
  };

  const contactPhone = () => {
    toast.info("Please call: +1-555-0123", { autoClose: 5000 });
  };

  const startLiveChat = () => {
    // Redirect to messages page instead of showing chat
    navigate("/dashboard/messages");
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
              <h3 className="font-semibold text-gray-800 mb-2">Messages</h3>
              <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                Continue your conversation with our support team
              </p>
              <button
                onClick={startLiveChat}
                className="bg-purple-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm md:text-base"
              >
                View Messages
              </button>
            </div>
          </div>

          <div className="text-center text-gray-500 text-xs md:text-sm">
            <p>Business Hours: Monday - Friday, 9 AM - 6 PM EST</p>
            <p>Emergency support available 24/7 for critical issues</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserChat;