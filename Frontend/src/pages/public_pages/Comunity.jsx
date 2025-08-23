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
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16 bg-gray-50">

      {/* Trusted Community */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-blue-600">Trusted Community</h2>
        <p className="max-w-3xl mx-auto text-center text-gray-700 mb-10 text-lg">
          SafeZone101 thrives because of a trusted community committed to safety and support. 
          Our members are dedicated to creating a safer environment for everyone.
        </p>
        
        {/* Image Carousel */}
        <div className="relative max-w-4xl mx-auto mb-12 rounded-xl overflow-hidden shadow-lg">
          <div className="relative h-96">
            <img 
              src={communityImages[currentImageIndex]} 
              alt="Community members" 
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            
            {/* Navigation buttons */}
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
              aria-label="Next image"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-blue-500">Reliable Members</h3>
            <p className="text-gray-600">
              Our community is built on trust, with verified members committed to safety.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-blue-500">Verified Reports</h3>
            <p className="text-gray-600">
              We ensure integrity by verifying reports and fostering accountability.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-blue-500">Community Leaders</h3>
            <p className="text-gray-600">
              Leaders actively promote safety initiatives and support new members.
            </p>
          </div>
        </div>
      </section>

      {/* How Community Takes Action */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-600">How Community Takes Action</h2>
            <p className="text-lg text-gray-700 mb-6">
              Our community actively engages in safety measures, reporting incidents, and supporting each other.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Community taking action" 
              className="w-full h-72 object-cover" 
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-green-500">Reporting Incidents</h3>
            <p className="text-gray-600">
              Members report unsafe activities, enabling quick responses and intervention.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-green-500">Organizing Campaigns</h3>
            <p className="text-gray-600">
              Community organizes awareness campaigns and safety workshops.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-green-500">Supporting Victims</h3>
            <p className="text-gray-600">
              Members support victims and offer assistance during emergencies.
            </p>
          </div>
        </div>
      </section>

      {/* How They Are Involved with SafeZone101 */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Community involvement" 
              className="w-full h-72 object-cover" 
            />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-purple-600">How They Are Involved with SafeZone101</h2>
            <p className="text-lg text-gray-700">
              Our community members collaborate with SafeZone101 by volunteering, providing feedback, and leading initiatives.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-purple-500">Volunteer Programs</h3>
            <p className="text-gray-600">
              Join our volunteer initiatives to help monitor safety and organize community events.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-purple-500">Providing Feedback</h3>
            <p className="text-gray-600">
              Your suggestions help us improve our safety tools and community experience.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-purple-500">Leadership Roles</h3>
            <p className="text-gray-600">
              Become a community leader and help drive safety initiatives and outreach.
            </p>
          </div>
        </div>
      </section>

      {/* Community Events */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-600">Community Events</h2>
            <p className="text-lg text-gray-700">
              Join our regular safety workshops, neighborhood patrols, and awareness days.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Community events" 
              className="w-full h-72 object-cover" 
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-yellow-500">Safety Workshops</h3>
            <p className="text-gray-600">
              Learn safety tips and emergency response skills from experts.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-yellow-500">Neighborhood Patrols</h3>
            <p className="text-gray-600">
              Volunteer to patrol your neighborhood and keep an eye out for safety concerns.
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Success stories" 
              className="w-full h-72 object-cover" 
            />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-700">Success Stories</h2>
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2 text-green-500">Saved a Child</h3>
                <p className="text-gray-600 mb-2">
                  Thanks to quick reporting from community members, a child was safely recovered.
                </p>
                <p className="text-sm text-gray-500">- Community Leader, Jane D.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2 text-green-500">Neighborhood Cleanup</h3>
                <p className="text-gray-600 mb-2">
                  A community-led cleanup improved safety and aesthetics of the area.
                </p>
                <p className="text-sm text-gray-500">- Resident, Mike S.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved Call-to-Action */}
      <section className="fade-in-section opacity-0 translate-y-10 transition-transform transition-opacity duration-700 ease-in-out">
        <div className="text-center bg-blue-100 p-12 rounded-xl">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-blue-700">Get Involved Today!</h2>
            <p className="mb-8 text-gray-700 text-lg">
              Join our community efforts to create a safer neighborhood. Volunteer, give feedback, or lead initiatives.
            </p>
            <a
              href="/signup"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
            >
              Join Now
            </a>
          </div>
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