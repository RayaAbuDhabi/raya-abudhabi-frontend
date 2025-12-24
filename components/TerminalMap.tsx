import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Footprints } from 'lucide-react';

// Simulated navigation data (replace with your actual pathfinding)
const terminal3POIs = {
  gates: [
    { id: 'gate_a1', name: 'A1', x: 900, y: 170, concourse: 'A', color: '#27ae60' },
    { id: 'gate_a2', name: 'A2', x: 980, y: 170, concourse: 'A', color: '#27ae60' },
    { id: 'gate_a3', name: 'A3', x: 1060, y: 170, concourse: 'A', color: '#27ae60' },
    { id: 'gate_a4', name: 'A4', x: 1140, y: 170, concourse: 'A', color: '#27ae60' },
    { id: 'gate_a5', name: 'A5', x: 1220, y: 170, concourse: 'A', color: '#27ae60' },
    { id: 'gate_b1', name: 'B1', x: 120, y: 400, concourse: 'B', color: '#f39c12' },
    { id: 'gate_b2', name: 'B2', x: 200, y: 400, concourse: 'B', color: '#f39c12' },
    { id: 'gate_b3', name: 'B3', x: 280, y: 400, concourse: 'B', color: '#f39c12' },
    { id: 'gate_c1', name: 'C1', x: 870, y: 400, concourse: 'C', color: '#2196f3' },
    { id: 'gate_c2', name: 'C2', x: 950, y: 400, concourse: 'C', color: '#2196f3' },
  ],
  facilities: [
    { id: 'coffee_a', name: 'Costa Coffee', x: 930, y: 280, type: 'dining', icon: '☕' },
    { id: 'duty_free', name: 'Duty Free', x: 1090, y: 280, type: 'retail', icon: '🛍️' },
    { id: 'lounge', name: 'Etihad Lounge', x: 1250, y: 280, type: 'lounge', icon: '✈️' },
    { id: 'restaurant_b', name: 'Restaurant', x: 230, y: 520, type: 'dining', icon: '🍔' },
    { id: 'prayer_c', name: 'Prayer Room', x: 980, y: 520, type: 'facility', icon: '🕌' },
  ]
};

