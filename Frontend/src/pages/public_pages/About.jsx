import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Users, AlertTriangle, BarChart3, CheckCircle, Heart, 
  MapPin, Bell, Eye, Lock, Globe, Megaphone, ClipboardCheck, 
  Smartphone, LifeBuoy, Clock, TrendingUp, MessageSquare,
  Map, Radio, BookOpen, Zap, Cloud, Settings
} from 'lucide-react';

function About() {
  const features = [
    {
      icon: AlertTriangle,
      title: 'Real-time Incident Reporting',
      description: 'Citizens can quickly report safety incidents with location details, photos, and descriptions.',
      color: 'bg-red-50 text-red-600 border-red-100'
    },
    {
      icon: Shield,
      title: 'Instant Safety Alerts',
      description: 'Administrators can broadcast urgent safety alerts to keep the community informed.',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Analytics',
      description: 'Track safety trends, response times, and community engagement with detailed insights.',
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    },
    {
      icon: Users,
      title: 'Community Collaboration',
      description: 'Foster a safer community through collective awareness and proactive reporting.',
      color: 'bg-green-50 text-green-600 border-green-100'
    },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Every feature is designed with community safety as the top priority.',
      color: 'bg-blue-100/20 text-blue-600'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by the community, for the community, with transparency at its core.',
      color: 'bg-green-100/20 text-green-600'
    },
    {
      icon: Heart,
      title: 'Trusted & Secure',
      description: 'Your data is protected with enterprise-grade security measures.',
      color: 'bg-red-100/20 text-red-600'
    },
  ];

  const capabilities = [
    { icon: MapPin, text: 'Real-time incident reporting with GPS location' },
    { icon: Bell, text: 'Instant emergency alerts to community members' },
    { icon: Lock, text: 'Secure communication channels' },
    { icon: Eye, text: 'Comprehensive safety analytics dashboard' },
    { icon: Globe, text: 'Neighborhood watch coordination' },
    { icon: Megaphone, text: 'Direct alerts to local authorities' },
    { icon: ClipboardCheck, text: 'Educational materials and guides' },
    { icon: Smartphone, text: 'Mobile app for on-the-go safety' }
  ];

  const stats = [
    { value: '24/7', label: 'Emergency Support', icon: LifeBuoy },
    { value: '<2min', label: 'Average Alert Time', icon: Clock },
    { value: '99.9%', label: 'Uptime Reliability', icon: TrendingUp }
  ];

  const communityFeatures = [
    {
      icon: MessageSquare,
      title: 'Community Chat',
      description: 'Real-time messaging between neighbors and authorities for coordinated safety efforts.',
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      icon: Map,
      title: 'Interactive Safety Map',
      description: 'Visualize incidents, safe zones, and resources in your community in real-time.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      icon: BookOpen,
      title: 'Safety Resources Hub',
      description: 'Access comprehensive guides, tips, and educational materials for all safety scenarios.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];

  const alertSystem = [
    {
      step: '1',
      title: 'Incident Detection',
      description: 'Community members report incidents through the app with precise location details.',
      icon: AlertTriangle
    },
    {
      step: '2',
      title: 'Verification Process',
      description: 'Reports are verified by community moderators and local authorities.',
      icon: CheckCircle
    },
    {
      step: '3',
      title: 'Alert Distribution',
      description: 'Instant notifications are sent to relevant community members and authorities.',
      icon: Megaphone
    },
    {
      step: '4',
      title: 'Response Coordination',
      description: 'Community and authorities coordinate response efforts through the platform.',
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About SafeZone101
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your friendly community safety hub - connecting neighbors, authorities, and resources 
              to create safer neighborhoods through technology and collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Creating Safer Communities Together
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              SafeZone101 provides innovative tools that facilitate real-time communication, 
              incident reporting, and collaborative safety management between citizens and local authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl border border-gray-200 p-8 transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 mb-6 mx-auto">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{value.title}</h3>
                <p className="text-gray-600 text-center">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How SafeZone101 Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform connects community members, authorities, and resources 
              for effective safety management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`rounded-xl border ${feature.color} p-6 transition-all hover:shadow-lg`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white shadow-sm mb-4">
                  <feature.icon className={`h-6 w-6 ${feature.color.replace('bg', 'text')}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert System Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How We Send Alerts
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our intelligent alert system ensures timely and accurate safety notifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {alertSystem.map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Community Safety Hub
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A friendly platform designed to bring communities together for safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {communityFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incident Reporting Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Incident Reporting Made Easy
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our intuitive reporting system allows community members to quickly document 
                safety concerns with precise location details, photos, and descriptions. 
                All reports are immediately routed to the appropriate authorities and community moderators.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-800">GPS location tagging for precise incident mapping</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-800">Photo and video evidence upload capabilities</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-800">Anonymous reporting options for sensitive situations</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Incident reporting interface"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips Integration */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Safety Resources
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access educational materials, safety guides, and preventive tips for all scenarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Educational Guides</h3>
              <p className="text-gray-600">Step-by-step instructions for emergency preparedness and response</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Tips</h3>
              <p className="text-gray-600">Bite-sized safety advice for everyday situations and emergencies</p>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <Cloud className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Regular Updates</h3>
              <p className="text-gray-600">Current safety information and community alerts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <div className="bg-blue-50 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join Our Safety Network
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Become part of a growing community dedicated to making neighborhoods safer for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg shadow-md transition-colors"
              >
                Sign Up as a Resident
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white/10 text-white font-semibold rounded-lg transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;