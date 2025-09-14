import { useState } from 'react';
import { 
  Phone, 
  Shield, 
  Heart, 
  Users,
  ArrowRight,
  Siren,
  Zap,
  MessageCircle,
  Award,
  Home,
  Car,
  PlusCircle,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EmergencyPage = () => {
  const [activeResource, setActiveResource] = useState(null);

  const features = [
    {
      title: "Instant Connection",
      description: "One-tap calling to emergency services with your location automatically shared",
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: "Multilingual Support",
      description: "Get assistance in over 40 languages with our interpreter service",
      icon: <MessageCircle className="w-6 h-6" />
    },
    {
      title: "Verified Responders",
      description: "All emergency personnel are verified and trained professionals",
      icon: <Award className="w-6 h-6" />
    }
  ];

  const emergencyResources = [
    {
      title: "First Aid Guide",
      description: "Learn basic first aid procedures for common emergencies",
      link: "#",
      icon: <PlusCircle className="w-8 h-8" />,
      content: `
        <h2 class="text-2xl font-bold text-blue-800 mb-4">First Aid Guide</h2>
        <p class="mb-4">Knowing basic first aid can save lives in emergency situations. Here are essential first aid procedures:</p>
        
        <h3 class="text-xl font-semibold text-blue-700 mb-2">CPR (Cardiopulmonary Resuscitation)</h3>
        <ol class="list-decimal pl-5 mb-4">
          <li class="mb-2">Check responsiveness and call for help</li>
          <li class="mb-2">Open the airway and check for breathing</li>
          <li class="mb-2">Perform 30 chest compressions (2 inches deep at 100-120 compressions per minute)</li>
          <li class="mb-2">Give 2 rescue breaths</li>
          <li class="mb-2">Continue until help arrives or the person starts breathing</li>
        </ol>
        
        <h3 class="text-xl font-semibold text-blue-700 mb-2">Bleeding Control</h3>
        <ul class="list-disc pl-5 mb-4">
          <li class="mb-2">Apply direct pressure with a clean cloth</li>
          <li class="mb-2">Elevate the injured area above heart level if possible</li>
          <li class="mb-2">Use pressure points if bleeding doesn't stop</li>
          <li class="mb-2">Apply a sterile bandage once bleeding stops</li>
        </ul>
        
        <h3 class="text-xl font-semibold text-blue-700 mb-2">Choking Response</h3>
        <p class="mb-4">For conscious adults and children over 1 year:</p>
        <ul class="list-disc pl-5">
          <li class="mb-2">Perform 5 back blows between shoulder blades</li>
          <li class="mb-2">Perform 5 abdominal thrusts (Heimlich maneuver)</li>
          <li class="mb-2">Alternate until object is dislodged or person becomes unconscious</li>
        </ul>
      `
    },
    {
      title: "Emergency Preparedness",
      description: "How to prepare for natural disasters and emergencies",
      link: "#",
      icon: <Home className="w-8 h-8" />,
      content: `
        <h2 class="text-2xl font-bold text-blue-800 mb-4">Emergency Preparedness Guide</h2>
        <p class="mb-4">Being prepared for emergencies can significantly reduce risks and help you respond effectively. Here's how to prepare:</p>
        
        <h3 class="text-xl font-semibold text-blue-700 mb-2">Emergency Kit Essentials</h3>
        <ul class="list-disc pl-5 mb-4">
          <li class="mb-2">Water (1 gallon per person per day for at least 3 days)</li>
          <li class="mb-2">Non-perishable food (3-day supply)</li>
          <li class="mb-2">Battery-powered or hand crank radio</li>
          <li class="mb-2">Flashlight and extra batteries</li>
          <li class="mb-2">First aid kit</li>
          <li class="mb-2">Whistle to signal for help</li>
          <li class="mb-2">Dust masks, plastic sheeting, and duct tape</li>
          <li class="mb-2">Moist towelettes, garbage bags, and plastic ties</li>
          <li class="mb-2">Wrench or pliers to turn off utilities</li>
          <li class="mb-2">Manual can opener</li>
          <li class="mb-2">Local maps</li>
          <li class="mb-2">Cell phone with chargers and backup battery</li>
        </ul>
        
        <h3 class="text-xl font-semibold text-blue-700 mb-2">Family Emergency Plan</h3>
        <ol class="list-decimal pl-5">
          <li class="mb-2">Identify meeting places in case you're separated</li>
          <li class="mb-2">Establish an out-of-town contact</li>
          <li class="mb-2">Plan how you'll evacuate and where you'll go</li>
          <li class="mb-2">Practice your plan every 6 months</li>
          <li class="mb-2">Teach children how to call emergency services</li>
        </ol>
      `
    },
    {
      title: "Evacuation Planning",
      description: "Create a family evacuation plan for emergencies",
      link: "#",
      icon: <Car className="w-8 h-8" />,
      content: `
        <h2 class="text-2xl font-bold text-blue-800 mb-4">Evacuation Planning Guide</h2>
        <p class="mb-4">A well-prepared evacuation plan can save precious time during emergencies. Follow these steps to create your plan:</p>
        
        <h3 class="text-xl font-semibold text-blue-700 mb-2">Step 1: Identify Evacuation Routes</h3>
        <ul class="list-disc pl-5 mb-4">
          <li class="mb-2">Identify at least two exit routes from each room</li>
          <li class="mb-2">Mark primary and secondary evacuation routes from your home</li>
          <li class="mb-2">Identify community evacuation routes and shelters</li>
          <li class="mb-2">Account for different types of disasters (fire, flood, earthquake)</li>
        </ul>
        
        <h3 class="text-xl font-semibold text-blue-700 mb-2">Step 2: Prepare Your Go-Bag</h3>
        <p class="mb-2">Each family member should have a ready-to-go bag containing:</p>
        <ul class="list-disc pl-5 mb-4">
          <li class="mb-2">Essential medications and copies of prescriptions</li>
          <li class="mb-2">Important documents (IDs, insurance papers, bank records)</li>
          <li class="mb-2">Emergency contact information</li>
          <li class="mb-2">Cash in small denominations</li>
          <li class="mb-2">Spare keys to your house and car</li>
          <li class="mb-2">Portable phone charger and power bank</li>
          <li class="mb-2">Personal hygiene items</li>
          <li class="mb-2">Change of clothing and sturdy shoes</li>
          <li class="mb-2">Bottled water and energy bars</li>
        </ul>
        
        <h3 class="text-xl font-semibold text-blue-700 mb-2">Step 3: Practice and Communicate</h3>
        <ol class="list-decimal pl-5">
          <li class="mb-2">Practice your evacuation plan twice a year</li>
          <li class="mb-2">Ensure all family members know the plan</li>
          <li class="mb-2">Assign responsibilities (who grabs the pet, who gets the go-bags)</li>
          <li class="mb-2">Establish a communication plan if separated</li>
          <li class="mb-2">Identify a safe meeting place outside your home</li>
        </ol>
      `
    }
  ];

  const handleCall = () => {
    alert("Calling emergency services at 101");
  };

  const openResource = (resource) => {
    setActiveResource(resource);
  };

  const closeResource = () => {
    setActiveResource(null);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Bubble Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full"></div>
        <div className="absolute top-5 right-20 w-16 h-16 bg-blue-500 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-500 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-blue-500 rounded-full"></div>
        <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-blue-400 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/3 w-14 h-14 bg-blue-400 rounded-full"></div>
        <div className="absolute top-2/3 left-1/2 w-18 h-18 bg-red-400 rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-10 h-10 bg-red-400 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-red-400 rounded-full"></div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12 md:py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 mb-6">
            <Siren className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">Emergency Assistance 101</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            One number for all emergencies. Fast, reliable, and life-saving assistance when you need it most.
          </p>
          
          {/* Big Call Button */}
          <div className="flex justify-center mb-10">
            <button 
              onClick={handleCall}
              className="w-24 h-24 bg-blue-600 hover:bg-red-600 text-white rounded-full flex items-center justify-center pulse-animation shadow-lg transition-colors duration-300"
            >
              <Phone className="w-10 h-10" />
            </button>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-800">Call 101 for emergencies</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-blue-50 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Why Trust Emergency 101?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-md border border-blue-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Tips Section */}
      <section className="py-12 bg-blue-800 text-white relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Emergency Preparedness Tips</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-700 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Know Your Location</h3>
              <p className="text-blue-100">Be prepared to provide your exact address or location when calling 101.</p>
            </div>
            
            <div className="bg-blue-700 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stay Calm</h3>
              <p className="text-blue-100">Take a deep breath and speak clearly to help the operator understand your emergency.</p>
            </div>
            
            <div className="bg-blue-700 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Don't Hang Up</h3>
              <p className="text-blue-100">Stay on the line until the operator tells you it's okay to disconnect.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-12 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Emergency Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {emergencyResources.map((resource, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  {resource.icon}
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <button 
                  onClick={() => openResource(resource)}
                  className="text-blue-600 font-medium flex items-center"
                >
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="bg-blue-50 rounded-2xl p-8 md:p-12 text-center relative z-10 mx-4 md:mx-auto max-w-6xl mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-4">Need Immediate Assistance?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          If you're experiencing an emergency, contact the appropriate service above or report it directly.
        </p>
        <Link 
          to="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
        >
          Report an Emergency
        </Link>
      </div>

      {/* Resource Modal */}
      {activeResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-800">{activeResource.title}</h3>
              <button onClick={closeResource} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div dangerouslySetInnerHTML={{ __html: activeResource.content }} />
            </div>
          </div>
        </div>
      )}

      {/* Add some custom styles */}
      <style jsx>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default EmergencyPage;