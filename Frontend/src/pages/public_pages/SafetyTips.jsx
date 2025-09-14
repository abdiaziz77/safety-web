import { useState, useEffect } from 'react';

// Import icons (using Heroicons for this example)
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// Sample safety tips data
const safetyTipsData = [
  {
    id: 1,
    title: "Emergency Contacts",
    description: "Always have important emergency numbers saved in your phone and written down somewhere accessible.",
    icon: <PhoneIcon className="w-8 h-8" />,
    tags: ["emergency", "contacts", "phone"]
  },
  {
    id: 2,
    title: "Fire Safety",
    description: "Install smoke detectors on every level of your home and test them monthly.",
    icon: <ExclamationTriangleIcon className="w-8 h-8" />,
    tags: ["fire", "home", "safety"]
  },
  {
    id: 3,
    title: "First Aid Knowledge",
    description: "Learn basic first aid and CPR. These skills can save lives in emergency situations.",
    icon: <HeartIcon className="w-8 h-8" />,
    tags: ["first aid", "health", "emergency"]
  },
  {
    id: 4,
    title: "Cybersecurity",
    description: "Use strong, unique passwords and enable two-factor authentication on important accounts.",
    icon: <ShieldCheckIcon className="w-8 h-8" />,
    tags: ["cybersecurity", "online", "privacy"]
  },
  {
    id: 5,
    title: "Road Safety",
    description: "Always wear your seatbelt and ensure all passengers do too. Never drive under influence.",
    icon: <ShieldCheckIcon className="w-8 h-8" />,
    tags: ["road", "travel", "vehicle"]
  },
  {
    id: 6,
    title: "Natural Disasters",
    description: "Have an emergency kit ready with water, non-perishable food, flashlight, and first aid supplies.",
    icon: <ExclamationTriangleIcon className="w-8 h-8" />,
    tags: ["disaster", "preparation", "emergency"]
  }
];

export default function SafetyTipsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTips, setFilteredTips] = useState(safetyTipsData);
  const [showNoResults, setShowNoResults] = useState(false);

  // Filter tips based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTips(safetyTipsData);
      setShowNoResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = safetyTipsData.filter(tip => 
      tip.title.toLowerCase().includes(query) || 
      tip.description.toLowerCase().includes(query) ||
      tip.tags.some(tag => tag.toLowerCase().includes(query))
    );

    setFilteredTips(results);
    setShowNoResults(results.length === 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-blue-50 py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4 animate-fade-in">
              Stay Safe with SafeZone101
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your comprehensive guide to personal safety and emergency preparedness. 
              Learn practical tips to protect yourself and your loved ones.
            </p>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full"></div>
          <div className="absolute top-5 right-20 w-16 h-16 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-blue-500 rounded-full"></div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Featured Banner */}
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8 rounded-r-lg animate-slide-up">
          <p className="font-semibold">🔥 Tip of the Day: Always have emergency contacts saved in your phone and written down somewhere accessible.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 relative animate-fade-in">
          <div className="relative">
            <input
              type="text"
              placeholder="Search safety tips (e.g., Fire Safety, Emergency Contacts)"
              className="w-full px-4 py-3 pl-12 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Tips Grid */}
        {showNoResults ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-block p-4 mb-4 rounded-full bg-blue-100 text-blue-600">
              <ShieldCheckIcon className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">No safety tips available right now.</h3>
            <p className="text-blue-600">Stay tuned for updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredTips.map((tip) => (
              <div 
                key={tip.id} 
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    {tip.icon}
                  </div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">{tip.title}</h3>
                  <p className="text-gray-600">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-blue-50 rounded-2xl p-8 md:p-12 text-center mb-12 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-4">Share Safety Knowledge</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Help create a safer community by sharing these tips with your friends, family, and colleagues.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center mx-auto">
            Explore More Resources
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </main>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}