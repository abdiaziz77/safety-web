import React, { useEffect, useState } from 'react';

const CommunityPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Trusted community images for carousel
  const communityImages = [
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];

  // Auto-rotate images in carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === communityImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    
    return () => clearInterval(interval);
  }, [communityImages.length]);

  // Animate sections on mount using Intersection Observer
  useEffect(() => {
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    sections.forEach(section => observer.observe(section));
  }, []);

  // Navigate carousel
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === communityImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? communityImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16 bg-white">

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-green-700">Our Community</h1>
        <p className="max-w-3xl mx-auto text-xl text-gray-600">
          SafeZone101 thrives because of our trusted community committed to safety and support. 
          Together, we create safer environments for everyone.
        </p>
      </section>

      {/* Trusted Community */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-600">Trusted Community</h2>
            <p className="text-lg text-gray-600 mb-6">
              Our members are the foundation of SafeZone101. Through collaboration and vigilance, 
              we've built a network dedicated to safety and mutual support.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Verified Members</h3>
                  <p className="text-gray-600">All community members undergo verification for enhanced security</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Quick Response</h3>
                  <p className="text-gray-600">Community alerts enable rapid response to safety concerns</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Active Network</h3>
                  <p className="text-gray-600">Thousands of members working together for community safety</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Image Carousel */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-96">
              <img 
                src={communityImages[currentImageIndex]} 
                alt="Community members" 
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              
              {/* Navigation buttons */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition shadow-md"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition shadow-md"
                aria-label="Next image"
              >
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {communityImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition ${
                      index === currentImageIndex ? 'bg-green-600' : 'bg-white/70'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out bg-green-50 rounded-2xl p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-700">Community Impact</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-green-600">Safety Incidents Reduced</h3>
            <p className="text-3xl font-bold text-gray-800">42%</p>
            <p className="text-gray-600 mt-2">in neighborhoods with active SafeZone communities</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-green-600">Active Members</h3>
            <p className="text-3xl font-bold text-gray-800">15K+</p>
            <p className="text-gray-600 mt-2">contributing to community safety daily</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586M9 10h.01M9 10a1 1 0 000 2m5.434-3.536A1 1 0 0115 10m0 5a1 1 0 100-2 1 1 0 000 2zm-5.434.536A1 1 0 019 15m0-5a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-green-600">Response Time</h3>
            <p className="text-3xl font-bold text-gray-800">&lt; 8min</p>
            <p className="text-gray-600 mt-2">average community response to safety alerts</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-700">How Our Community Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-green-600 text-4xl font-bold mb-4">01</div>
            <h3 className="text-xl font-semibold mb-3 text-green-600">Report & Alert</h3>
            <p className="text-gray-600">
              Members report safety concerns through our verified platform, triggering immediate community alerts.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-green-600 text-4xl font-bold mb-4">02</div>
            <h3 className="text-xl font-semibold mb-3 text-green-600">Respond & Support</h3>
            <p className="text-gray-600">
              Nearby members receive notifications and can provide assistance or verify situations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-green-600 text-4xl font-bold mb-4">03</div>
            <h3 className="text-xl font-semibold mb-3 text-green-600">Resolve & Improve</h3>
            <p className="text-gray-600">
              Incidents are documented to improve future responses and identify safety patterns.
            </p>
          </div>
        </div>
      </section>

      {/* Community Engagement */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out bg-green-50 rounded-2xl p-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-700">Engage With Our Community</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of members who are making their neighborhoods safer through active participation, 
              awareness campaigns, and community events.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">✓</div>
                <p className="text-gray-700">Safety workshops and training sessions</p>
              </div>
              <div className="flex items-center">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">✓</div>
                <p className="text-gray-700">Neighborhood watch programs</p>
              </div>
              <div className="flex items-center">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">✓</div>
                <p className="text-gray-700">Community response teams</p>
              </div>
              <div className="flex items-center">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">✓</div>
                <p className="text-gray-700">Regular safety awareness campaigns</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-6 text-center text-green-600">Join Our Next Event</h3>
            
            <div className="border-l-4 border-green-500 pl-4 mb-6">
              <p className="font-semibold text-gray-800">Community Safety Workshop</p>
              <p className="text-gray-600">September 25, 2023 • 6:00 PM</p>
              <p className="text-gray-600">Community Center, Main Street</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4 mb-6">
              <p className="font-semibold text-gray-800">Neighborhood Watch Training</p>
              <p className="text-gray-600">October 3, 2023 • 7:00 PM</p>
              <p className="text-gray-600">Online Session</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-semibold text-gray-800">SafeZone101 Community Meetup</p>
              <p className="text-gray-600">October 15, 2023 • 12:00 PM</p>
              <p className="text-gray-600">City Park Pavilion</p>
            </div>
            
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold mt-8 hover:bg-green-700 transition">
              RSVP for Events
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-700">Community Stories</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl border border-green-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mr-4">JD</div>
              <div>
                <p className="font-semibold">Jane Doe</p>
                <p className="text-green-600">Community Leader</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "SafeZone101 transformed our neighborhood. We've reduced safety incidents by over 40% 
              in just six months through our community watch program. The platform makes it easy to 
              coordinate and respond quickly."
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-green-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mr-4">MS</div>
              <div>
                <p className="font-semibold">Mike Smith</p>
                <p className="text-green-600">Active Member</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "I've never felt safer in my community. The quick response when I reported suspicious 
              activity was impressive. Within minutes, several neighbors arrived to provide support 
              until authorities came."
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out text-center py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-700">Join Our Safety Community</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
          Become part of a network that's making neighborhoods safer across the country.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Sign Up Now
          </button>
          <button className="border border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* Additional styles for animation */}
      <style jsx>{`
        .fade-in-section {
          opacity: 0;
          transform: translateY(20px);
        }
        .fade-in-section.appear {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default CommunityPage;