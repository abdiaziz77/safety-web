import React, { useState } from 'react';
import { 
  Shield, Users, AlertTriangle, MessageSquare, Map, 
  BookOpen, Lock, Heart, Star, ChevronDown, ChevronUp,
  HelpCircle, Phone, Mail, MessageCircle
} from 'lucide-react';

// Image URLs for each category
const categoryImages = {
  'General Information': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Community Involvement': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Safety & Privacy': 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Features & Usage': 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Partnerships & Collaboration': 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Events & Success Stories': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
};

const faqData = [
  {
    category: 'General Information',
    icon: Shield,
    questions: [
      {
        question: 'What is SafeZone101?',
        answer: 'SafeZone101 is a community-driven safety platform dedicated to creating a secure environment by encouraging reporting, collaboration, and proactive safety measures.',
      },
      {
        question: 'How does SafeZone101 ensure trust within the community?',
        answer: 'We verify reports, promote transparency, and empower community leaders to foster trust and accountability among members.',
      },
      {
        question: 'How can I report an incident?',
        answer: 'You can report incidents directly through our platform using the "Report" feature, or contact local authorities if necessary. All reports are reviewed and verified by trusted members.',
      },
      {
        question: 'Is SafeZone101 available in my area?',
        answer: 'We are continuously expanding to new communities. Check our coverage map or contact us to see if we serve your neighborhood.',
      },
    ],
  },
  {
    category: 'Community Involvement',
    icon: Users,
    questions: [
      {
        question: 'Can I volunteer or become a community leader?',
        answer: 'Yes! SafeZone101 encourages community involvement. You can sign up as a volunteer or apply for leadership roles to help organize safety initiatives.',
      },
      {
        question: 'How can I get involved with SafeZone101?',
        answer: 'Join our volunteer programs, participate in community events, provide feedback, or become a community leader to help make a difference.',
      },
      {
        question: 'Are there training programs for volunteers?',
        answer: 'Yes, we offer comprehensive training programs for all volunteers and community leaders to ensure everyone is prepared to contribute effectively.',
      },
    ],
  },
  {
    category: 'Safety & Privacy',
    icon: Lock,
    questions: [
      {
        question: 'What types of incidents can I report?',
        answer: 'You can report safety hazards, suspicious activities, emergencies, or any situation that threatens community safety.',
      },
      {
        question: 'Is my personal information protected?',
        answer: 'Absolutely. We prioritize your privacy. Personal data is securely stored and only used for safety purposes, adhering to strict privacy policies.',
      },
      {
        question: 'Can I report incidents anonymously?',
        answer: 'Yes, we offer anonymous reporting options to protect your privacy while still allowing you to contribute to community safety.',
      },
    ],
  },
  {
    category: 'Features & Usage',
    icon: MessageSquare,
    questions: [
      {
        question: 'How do I receive emergency alerts?',
        answer: 'You can choose to receive alerts via push notifications, SMS, or email based on your preferences in your account settings.',
      },
      {
        question: 'Is there a mobile app available?',
        answer: 'Yes, SafeZone101 offers mobile apps for both iOS and Android devices, providing full functionality on the go.',
      },
      {
        question: 'Can I communicate with my neighbors through the platform?',
        answer: 'Yes, our community messaging feature allows you to connect with neighbors and coordinate safety efforts.',
      },
    ],
  },
  {
    category: 'Partnerships & Collaboration',
    icon: Heart,
    questions: [
      {
        question: 'How does SafeZone101 collaborate with local authorities?',
        answer: 'We work closely with local authorities to ensure reported issues are addressed promptly while maintaining community trust and safety.',
      },
      {
        question: 'Can my organization partner with SafeZone101?',
        answer: 'Yes, we welcome partnerships with community organizations, businesses, and local government agencies.',
      },
    ],
  },
  {
    category: 'Events & Success Stories',
    icon: Star,
    questions: [
      {
        question: 'How can I participate in community events?',
        answer: 'Join our safety workshops, neighborhood patrols, and awareness days by signing up through our platform.',
      },
      {
        question: 'Are there any success stories?',
        answer: 'Yes! We have numerous success stories where community efforts have led to safer neighborhoods and saved lives.',
      },
      {
        question: 'How often are community events held?',
        answer: 'We host regular monthly events with additional special workshops and training sessions throughout the year.',
      },
    ],
  },
];

