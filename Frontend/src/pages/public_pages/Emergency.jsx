import React from 'react';
import { Shield, MapPin, Bell, CheckCircle, Heart, Users, AlertTriangle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const EmergencyPage = () => {
  const emergencyFeatures = [
    {
      icon: Bell,
      title: 'Instant Emergency Alerts',
      description: 'Get real-time notifications about emergencies around you with precise locations.',
      image: '/src/assets/image/insert.avif'
    },
    {
      icon: MapPin,
      title: 'Interactive Community Map',
      description: 'Visualize incidents, safe zones, and resources in your area in real-time.',
      image: '/src/assets/image/interactive.jpg'
    },
    {
      icon: Users,
      title: 'Community Support Network',
      description: 'Connect neighbors, volunteers, and authorities to coordinate emergency responses.',
      image: '/src/assets/image/net.png'
    }
  ];

  const tips = [
    {
      icon: Heart,
      title: 'Stay Calm',
      description: 'Keep calm and follow emergency protocols for your safety and others.',
      image: '/src/assets/image/stay.jpeg'
    },
    {
      icon: CheckCircle,
      title: 'Help Others',
      description: 'Assist neighbors and vulnerable individuals during emergencies.',
      image: '/src/assets/image/help others.jpeg'
    },
    {
      icon: Shield,
      title: 'Keep Updated',
      description: 'Stay informed with alerts and news from trusted sources.',
      image: '/src/assets/image/keep updated.png'
    }
  ];

  const emergencyContacts = [
    {
      service: 'Police Emergency',
      number: '911',
      description: 'For immediate police response'
    },
    {
      service: 'Fire Department',
      number: '911',
      description: 'For fire emergencies'
    },
    {
      service: 'Medical Emergency',
      number: '911',
      description: 'For ambulance dispatch'
    },
    {
      service: 'Poison Control',
      number: '1-800-222-1222',
      description: '24/7 poison assistance'
    }
  ];

  const emergencyProcedures = [
    {
      title: 'Medical Emergency',
      steps: [
        'Check scene safety before approaching',
        'Call 911 for serious injuries/illnesses',
        'Perform CPR if trained and needed',
        'Control bleeding with direct pressure'
      ]
    },
    {
      title: 'Fire Emergency',
      steps: [
        'Activate fire alarm if available',
        'Evacuate immediately if fire is large or spreading',
        'Use fire extinguifier only on small, contained fires',
        'Stay low to avoid smoke inhalation'
      ]
    },
    {
      title: 'Natural Disaster',
      steps: [
        'Follow official evacuation orders immediately',
        'Turn off utilities if instructed to do so',
        'Move to higher ground for floods',
        'Take shelter in basement for tornadoes'
      ]
    }
  ];

  return (
    <div className="font-sans bg-gray-50 text-gray-800">

      {/* Header Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Emergency Response System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fast, reliable, and community-driven emergency alerts at your fingertips.
          </p>
        </div>
      </section>

      {/* Split Section with Image and Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-6"
              >
                Immediate Emergency Assistance
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-600 mb-8"
              >
                Our platform connects you with emergency services and your community during critical situations. 
                Get real-time alerts, access emergency resources, and coordinate with neighbors when it matters most.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Report Emergency
                </button>
                <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2">
                  <Phone className="h-5 w-5" /> Call 101
                </button>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <img 
                src="/src/assets/image/police.webp" 
                alt="Emergency response team" 
                className="w-full h-96 object-cover" 
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Emergency Contacts
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-blue-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{contact.service}</h3>
                <div className="text-2xl font-bold text-blue-700 mb-2">{contact.number}</div>
                <p className="text-sm text-gray-600">{contact.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Emergency Features
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {emergencyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-center justify-center mb-4 rounded-full bg-blue-100 w-16 h-16 mx-auto">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center mb-4">{feature.description}</p>
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-48 object-cover rounded-xl mt-4" 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Procedures */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Emergency Procedures
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {emergencyProcedures.map((procedure, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white border border-blue-200 rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold mb-4 text-blue-800">{procedure.title}</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {procedure.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-gray-700">
                      {step}
                    </li>
                  ))}
                </ol>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips & Safety Advice */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Emergency Tips & Advice
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-200"
              >
                <div className="flex items-center justify-center mb-4 rounded-full bg-blue-100 w-16 h-16 mx-auto">
                  <tip.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{tip.title}</h3>
                <p className="text-gray-600 text-center mb-4">{tip.description}</p>
                <img 
                  src={tip.image} 
                  alt={tip.title} 
                  className="w-full h-48 object-cover rounded-xl mt-4" 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-100 text-black text-center">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Be Prepared. Stay Safe.</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Join our community and get instant alerts, support, and tips to keep everyone safe.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                Join Now
              </button>
              <button className="border-2 border-black text-black px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default EmergencyPage;