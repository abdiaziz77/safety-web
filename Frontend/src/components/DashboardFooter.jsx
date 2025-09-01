import React from 'react';
import { Shield, Heart, Copyright } from 'lucide-react';

const DashboardFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-500 mt-auto py-4 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 text-gray-700 mb-2 md:mb-0">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Protected by SafeZone101</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Copyright className="w-3 h-3" />
            <span>{new Date().getFullYear()} SafeZone101. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-700 mt-2 md:mt-0">
            <Heart className="w-3 h-3 text-red-500" />
            <span>Keeping communities safe</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;