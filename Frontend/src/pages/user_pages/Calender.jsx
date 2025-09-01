import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FiCalendar, FiSearch } from 'react-icons/fi';

const CalendarPage = () => {
  // Get today's date in a formatted string
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <FiCalendar className="mr-2" />
                {formattedDate}
              </p>
            </div>
            
            {/* Search bar */}
            <div className="mt-4 md:mt-0 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            height="auto"
            initialDate="2025-08-29"
          />
        </div>

        {/* Weather and Date Info */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <span className="mr-2">23°C Partly sunny</span>
          </div>
          <div className="mt-2 md:mt-0">
            <span>BKG</span>
            <span className="mx-2">•</span>
            <span>8/29/2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;