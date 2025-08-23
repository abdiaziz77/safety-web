import React, { useState } from 'react';
import { 
  MessageSquare, Star, ThumbsUp, Heart, Send, 
  Users, Shield, Bell, MapPin, CheckCircle 
} from 'lucide-react';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Feedback',
    message: '',
    rating: 0
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here, you can handle form submission, e.g., send to API
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', category: 'General Feedback', message: '', rating: 0 });
    }, 3000);
  };

  const feedbackCategories = [
    {
      title: 'General Feedback',
      description: 'Share your overall experience with SafeZone101',
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Feature Requests',
      description: 'Suggest new features or improvements',
      icon: Bell,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Community Ideas',
      description: 'Share ideas for community engagement',
      icon: Users,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Safety Suggestions',
      description: 'Propose safety enhancements',
      icon: Shield,
      color: 'bg-red-100 text-red-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Community Member',
      feedback: 'SafeZone101 helped our neighborhood become much safer. The alert system is incredible!',
      rating: 5
    },
    {
      name: 'Officer James',
      role: 'Local Police',
      feedback: 'This platform has improved our response time and community coordination significantly.',
      rating: 5
    },
    {
      name: 'Michael T.',
      role: 'Neighborhood Watch',
      feedback: 'The feedback we provided was actually implemented. Great team that listens!',
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <MessageSquare className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Share Your Feedback
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your thoughts help us improve SafeZone101 and create a safer community for everyone.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Feedback Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us Your Feedback</h2>
            
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">Your feedback has been received. We appreciate your input!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>General Feedback</option>
                    <option>Feature Request</option>
                    <option>Community Idea</option>
                    <option>Safety Suggestion</option>
                    <option>Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you rate your experience?
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className={`p-2 rounded-lg transition-colors ${
                          formData.rating >= star
                            ? 'bg-yellow-100 text-yellow-500'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your thoughts, ideas, or suggestions..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Submit Feedback
                </button>
              </form>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-8">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Your Feedback Matters</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Heart className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Helps us improve community safety features</span>
                </li>
                <li className="flex items-start">
                  <Users className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Shapes future updates based on community needs</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Makes SafeZone101 more effective for everyone</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Feedback Categories</h3>
              <div className="space-y-4">
                {feedbackCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className={`p-3 rounded-lg ${category.color} mr-4 flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{category.title}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Community Feedback in Action</h3>
              <p className="mb-4">
                Recent improvements based on your feedback:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                  <span>Enhanced mobile app notifications</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                  <span>Improved neighborhood watch coordination</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                  <span>New safety training resources</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Our Community Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.feedback}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Ways to Reach Us</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            For urgent matters or additional support, feel free to contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@safezone101.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Email Support
            </a>
            <a
              href="/community"
              className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Users className="h-5 w-5 mr-2" />
              Join Community Forum
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;