const TerminalMap = () => {
  const [selectedStart, setSelectedStart] = useState('gate_a1');
  const [selectedEnd, setSelectedEnd] = useState('gate_a5');
  const [showRoute, setShowRoute] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Animate route
  useEffect(() => {
    if (showRoute) {
      const interval = setInterval(() => {
        setAnimationProgress(prev => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [showRoute]);

  const startGate = terminal3POIs.gates.find(g => g.id === selectedStart);
  const endGate = terminal3POIs.gates.find(g => g.id === selectedEnd);

  const calculateDistance = () => {
    if (!startGate || !endGate) return 0;
    const dx = endGate.x - startGate.x;
    const dy = endGate.y - startGate.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  };

  const distance = calculateDistance();
  const walkingTime = Math.ceil(distance / 1.4);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Navigation className="w-6 h-6" />
          Abu Dhabi Airport - Terminal 3 Navigation
        </h1>
        <p className="text-sm text-blue-100 mt-1">Real-time indoor navigation powered by Raya AI</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Route Selection */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Plan Your Route
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">From</label>
                  <select 
                    value={selectedStart}
                    onChange={(e) => setSelectedStart(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {terminal3POIs.gates.map(gate => (
                      <option key={gate.id} value={gate.id}>
                        Gate {gate.name} (Concourse {gate.concourse})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">To</label>
                  <select 
                    value={selectedEnd}
                    onChange={(e) => setSelectedEnd(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {terminal3POIs.gates.map(gate => (
                      <option key={gate.id} value={gate.id}>
                        Gate {gate.name} (Concourse {gate.concourse})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowRoute(!showRoute)}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    showRoute 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showRoute ? 'Hide Route' : 'Show Route'}
                </button>
              </div>
            </div>

            {/* Route Info */}
            {showRoute && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-gray-800 mb-3">Route Details</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Footprints className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-xs text-gray-600">Distance</div>
                      <div className="font-semibold text-gray-800">{distance}m</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-xs text-gray-600">Walking Time</div>
                      <div className="font-semibold text-gray-800">~{Math.ceil(walkingTime / 60)} minutes</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="text-xs font-medium text-gray-600 mb-2">Turn-by-turn:</div>
                  <ol className="text-sm space-y-1 text-gray-700">
                    <li>1. Start at Gate {startGate?.name}</li>
                    <li>2. Walk {startGate && endGate && startGate.x < endGate.x ? 'east' : 'west'} along Concourse {startGate?.concourse}</li>
                    <li>3. Arrive at Gate {endGate?.name}</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Nearby Facilities */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Nearby Facilities</h3>
              <div className="space-y-2">
                {terminal3POIs.facilities.slice(0, 3).map(facility => (
                  <div key={facility.id} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{facility.icon}</span>
                    <span className="text-gray-700">{facility.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden bg-gray-100">
          <svg viewBox="0 0 1400 700" className="w-full h-full">
            {/* Terminal Building */}
            <rect x="50" y="50" width="1300" height="600" fill="#ffffff" stroke="#2c3e50" strokeWidth="3" rx="10"/>
            
            {/* Main Entrance */}
            <rect x="600" y="50" width="200" height="80" fill="#3498db" stroke="#2980b9" strokeWidth="2" rx="5"/>
            <text x="700" y="95" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">Main Entrance</text>
            
            {/* Security */}
            <rect x="600" y="160" width="200" height="60" fill="#e74c3c" stroke="#c0392b" strokeWidth="2" rx="5"/>
            <text x="700" y="195" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">Security</text>
            
            {/* Central Hub */}
            <circle cx="700" cy="300" r="60" fill="#9b59b6" stroke="#8e44ad" strokeWidth="3"/>
            <text x="700" y="305" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">Hub</text>
            
            {/* Concourse Areas */}
            <rect x="850" y="150" width="450" height="200" fill="#e8f5e9" stroke="#27ae60" strokeWidth="2" rx="5" opacity="0.3"/>
            <text x="1075" y="135" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#27ae60">Concourse A</text>
            
            <rect x="100" y="380" width="450" height="200" fill="#fff3e0" stroke="#f39c12" strokeWidth="2" rx="5" opacity="0.3"/>
            <text x="325" y="365" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#f39c12">Concourse B</text>
            
            <rect x="850" y="380" width="450" height="200" fill="#e3f2fd" stroke="#2196f3" strokeWidth="2" rx="5" opacity="0.3"/>
            <text x="1075" y="365" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2196f3">Concourse C</text>
            
            {/* Gates */}
            {terminal3POIs.gates.map(gate => {
              const isStart = gate.id === selectedStart;
              const isEnd = gate.id === selectedEnd;
              
              return (
                <g key={gate.id}>
                  <rect 
                    x={gate.x} 
                    y={gate.y} 
                    width="60" 
                    height="50" 
                    fill={isStart ? '#e74c3c' : isEnd ? '#27ae60' : gate.color}
                    stroke={isStart || isEnd ? 'white' : '#333'}
                    strokeWidth={isStart || isEnd ? 3 : 2}
                    rx="3"
                    className="cursor-pointer transition-all hover:opacity-80"
                  />
                  <text 
                    x={gate.x + 30} 
                    y={gate.y + 32} 
                    textAnchor="middle" 
                    fontSize="12" 
                    fontWeight="bold" 
                    fill="white"
                  >
                    {gate.name}
                  </text>
                  {isStart && (
                    <circle cx={gate.x + 30} cy={gate.y + 25} r="8" fill="white" opacity="0.8">
                      <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite"/>
                    </circle>
                  )}
                  {isEnd && (
                    <circle cx={gate.x + 30} cy={gate.y + 25} r="8" fill="white" opacity="0.8">
                      <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite"/>
                    </circle>
                  )}
                </g>
              );
            })}
            
            {/* Facilities */}
            {terminal3POIs.facilities.map(facility => (
              <g key={facility.id}>
                <circle cx={facility.x} cy={facility.y} r="20" fill="#9c27b0" stroke="#7b1fa2" strokeWidth="2" className="cursor-pointer hover:opacity-80"/>
                <text x={facility.x} y={facility.y + 5} textAnchor="middle" fontSize="14">{facility.icon}</text>
              </g>
            ))}
            
            {/* Animated Route */}
            {showRoute && startGate && endGate && (
              <>
                <line 
                  x1={startGate.x + 30} 
                  y1={startGate.y + 25} 
                  x2={endGate.x + 30} 
                  y2={endGate.y + 25}
                  stroke="#e74c3c"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="15,10"
                  strokeDashoffset={-animationProgress}
                  opacity="0.8"
                />
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TerminalMap;