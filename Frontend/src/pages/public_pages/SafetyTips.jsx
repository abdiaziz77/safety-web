import React from 'react';
import { 
  Shield, Home, Car, Users, Phone, Eye, AlertTriangle, CheckCircle,
  Heart, Flame, AlertCircle, Siren, Ambulance, Crosshair,
  ClipboardList, MapPin, Clock, Radio, Battery, Droplets,
  Map, Zap, Wifi, BookOpen, AlertOctagon
} from 'lucide-react';

function SafetyTips() {
  // Emergency type colors
  const emergencyColors = {
    police: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    fire: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    medical: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    hazard: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    general: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
  };

  // Safety categories
  const categories = [
    {
      icon: Home,
      title: 'Home Safety',
      tips: [
        'Always lock doors and windows when leaving home',
        'Install security cameras or doorbell cameras',
        'Keep exterior areas well-lit at night',
        'Don\'t hide spare keys in obvious places',
        'Get to know your neighbors',
        'Install smoke and carbon monoxide detectors',
      ],
    },
    {
      icon: Car,
      title: 'Transportation Safety',
      tips: [
        'Always wear your seatbelt',
        'Don\'t text or call while driving',
        'Keep car doors locked, especially at night',
        'Park in well-lit, populated areas',
        'Keep emergency kit in your vehicle',
        'Stay aware when using public transportation',
      ],
    },
    {
      icon: Users,
      title: 'Personal Safety',
      tips: [
        'Trust your instincts if something feels wrong',
        'Stay aware of your surroundings',
        'Avoid walking alone in isolated areas at night',
        'Let someone know your whereabouts',
        'Carry a charged phone for emergencies',
        'Learn basic self-defense techniques',
      ],
    },
    {
      icon: Eye,
      title: 'Situational Awareness',
      tips: [
        'Observe unusual behavior or activities',
        'Report suspicious activities promptly',
        'Avoid wearing headphones in unfamiliar areas',
        'Make eye contact with people around you',
        'Know your escape routes',
        'Stay alert in crowded places',
      ],
    },
  ];

  // Emergency type sections
  const emergencyTypes = [
    {
      type: 'police',
      icon: Shield,
      title: 'Police & Security',
      description: 'Safety tips for crime prevention and security',
      tips: [
        'Program local police non-emergency number in your phone',
        'Report suspicious activity immediately',
        'Avoid confronting suspicious individuals yourself',
        'Know your neighborhood watch program',
        'Document valuable possessions with photos/serial numbers',
        'Use timers for lights when away from home'
      ],
      emergencyContacts: [
        { service: 'Police Emergency', number: '911', description: 'For immediate police response' },
        { service: 'Police Non-Emergency', number: '311', description: 'For non-urgent police matters' },
      ]
    },
    {
      type: 'fire',
      icon: Flame,
      title: 'Fire Safety',
      description: 'Prevention and response for fire emergencies',
      tips: [
        'Install smoke detectors on every floor',
        'Create and practice a fire escape plan',
        'Keep fire extinguishers accessible',
        'Never leave cooking unattended',
        'Check electrical cords for damage',
        'Store flammable materials properly'
      ],
      emergencyContacts: [
        { service: 'Fire Emergency', number: '911', description: 'For fire department response' },
        { service: 'Fire Prevention Bureau', number: '1-800-555-FIRE', description: 'Fire safety inspections' },
      ]
    },
    {
      type: 'medical',
      icon: Heart,
      title: 'Medical Emergencies',
      description: 'Health emergency preparedness',
      tips: [
        'Learn basic first aid and CPR',
        'Keep a well-stocked first aid kit',
        'Know the signs of stroke (FAST: Face, Arms, Speech, Time)',
        'Recognize heart attack symptoms',
        'Keep list of medications/allergies with you',
        'Identify emergency rooms near your locations'
      ],
      emergencyContacts: [
        { service: 'Medical Emergency', number: '911', description: 'For ambulance dispatch' },
        { service: 'Poison Control', number: '1-800-222-1222', description: '24/7 poison assistance' },
      ]
    },
    {
      type: 'hazard',
      icon: AlertOctagon,
      title: 'Hazard Preparedness',
      description: 'For natural disasters and environmental hazards',
      tips: [
        'Identify safe spots in your home for different hazards',
        'Know evacuation routes from your area',
        'Stay informed about weather alerts',
        'Secure heavy furniture that could topple',
        'Learn how to shut off utilities',
        'Prepare for power outages'
      ],
      emergencyContacts: [
        { service: 'Emergency Management', number: '1-800-EMERGENCY', description: 'Disaster response' },
        { service: 'Weather Alert Hotline', number: '1-800-WEATHER', description: 'Severe weather updates' },
      ]
    }
  ];

  // Emergency preparedness items
  const preparednessItems = [
    { name: 'First aid kit', icon: Crosshair, category: 'medical' },
    { name: 'Fire extinguisher', icon: Flame, category: 'fire' },
    { name: 'Emergency contact list', icon: ClipboardList, category: 'general' },
    { name: 'Flashlight with extra batteries', icon: Battery, category: 'general' },
    { name: 'Battery-powered radio', icon: Radio, category: 'general' },
    { name: '3-day supply of water (1 gal/person/day)', icon: Droplets, category: 'general' },
    { name: 'Non-perishable food', icon: null, category: 'general' },
    { name: 'Medications (7-day supply)', icon: null, category: 'medical' },
    { name: 'Whistle to signal for help', icon: null, category: 'general' },
    { name: 'Dust masks', icon: null, category: 'hazard' },
    { name: 'Local maps', icon: MapPin, category: 'general' },
    { name: 'Phone charger/battery pack', icon: Battery, category: 'general' }
  ];

  // Emergency response procedures
  const emergencyProcedures = [
    {
      type: 'police',
      title: 'Crime in Progress',
      steps: [
        'Stay calm and assess the situation',
        'If safe, move to a secure location',
        'Call 911 and provide details (location, suspect description, weapons)',
        'Follow police instructions when they arrive',
        'Preserve evidence if possible'
      ]
    },
    {
      type: 'fire',
      title: 'Fire Emergency',
      steps: [
        'Activate fire alarm if available',
        'Evacuate immediately if fire is large or spreading',
        'Use fire extinguisher only on small, contained fires',
        'Stay low to avoid smoke inhalation',
        'Feel doors for heat before opening',
        'Never use elevators during a fire'
      ]
    },
    {
      type: 'medical',
      title: 'Medical Emergency',
      steps: [
        'Check scene safety before approaching',
        'Call 911 for serious injuries/illnesses',
        'Perform CPR if trained and needed',
        'Control bleeding with direct pressure',
        'Keep patient still if spinal injury suspected',
        'Monitor breathing until help arrives'
      ]
    },
    {
      type: 'hazard',
      title: 'Natural Disaster',
      steps: [
        'Follow official evacuation orders immediately',
        'Turn off utilities if instructed to do so',
        'Move to higher ground for floods',
        'Take shelter in basement for tornadoes',
        'Stay indoors with windows closed for chemical hazards',
        'Listen to emergency broadcasts for updates'
      ]
    }
  ];

  // SafeZone101 Features
  const safeZoneFeatures = [
    {
      icon: AlertCircle,
      title: "Real-time Emergency Alerts",
      description: "Receive instant notifications about emergencies in your area with precise location details and severity levels."
    },
    {
      icon: Map,
      title: "Live Community Map",
      description: "View active incidents, safe zones, and emergency resources on an interactive real-time map."
    },
    {
      icon: Users,
      title: "Neighborhood Watch",
      description: "Connect with neighbors and local authorities to keep your community safe together."
    },
    {
      icon: Crosshair,
      title: "Emergency Guides",
      description: "Access step-by-step instructions for various emergency situations right when you need them."
    },
    {
      icon: Wifi,
      title: "Offline Access",
      description: "Critical safety information available even without internet connection during emergencies."
    },
    {
      icon: BookOpen,
      title: "Safety Resources",
      description: "Comprehensive library of safety tips, checklists, and preparedness guides for all scenarios."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Safety Tips & Resources
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Essential safety information for all emergency situations including medical, fire, hazards, and police-related incidents.
            </p>
          </div>
        </div>
      </section>

      {/* SafeZone101 Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              SafeZone101 Safety Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform provides comprehensive safety tools and resources to protect you and your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeZoneFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-xl border border-gray-200 p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Type Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Emergency Preparedness by Type
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Specific guidelines for different types of emergencies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyTypes.map((emergency, index) => {
              const Icon = emergency.icon;
              const colors = emergencyColors[emergency.type];
              return (
                <div 
                  key={index} 
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-6 transition-all hover:shadow-lg hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white shadow-sm mb-4 mx-auto">
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <h3 className={`text-xl font-semibold ${colors.text} mb-3 text-center`}>{emergency.title}</h3>
                  <p className="text-gray-600 text-sm text-center mb-4">{emergency.description}</p>
                  
                  <div className="space-y-3">
                    {emergency.tips.slice(0, 3).map((tip, tipIndex) => (
                      <div key={tipIndex} className="flex items-start space-x-3">
                        <CheckCircle className={`h-4 w-4 ${colors.text} mt-1 flex-shrink-0`} />
                        <span className="text-sm text-gray-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Procedures */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Emergency Response Procedures
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Step-by-step guidance for different emergency scenarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {emergencyProcedures.map((procedure, index) => {
              const colors = emergencyColors[procedure.type];
              return (
                <div 
                  key={index} 
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-6 transition-all hover:shadow-lg`}
                >
                  <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>{procedure.title}</h3>
                  <ol className="space-y-3 list-decimal list-inside">
                    {procedure.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-gray-700">
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Emergency Contacts
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Important phone numbers to keep readily available
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyTypes.flatMap(emergency => 
              emergency.emergencyContacts.map((contact, index) => {
                const colors = emergencyColors[emergency.type];
                return (
                  <div 
                    key={`${emergency.type}-${index}`} 
                    className={`rounded-xl border-l-4 ${colors.border.replace('border', 'border-l')} bg-white p-6 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{contact.service}</h3>
                      <span className={`${colors.bg.replace('bg', 'text')} text-xs font-medium px-2 py-1 rounded-full`}>
                        {emergency.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Phone className={`h-4 w-4 ${colors.text}`} />
                      <span className={`text-lg font-mono font-semibold ${colors.text}`}>{contact.number}</span>
                    </div>
                    <p className="text-sm text-gray-600">{contact.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Emergency Preparedness Kit */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Emergency Preparedness Kit
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Be prepared for emergencies by keeping these essential items readily available 
                in your home, car, and workplace.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-yellow-500 font-semibold">Important Reminder</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Review and update your emergency kit every 6 months. Check expiration dates 
                  on food, water, and medications. Replace batteries and update contact information.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Essential Items Checklist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preparednessItems.map((item, index) => {
                  const colors = emergencyColors[item.category];
                  const IconComponent = item.icon || CheckCircle;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <IconComponent className={`h-5 w-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Safety Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive safety guidance for different aspects of daily life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Report Safety Concerns */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <Shield className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Community Safety is Everyone's Responsibility
            </h2>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Your awareness and quick reporting can prevent emergencies and save lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <span className="bg-white/20 text-white border border-white/30 text-sm px-4 py-2 rounded-full">
                <AlertTriangle className="h-4 w-4 inline mr-1" /> Report suspicious activity
              </span>
              <span className="bg-white/20 text-white border border-white/30 text-sm px-4 py-2 rounded-full">
                <Phone className="h-4 w-4 inline mr-1" /> Know when to call 911
              </span>
              <span className="bg-white/20 text-white border border-white/30 text-sm px-4 py-2 rounded-full">
                <Users className="h-4 w-4 inline mr-1" /> Join neighborhood watch
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SafetyTips;