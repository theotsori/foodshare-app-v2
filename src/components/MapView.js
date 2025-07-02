import React, { useEffect } from 'react';
import { MapPin, Heart, Utensils, Building, ShoppingBag, ChevronRight, Clock, Map as MapIcon } from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const MapView = () => {
  const { donations } = useFoodSharingContext(); // Use donations from context or fetch if needed
  // For this placeholder, we'll use a few dummy locations.
  // In a real app, you'd fetch locations or pass them down.

  const dummyLocations = [
    { id: 1, name: "Community Kitchen", type: "charity", address: "101 Market St", distance: "0.5 km", lat: -1.2868, lng: 36.8180 },
    { id: 2, name: "Green Grocer", type: "grocery", address: "202 Garden Ave", distance: "1.2 km", lat: -1.2900, lng: 36.8150 },
    { id: 3, name: "Urban Cafe", type: "restaurant", address: "303 City Rd", distance: "2.0 km", lat: -1.2840, lng: 36.8210 },
  ];

  return (
    <div className="space-y-6 font-inter py-4 px-2 md:px-0">
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">Food Map: Donations Near You</h3>
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl h-96 flex items-center justify-center relative overflow-hidden shadow-inner border border-gray-100">
          <div className="text-center animate-fade-in px-4">
            <MapIcon className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce-slow" />
            <p className="text-gray-700 font-bold text-lg">Interactive Map View Coming Soon</p>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">See nearby donations and recipients on a dynamic map with real-time updates.</p>
          </div>
          
          {/* Animated map pins for visual effect */}
          <div className="absolute top-1/4 left-[20%] w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md animate-ping-slow-delay1">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="absolute top-1/3 right-[25%] w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md animate-ping-slow-delay2">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="absolute bottom-1/4 left-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md animate-ping-slow-delay3">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-gray-800 text-xl">Nearby Locations Overview</h4>
        {dummyLocations.map((location) => (
          <div key={location.id} className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm ${
              location.type === 'grocery' ? 'bg-green-500' : location.type === 'restaurant' ? 'bg-orange-500' : 'bg-blue-500'
            }`}>
              {location.type === 'grocery' && <ShoppingBag className="h-6 w-6" />}
              {location.type === 'restaurant' && <Utensils className="h-6 w-6" />}
              {location.type === 'charity' && <Heart className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-gray-800 text-base">{location.name}</h5>
              <p className="text-sm text-gray-600">{location.address} • {location.distance}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;