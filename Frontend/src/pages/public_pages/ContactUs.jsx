import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, Clock, Send, Globe,
  MessageCircle, Users, Shield, Heart
} from 'lucide-react';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for reaching out! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone',
      details: '+254 700 123 456',
      description: 'Call us during business hours',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'support@safezone101.co.ke',
      description: 'Send us a message anytime',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: 'Garissa University, Kenya',
      description: 'Visit our headquarters',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: 'Mon - Fri: 8:00 AM - 5:00 PM',
      description: 'EAT Time Zone',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const teamMembers = [
    {
      name: 'Ahmed Mohamed',
      role: 'Community Manager',
      department: 'Garissa Region'
    },
    {
      name: 'Fatima Abdi',
      role: 'Safety Coordinator',
      department: 'University Liaison'
    },
    {
      name: 'Omar Hassan',
      role: 'Technical Support',
      department: 'Northern Kenya'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <MessageCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact SafeZone101 Kenya
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get in touch with our team in Garissa. We're here to help you with safety solutions and community support.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className={`inline-flex p-3 rounded-xl ${method.color} mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-700 font-medium mb-2">{method.details}</p>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>General Inquiry</option>
                  <option>Safety Concern</option>
                  <option>Partnership Opportunity</option>
                  <option>Technical Support</option>
                  <option>Community Program</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>

          {/* Map and Additional Info */}
          <div className="space-y-8">
            {/* Garissa University Map */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-6 border-b border-gray-200 text-gray-900">
                Our Location - Garissa University
              </h3>
              <div className="h-80">
                <iframe
                  title="Garissa University Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.317218136266!2d39.64577427499664!3d-0.4537224352247009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18400dac4aabf4e7%3A0x8b5e4b3b3b3b3b3b!2sGarissa%20University!5e0!3m2!1sen!2ske!4v1633080000000!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-2">
                  <strong>Address:</strong> Garissa University, Garissa County, Kenya
                </p>
                <p className="text-gray-600">
                  <strong>Campus:</strong> Main Campus, Off Kismayu Road
                </p>
              </div>
            </div>

            {/* Team Info */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Garissa Team</h3>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center">
                    <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-xs text-gray-500">{member.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Support</h3>
            <p className="text-gray-600">
              For urgent safety concerns, contact our 24/7 emergency line immediately.
            </p>
            <p className="text-blue-600 font-semibold mt-2">+254 711 789 012</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Programs</h3>
            <p className="text-gray-600">
              Join our community safety initiatives and training programs in Garissa County.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Area</h3>
            <p className="text-gray-600">
              Serving Garissa County and surrounding regions with dedicated safety solutions.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Make Your Community Safer?</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Join SafeZone101 today and be part of the solution for a safer Garissa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Join Our Program
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;