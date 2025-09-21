import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Star, Send, User, Mail, MessageSquare, ArrowLeft, Heart, CheckCircle, Award, Crown } from 'lucide-react';

const FeedbackPage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  // Hardcoded feedback data with updated names
  const hardcodedFeedbacks = [
    {
      id: 1,
      name: "Abdiaziz Mohamed",
      email: "abdiaziz@example.com",
      rating: 5,
      message: "This is an amazing service! I've been using it for months and it's been incredibly helpful.",
      created_at: "2023-10-15T14:30:00Z"
    },
    {
      id: 2,
      name: "Amina Hassan",
      email: "amina@example.com",
      rating: 4,
      message: "Very good experience overall. The interface is user-friendly and intuitive.",
      created_at: "2023-10-10T09:15:00Z"
    },
    {
      id: 3,
      name: "Omar Abdullahi",
      email: "omar@example.com",
      rating: 5,
      message: "Exceptional customer support. They resolved my issue within minutes!",
      created_at: "2023-10-05T16:45:00Z"
    },
    {
      id: 4,
      name: "Fatima Ali",
      email: "fatima@example.com",
      rating: 3,
      message: "Good service but there's room for improvement in the mobile app experience.",
      created_at: "2023-10-03T11:20:00Z"
    },
    {
      id: 5,
      name: "Mohamed Ahmed",
      email: "mohamed@example.com",
      rating: 5,
      message: "This platform has transformed how I manage my daily tasks. Highly recommended!",
      created_at: "2023-09-28T08:45:00Z"
    }
  ];

  // Remove backend GET, use hardcoded feedbacks only
  useEffect(() => {
    setFeedbacks(hardcodedFeedbacks);
  }, []);

  const onSubmit = async (data) => {
    try {
      // Try to send to backend
      try {
        await axios.post('/api/feedback/', {
          ...data,
          rating,
        });
      } catch (error) {
        console.error('Backend submission failed, continuing in demo mode:', error);
      }

      // Show success message immediately
      setSubmitted(true);
      reset();
      setRating(0);
      
      toast.success('Thank you for your feedback!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset the submitted state after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Error submitting feedback. Please try again.');
    }
  };

  // Function to get badge based on ranking
  const getRankingBadge = (index) => {
    switch(index) {
      case 0:
        return { icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-100', text: 'Top Rated' };
      case 1:
        return { icon: Award, color: 'text-gray-500', bgColor: 'bg-gray-100', text: '2nd Best' };
      case 2:
        return { icon: Award, color: 'text-amber-700', bgColor: 'bg-amber-100', text: '3rd Best' };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background bubbles - FIXED ANIMATION STYLES */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {[...Array(15)].map((_, i) => {
          const randomSize = Math.floor(Math.random() * 100) + 50;
          const randomTop = Math.floor(Math.random() * 100);
          const randomLeft = Math.floor(Math.random() * 100);
          const randomDuration = Math.floor(Math.random() * 15) + 10;
          const randomDelay = Math.floor(Math.random() * 5);
          
          return (
            <div
              key={i}
              className="absolute rounded-full bg-blue-100 opacity-40"
              style={{
                width: `${randomSize}px`,
                height: `${randomSize}px`,
                top: `${randomTop}%`,
                left: `${randomLeft}%`,
                animationName: 'float',
                animationDuration: `${randomDuration}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${randomDelay}s`
              }}
            />
          );
        })}
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">Share Your Feedback</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your opinion matters to us! Help us improve SafeZone101 by sharing your experience.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Feedback Form */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                  <p className="text-gray-600">
                    Your feedback has been submitted successfully.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
                  >
                    Submit Another Feedback
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        className={`pl-10 w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-4`}
                        placeholder="Enter your name"
                        {...register('name', { required: 'Name is required' })}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        className={`pl-10 w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-4`}
                        placeholder="Enter your email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z00-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Rating
                    </label>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                          <button
                            type="button"
                            key={index}
                            className={`text-2xl focus:outline-none ${ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            onClick={() => setRating(ratingValue)}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                          >
                            <Star className="w-8 h-8 fill-current" />
                          </button>
                        );
                      })}
                    </div>
                    {rating === 0 && (
                      <p className="mt-1 text-sm text-red-600">Please select a rating</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Feedback
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="message"
                        rows={5}
                        className={`pl-10 w-full rounded-lg border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-4`}
                        placeholder="Tell us about your experience..."
                        {...register('message', { 
                          required: 'Feedback message is required',
                          minLength: {
                            value: 10,
                            message: "Feedback must be at least 10 characters"
                          }
                        })}
                      />
                    </div>
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Feedback Display - UPDATED STYLING */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 h-full">
              <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-blue-600" />
                Community Feedback
              </h2>
              
              {feedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No feedback yet</h3>
                  <p className="text-gray-500">Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {feedbacks.map((feedback, index) => {
                    const badge = getRankingBadge(index);
                    const BadgeIcon = badge?.icon;
                    
                    return (
                      <div 
                        key={feedback.id} 
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative"
                      >
                        {badge && (
                          <div className={`absolute -top-2 -right-2 ${badge.bgColor} rounded-full px-3 py-1 flex items-center text-xs font-medium ${badge.color} z-10 shadow-md`}>
                            {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
                            {badge.text}
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-700 font-semibold">
                                {feedback.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{feedback.name}</h3>
                              <p className="text-xs text-gray-500">{feedback.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mt-3 text-sm leading-relaxed bg-blue-50 p-3 rounded-lg">
                          "{feedback.message}"
                        </p>
                        
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-xs text-gray-500">
                            {new Date(feedback.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {feedback.rating}/5 rating
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </a>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
      
      {/* Add custom styles for the floating animation */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(20px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FeedbackPage;