import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Users, Clock, Phone, MapPin, Activity, TrendingUp, CheckCircle, BarChart3, Building, Eye, Heart, Zap, ChevronRight, Play, Target, Bell, Lock, Map, Globe, TargetIcon } from 'lucide-react';

const Home = () => {
  // Features data
  const features = [
    {
      title: "Real-time Monitoring",
      description: "24/7 surveillance of your facilities with instant alert systems",
      icon: Eye,
      color: "text-blue-600"
    },
    {
      title: "Emergency Response",
      description: "Immediate protocol activation with one-click emergency actions",
      icon: Zap,
      color: "text-red-600"
    },
    {
      title: "Personnel Safety",
      description: "Track and ensure the safety of all personnel in your organization",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Health Integration",
      description: "Monitor health metrics alongside safety indicators",
      icon: Heart,
      color: "text-pink-600"
    }
  ];

  // Stats data
  const stats = [
    { value: "99.9%", label: "Uptime Reliability", icon: Activity },
    { value: "2.3s", label: "Average Response Time", icon: Clock },
    { value: "500+", label: "Organizations Protected", icon: Building },
    { value: "24/7", label: "Monitoring Coverage", icon: Eye }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "SafeZone101 transformed our campus safety. Incidents decreased by 45% in the first year.",
      author: "Sarah Johnson",
      role: "Security Director, Tech University",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      quote: "The real-time alerts have saved us precious minutes in emergency situations.",
      author: "Michael Chen",
      role: "Facility Manager, Corporate Plaza",
      avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      quote: "Implementation was seamless and the dashboard is incredibly intuitive.",
      author: "Lisa Rodriguez",
      role: "COO, Healthcare Network",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  // How it works steps - Updated as requested
  const howItWorks = [
    {
      step: "1",
      title: "Register",
      description: "Create your organization's account and set up your safety profile",
      icon: CheckCircle
    },
    {
      step: "2",
      title: "Report Incidents",
      description: "Quickly report safety incidents through our intuitive interface",
      icon: AlertTriangle
    },
    {
      step: "3",
      title: "Get Alerts",
      description: "Receive real-time notifications about safety concerns in your area",
      icon: Bell
    },
    {
      step: "4",
      title: "Be Secured",
      description: "Rest easy knowing our system is monitoring and protecting your people",
      icon: Lock
    }
  ];

  // Importance points
  const importancePoints = [
    {
      title: "Immediate Response",
      description: "Critical seconds saved in emergencies with instant alerts",
      icon: Zap
    },
    {
      title: "Comprehensive Coverage",
      description: "Protection for all areas of your facility and personnel",
      icon: Shield
    },
    {
      title: "Regulatory Compliance",
      description: "Meet all safety regulations and requirements effortlessly",
      icon: CheckCircle
    },
    {
      title: "Peace of Mind",
      description: "Know that your people and assets are protected 24/7",
      icon: Heart
    }
  ];

  // Benefits of using SafeZone101
  const benefits = [
    {
      title: "Save Time",
      description: "No more traveling to police stations or waiting in long queues",
      icon: Clock
    },
    {
      title: "Cost Effective",
      description: "Eliminate transportation costs associated with reporting incidents",
      icon: TrendingUp
    },
    {
      title: "Instant Reporting",
      description: "Report safety concerns immediately from anywhere, anytime",
      icon: Zap
    },
    {
      title: "Local Focus",
      description: "Specifically designed for Garissa County's security needs",
      icon: Map
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-0 right-0 -mr-40 mt-40 rounded-full w-80 h-80 bg-blue-600/20"></div>
        <div className="absolute bottom-0 left-0 -ml-40 mb-40 rounded-full w-80 h-80 bg-blue-500/30"></div>
        
        {/* Trusted by badge - Top left corner */}
        <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
          <span className="text-sm font-medium">Trusted by 500+ Citizens</span>
        </div>
        
        {/* Live Indicator */}
        <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full flex items-center shadow-lg animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
          <span className="text-sm font-medium">LIVE</span>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Introducing SafeZone101 </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Revolutionizing Safety <br className="hidden md:block" /> Management
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Advanced monitoring, instant alerts, and comprehensive emergency response in one integrated platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup"
                className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Register Now
              </Link>
              <Link 
                to="/alerts"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all text-center"
              >
                View Alerts
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="h-8 w-8 text-white rotate-90" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <stat.icon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Importance Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Safety Matters</h2>
            <p className="text-xl text-gray-600">
              Proactive safety measures save lives, reduce liability, and create secure environments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {importancePoints.map((point, index) => (
              <div key={index} className="bg-white rounded-xl p-8 text-center hover:shadow-md transition-all">
                <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto text-blue-600">
                  <point.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-gray-600">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are Section - Enhanced with more details */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-6">
              <Globe className="h-5 w-5 mr-2" />
              <span className="font-medium">Serving Garissa County, Kenya</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-xl text-gray-600">
              SafeZone101 was founded to revolutionize safety reporting and emergency response through technology innovation
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white mb-12 shadow-xl">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6">Our Mission: Saving Time, Saving Lives</h3>
                  <p className="text-lg mb-4">
                    We recognized that traditional safety reporting methods—traveling to police stations, waiting in long queues, 
                    and dealing with paperwork—were inefficient and time-consuming for the people of Garissa County.
                  </p>
                  <p className="text-lg">
                    SafeZone101 was created as the optimal solution: a time-saving, easy-to-use platform that connects citizens 
                    directly with the security management team, eliminating unnecessary delays and transportation costs.
                  </p>
                </div>
                <div className="md:w-1/3 bg-white/20 rounded-xl p-6 text-center">
                  <TargetIcon className="h-16 w-16 mx-auto mb-4" />
                  <h4 className="font-bold text-xl mb-2">Focused on Garissa</h4>
                  <p>Customized for local security needs and challenges</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">How We Help You Save Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all">
                    <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 mx-auto text-blue-600">
                      <benefit.icon className="h-7 w-7" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 md:p-10">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Story</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-700 mb-4">
                      Founded by a team of security experts and technology innovators, SafeZone101 combines decades of 
                      experience in emergency response with cutting-edge digital solutions.
                    </p>
                    <p className="text-gray-700">
                      We understand the unique safety challenges faced by communities in Garissa County and have designed 
                      our platform specifically to address these needs with efficiency and compassion.
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 mb-4">
                      Our system eliminates the traditional barriers to safety reporting—saving you transportation costs, 
                      time spent traveling to stations, and long waiting periods just to file a report.
                    </p>
                    <p className="text-gray-700">
                      With SafeZone101, help is just a click away, connecting you directly with the security management 
                      team responsible for protecting Garissa County.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SafeZone101?</h2>
            <p className="text-xl text-gray-600">
              Our comprehensive safety platform offers unmatched protection and peace of mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-md transition-all">
                <div className={`bg-blue-50 w-16 h-16 rounded-lg flex items-center justify-center mb-6 ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Updated with dark blue background */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">How SafeZone101 Works</h2>
            <p className="text-xl text-blue-100">
              Four simple steps to comprehensive safety protection
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/15 transition-all">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  {step.step}
                </div>
                <step.icon className="h-10 w-10 mx-auto mb-4 text-blue-200" />
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-blue-100">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">
              Trusted by organizations worldwide to protect their people and assets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-center mb-6">
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Updated with dark blue background */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Safety Management?</h2>
            <p className="text-xl text-blue-100 mb-10">
              Join thousands of organizations that trust SafeZone101 to protect their people and facilities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup"
                className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all text-center"
              >
                Register Now
              </Link>
              <Link 
                to="/alerts"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all text-center"
              >
                View Alerts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer has been removed as requested */}
    </div>
  );
};

export default Home;