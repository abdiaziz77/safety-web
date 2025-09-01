import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { 
  Security, Groups, LocationOn, Phone, Notifications, Chat, 
  BarChart, CheckCircle, EmojiEvents, Schedule, Favorite, Star,
  ChevronRight, PlayArrow, ArrowForward, Event, GpsFixed,
  FlashOn, Lock, Visibility, Language, Tablet, Smartphone, Cloud,
  Dashboard, Analytics, People, Shield, LiveHelp, GetApp,
  SupportAgent, School, MenuBook, TrendingUp, Verified,
  Construction, Emergency, LocalHospital, LocalPolice,
  FireTruck, Business, HealthAndSafety, Speed, Timeline,
  Assessment, Notifications as NotificationIcon, Map,
  CellTower, Wifi, Storage, SyncAlt, PhonelinkSetup,
  Contacts, Call, CrisisAlert, ReportProblem, 
  GroupAdd, PersonAdd, AdminPanelSettings, Settings
} from '@mui/icons-material';

const Home = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activePlan, setActivePlan] = useState(1);
  const [stats, setStats] = useState([
    { value: 0, label: 'Protected Communities', suffix: 'K+' },
    { value: 0, label: 'Emergency Responses', suffix: 'K+' },
    { value: 0, label: 'Active Users', suffix: 'K+' },
    { value: 0, label: 'Response Time', suffix: 's', prefix: '<' }
  ]);

  useEffect(() => {
    // Animate stats counting
    const intervals = stats.map((stat, index) => {
      const targetValues = [250, 500, 1000, 45];
      const duration = 2000;
      const steps = 50;
      const increment = targetValues[index] / steps;
      let current = 0;

      return setInterval(() => {
        current += increment;
        if (current >= targetValues[index]) {
          current = targetValues[index];
          clearInterval(intervals[index]);
        }
        setStats(prev => prev.map((s, i) => 
          i === index ? { ...s, value: Math.floor(current) } : s
        ));
      }, duration / steps);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  const features = [
    {
      icon: CrisisAlert,
      title: "Real-time Emergency Alerts",
      description: "Instant notifications for emergencies in your area with precise location details and severity levels.",
      image: "/src/assets/image/amber-alert-mobile-phone.png"
    },
    {
      icon: Map,
      title: "Live Community Map",
      description: "Interactive map showing active incidents, safe zones, and emergency resources in real-time.",
      image: "/src/assets/image/live community map.jpg"
    },
    {
      icon: Groups,
      title: "Community Watch",
      description: "Connect with neighbors and local authorities to keep your community safe together.",
      image: "/src/assets/image/community watch.jpg"
    },
    {
      icon: Analytics,
      title: "Safety Analytics",
      description: "Comprehensive reports and insights about safety trends in your neighborhood.",
      image: "/src/assets/image/safery analytics.jpg"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Aden",
      role: "Community Leader",
      content: "SafeZone101 transformed our neighborhood's safety. The real-time alerts have prevented several emergencies.",
      avatar: "/src/assets/image/iqro.jpeg"
    },
    {
      name: "Officer Abdinasir Mohamud",
      role: "Local Police Department",
      content: "The coordination tools have reduced response times by 40%. A game-changer for community policing.",
      avatar: "/src/assets/image/nin.jpg"
    },
    {
      name: "Dr. Abdihafit Noor",
      role: "Emergency Physician",
      content: "Having medical alerts come through SafeZone101 helps us prepare better for incoming emergencies.",
      avatar: "/src/assets/image/nin2.jpeg"
    }
  ];

  const partners = [
    { name: "Local Police", icon: LocalPolice, count: "500+" },
    { name: "Fire Departments", icon: FireTruck, count: "250+" },
    { name: "Hospitals", icon: LocalHospital, count: "300+" },
    { name: "Schools", icon: School, count: "1200+" },
    { name: "Businesses", icon: Business, count: "5000+" }
  ];

  const pricingPlans = [
    {
      name: "Community Basic",
      price: "Free",
      description: "Perfect for small neighborhoods",
      features: [
        "Up to 100 active users",
        "Basic emergency alerts",
        "Community message board",
        "Email support",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Community Pro",
      price: "$49",
      period: "/month",
      description: "Ideal for larger communities",
      features: [
        "Up to 1,000 active users",
        "Advanced emergency alerts",
        "Real-time incident mapping",
        "Analytics dashboard",
        "24/7 phone support",
        "Integration with local authorities",
        "Custom alert categories"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For cities and large organizations",
      features: [
        "Unlimited users",
        "Full platform customization",
        "Dedicated account manager",
        "On-site training",
        "Advanced API access",
        "White-label options",
        "SLA guarantees"
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How quickly are emergency alerts sent?",
      answer: "Alerts are sent instantly through our real-time notification system, typically reaching users within 2-3 seconds of being triggered."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we use bank-level encryption and follow strict privacy protocols. Your data is never sold or shared without your explicit consent."
    },
    {
      question: "Can I integrate with existing emergency services?",
      answer: "Absolutely! SafeZone101 integrates seamlessly with local police, fire departments, and emergency medical services."
    },
    {
      question: "What happens if there's a false alarm?",
      answer: "Our system includes verification protocols and allows for quick alert cancellation. Users are immediately notified if an alert is retracted."
    },
    {
      question: "Do I need special equipment?",
      answer: "No special equipment needed! SafeZone101 works on any smartphone, tablet, or computer with internet access."
    },
    {
      question: "How much does it cost to get started?",
      answer: "We offer a free Community Basic plan for small neighborhoods. Larger communities can start with our Pro plan at $49/month."
    }
  ];

  const successStories = [
    {
      title: "Riverside Heights: 60% Crime Reduction",
      description: "After implementing SafeZone101, this community of 2,500 residents saw a dramatic decrease in property crime.",
      metrics: ["60% reduction in break-ins", "40% faster police response", "95% resident satisfaction"],
      image: "/src/assets/image/house.avif"
    },
    {
      title: "Downtown Business District: Zero Lost Time",
      description: "Emergency coordination helped 50+ businesses maintain operations during a major infrastructure incident.",
      metrics: ["Zero business closures", "100% employee safety", "2-hour full recovery"],
      image: "/src/assets/image/business.avif"
    },
    {
      title: "Maplewood School District: Perfect Safety Record",
      description: "Multi-school implementation resulted in seamless emergency drills and improved parent communication.",
      metrics: ["12 schools connected", "8,000+ students protected", "100% drill success rate"],
      image: "/src/assets/image/hero.avif"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-300 opacity-95" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: "url('/src/assets/image/hero-emergency.jpg')"
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8 transition-all hover:scale-105">
            <Security className="h-5 w-5" />
            <span className="text-sm font-medium">Trusted by 1000+ Communities Worldwide</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block">Your Community's</span>
            <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Digital Shield
            </span>
          </h1>

          <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            SafeZone101 connects neighbors, first responders, and local authorities in a powerful network 
            dedicated to keeping communities safe, informed, and prepared.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
  to="/signup"
  className="bg-white text-blue-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
>
  Get Started <ArrowForward className="h-5 w-5" />
</Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
              <PlayArrow className="h-5 w-5" /> Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold mb-2">
                  {stat.prefix}{stat.value}{stat.suffix}
                </div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs">Explore SafeZone101</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trusted by Communities Worldwide</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of communities that have made SafeZone101 their go-to safety platform
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {partners.map((partner, index) => {
              const IconComponent = partner.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-all group-hover:scale-110">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="font-semibold mb-1">{partner.name}</div>
                  <div className="text-sm text-gray-600">{partner.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real-time Dashboard Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">See SafeZone101 in Action</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get a glimpse of our intuitive dashboard that keeps your community connected and protected
            </p>
          </div>

          <div className="relative bg-white rounded-3xl shadow-xl p-8 lg:p-12">
            <img
              src="/src/assets/image/see action.avif"
              alt="SafeZone101 Dashboard"
              className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-md"
            />
            
            {/* Floating UI Elements */}
            <div className="absolute top-12 left-12 bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">All Clear</div>
                  <div className="text-xs text-gray-500">No active incidents</div>
                </div>
              </div>
            </div>

            <div className="absolute top-12 right-12 bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <People className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">1,247 Online</div>
                  <div className="text-xs text-gray-500">Community members</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 left-12 bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Speed className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">&lt; 30s</div>
                  <div className="text-xs text-gray-500">Response time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Community Safety</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to keep your community safe, connected, and informed
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl cursor-pointer transition-all ${
                      activeFeature === index
                        ? 'bg-blue-50 border-2 border-blue-200 shadow-md'
                        : 'bg-white hover:bg-blue-50'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl transition-all ${
                        activeFeature === index ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          activeFeature === index ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                      <ChevronRight className={`h-5 w-5 ml-auto mt-2 transition-all ${
                        activeFeature === index ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-md">
                <img
                  src={features[activeFeature].image}
                  alt={features[activeFeature].title}
                  className="w-full h-96 object-cover transition-all"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Live Updates</div>
                    <div className="text-sm text-gray-500">24/7 monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Real Results from Real Communities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how SafeZone101 has transformed safety and emergency response in communities like yours
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{story.title}</h3>
                  <p className="text-gray-600 mb-4">{story.description}</p>
                  <div className="space-y-2">
                    {story.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How SafeZone101 Works</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Simple, effective, and reliable community safety in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: GetApp,
                title: "1. Download & Register",
                description: "Get the app on any device and join your community's safety network"
              },
              {
                icon: Settings,
                title: "2. Set Up Your Profile",
                description: "Customize your alerts and connect with neighbors and authorities"
              },
              {
                icon: HealthAndSafety,
                title: "3. Stay Protected",
                description: "Receive real-time alerts and contribute to community safety"
              }
            ].map((step, index) => (
              <div key={index} className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-blue-100">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Community Plan</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Flexible pricing that grows with your community's needs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-8 rounded-2xl transition-all cursor-pointer ${
                  plan.popular 
                    ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-700 scale-105' 
                    : 'bg-white shadow-md hover:shadow-lg'
                }`}
                onClick={() => setActivePlan(index)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-lg opacity-75">{plan.period}</span>}
                  </div>
                  <p className={plan.popular ? 'text-blue-100' : 'text-gray-600'}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className={`h-5 w-5 ${
                        plan.popular ? 'text-white' : 'text-green-600'
                      }`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-full font-semibold transition-all ${
                  plan.popular 
                    ? 'bg-white text-blue-600 hover:bg-gray-100' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from real users who have experienced the SafeZone101 difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-800 mb-4">"{testimonial.content}"</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about SafeZone101
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <LiveHelp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Enterprise-Grade Security</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Your safety is our top priority. We use military-grade encryption and security protocols.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "End-to-End Encryption",
                description: "All communications are encrypted with AES-256 bit encryption"
              },
              {
                icon: Visibility,
                title: "Privacy First",
                description: "Your data belongs to you. We never sell or share personal information"
              },
              {
                icon: Cloud,
                title: "Secure Infrastructure",
                description: "Hosted on secure, compliant infrastructure with 99.9% uptime"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-blue-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Download */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Take SafeZone101 Everywhere</h2>
              <p className="text-xl text-gray-600 mb-8">
                Download our mobile app and stay connected to your community's safety network wherever you go.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: NotificationIcon, title: "Instant Alerts", desc: "Get notified immediately" },
                  { icon: GpsFixed, title: "Location Services", desc: "Precise emergency mapping" },
                  { icon: Contacts, title: "Emergency Contacts", desc: "Quick access to help" },
                  { icon: Timeline, title: "Incident History", desc: "Track safety trends" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{feature.title}</div>
                      <div className="text-xs text-gray-600">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                  <GetApp className="h-5 w-5" />
                  Download iOS
                </button>
                <button className="bg-white text-gray-800 border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
                  <GetApp className="h-5 w-5" />
                  Download Android
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/src/assets/image/take safety everywhere.avif"
                  alt="SafeZone101 Mobile App"
                  className="w-full max-w-md mx-auto rounded-3xl shadow-md"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-300 rounded-3xl blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Training & Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Training & Resources</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive training materials to help your community make the most of SafeZone101
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MenuBook,
                title: "Setup Guide",
                description: "Step-by-step community setup instructions",
                link: "View Guide"
              },
              {
                icon: School,
                title: "Video Tutorials",
                description: "Interactive training videos for all features",
                link: "Watch Now"
              },
              {
                icon: SupportAgent,
                title: "Webinar Series",
                description: "Live training sessions with our experts",
                link: "Register"
              },
              {
                icon: Assessment,
                title: "Best Practices",
                description: "Community safety guidelines and tips",
                link: "Learn More"
              }
            ].map((resource, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-all">
                  <resource.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{resource.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{resource.description}</p>
                <button className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-all">
                  {resource.link} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16  bg-blue-100 text-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make Your Community Safer?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of communities already using SafeZone101 to protect what matters most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button className="bg-white text-blue-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all">
              Schedule Demo
            </button>
          </div>

          <div className="text-sm text-black/80">
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;