const FAQSection = ({ category, questions, icon: Icon, isActive }) => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleIndex = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className={`mb-12 bg-white rounded-2xl shadow-md overflow-hidden ${isActive ? '' : 'hidden'}`}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center">
        <div className="bg-white/20 p-3 rounded-xl mr-4">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">{category}</h3>
      </div>
      <div className="p-6 space-y-4">
        {questions.map((qa, index) => (
          <div key={index} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <button
              className="w-full px-6 py-5 flex justify-between items-center focus:outline-none hover:bg-blue-50 transition-colors rounded-lg"
              onClick={() => toggleIndex(index)}
            >
              <span className="text-lg font-medium text-gray-800 text-left">{qa.question}</span>
              {openIndexes.includes(index) ? (
                <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0 ml-4" />
              ) : (
                <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0 ml-4" />
              )}
            </button>
            {openIndexes.includes(index) && (
              <div className="px-6 pb-5 text-gray-700 transition-all duration-300">
                <p className="leading-relaxed">{qa.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FaqPage = () => {
  const [activeCategory, setActiveCategory] = useState('General Information');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter questions based on search query
  const filteredFaqData = faqData.map(section => ({
    ...section,
    questions: section.questions.filter(qa => 
      qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qa.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <HelpCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers to common questions about SafeZone101 and how we're making communities safer.
          </p>
          
          <div className="bg-white rounded-xl p-4 shadow-md inline-flex flex-wrap justify-center gap-2">
            {faqData.map((section) => (
              <button
                key={section.category}
                onClick={() => setActiveCategory(section.category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === section.category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-12">
          <div className="flex items-center max-w-2xl mx-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <HelpCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <button 
              className="ml-4 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Main Content with Image */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* FAQ Sections */}
          <div className="lg:col-span-2">
            {searchQuery ? (
              // Show all sections when searching
              filteredFaqData.map((section, idx) => (
                <FAQSection 
                  key={idx} 
                  {...section} 
                  isActive={true}
                />
              ))
            ) : (
              // Show only active category when not searching
              faqData.map((section, idx) => (
                <FAQSection 
                  key={idx} 
                  {...section} 
                  isActive={section.category === activeCategory}
                />
              ))
            )}
          </div>

          {/* Dynamic Image Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-md overflow-hidden">
              <img 
                src={categoryImages[activeCategory]} 
                alt={activeCategory}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {activeCategory}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeCategory === 'General Information' && 'Learn about SafeZone101 and how it works to keep communities safe.'}
                  {activeCategory === 'Community Involvement' && 'Discover how you can get involved and make a difference in your community.'}
                  {activeCategory === 'Safety & Privacy' && 'Understand how we protect your information and ensure your safety.'}
                  {activeCategory === 'Features & Usage' && 'Explore the features that make SafeZone101 an essential safety tool.'}
                  {activeCategory === 'Partnerships & Collaboration' && 'See how we work with organizations and authorities.'}
                  {activeCategory === 'Events & Success Stories' && 'Get inspired by community success stories and upcoming events.'}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                    Related to your question
                  </span>
                </div>
              </div>
            </div>

           
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="flex items-center justify-center bg-white/20 p-4 rounded-lg">
              <Phone className="h-6 w-6 mr-3" />
              <span className="font-semibold">1-800-SAFE-ZONE</span>
            </div>
            <div className="flex items-center justify-center bg-white/20 p-4 rounded-lg">
              <Mail className="h-6 w-6 mr-3" />
              <span className="font-semibold">support@safezone101.com</span>
            </div>
            <div className="flex items-center justify-center bg-white/20 p-4 rounded-lg">
              <MessageCircle className="h-6 w-6 mr-3" />
              <span className="font-semibold">Live Chat</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-md p-12 text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the SafeZone101 Community Today!</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of a growing network dedicated to creating safer neighborhoods for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
              Sign Up Now
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;