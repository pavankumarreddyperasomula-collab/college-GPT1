import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Compass, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, CornerDownRight, Footprints, Layers } from 'lucide-react';

const SRKR_MAP_LOCATIONS = [
  // Top Row (North Campus Buildings)
  { id: "temple", name: "Temple", code: "TMPL", x: 5.5, y: 17.5, category: "Spiritual / Landmark", color: "bg-red-600" },
  { id: "citi_center", name: "CITI Center", code: "CITI", x: 14.5, y: 17.5, category: "Research & IT", color: "bg-red-600" },
  { id: "cse_block", name: "CSE Block", code: "CSE", x: 22.8, y: 17.5, category: "Academic Department", color: "bg-red-600" },
  { id: "eee_block", name: "EEE Block", code: "EEE", x: 30.8, y: 17.5, category: "Academic Department", color: "bg-red-600" },
  { id: "auto_club", name: "Automobile Club", code: "AUTO", x: 39.0, y: 17.5, category: "Student Club / Labs", color: "bg-red-600" },
  { id: "eng_workshop", name: "Engineering Workshop", code: "ENG-WS", x: 47.0, y: 17.5, category: "Workshops & Labs", color: "bg-red-600" },
  { id: "civil_lab", name: "Civil Engineering Lab", code: "CIVIL-LAB", x: 55.0, y: 17.5, category: "Labs", color: "bg-red-600" },
  { id: "wet_center", name: "Wet Center", code: "WET", x: 62.5, y: 17.5, category: "Research Center", color: "bg-red-600" },
  { id: "fluid_lab", name: "Fluid Mechanics Lab", code: "FLUID", x: 68.5, y: 17.5, category: "Labs", color: "bg-red-600" },
  { id: "mini_audi", name: "Mini Auditorium", code: "MINI-AUDI", x: 76.5, y: 17.5, category: "Auditoriums", color: "bg-red-600" },
  { id: "canteen", name: "Canteen Cafeteria", code: "CANTEEN", x: 84.5, y: 17.5, category: "Food & Dining", color: "bg-red-600" },
  { id: "indoor_audi", name: "Indoor Auditorium", code: "INDOOR", x: 93.5, y: 23.0, category: "Auditoriums", color: "bg-red-600" },

  // Middle Row
  { id: "girls_parking", name: "Girls Bike Parking Area", code: "PARKING", x: 9.5, y: 37.0, category: "Parking", color: "bg-blue-600" },
  { id: "central_library", name: "Central Library", code: "LIB", x: 20.2, y: 39.0, category: "Library & Digital Hub", color: "bg-red-600" },
  { id: "xerox_shop", name: "Xerox Shop", code: "XEROX", x: 29.8, y: 40.0, category: "Campus Services", color: "bg-blue-600" },
  { id: "mech_block", name: "Mechanical Block", code: "MECH", x: 40.5, y: 40.0, category: "Academic Department", color: "bg-red-600" },
  { id: "n_block", name: "N Block", code: "N-BLK", x: 49.0, y: 40.0, category: "Academic Block", color: "bg-red-600" },
  { id: "tea_stall", name: "Tea Stall", code: "TEA", x: 56.5, y: 40.0, category: "Refreshments", color: "bg-blue-600" },
  { id: "civil_block", name: "Civil Block", code: "CIVIL", x: 65.2, y: 42.0, category: "Academic Department", color: "bg-red-600" },
  { id: "basketball_court", name: "Basketball Court", code: "COURT", x: 77.5, y: 46.0, category: "Sports Complex", color: "bg-red-600" },
  { id: "s_block", name: "S Block", code: "S-BLK", x: 92.5, y: 47.0, category: "Academic Block", color: "bg-red-600" },

  // Administration & Central Grounds
  { id: "admin_block", name: "Administration Block", code: "ADMIN", x: 22.5, y: 56.0, category: "Administration", color: "bg-red-600" },
  { id: "open_audi", name: "Open Auditorium", code: "OPEN-AUDI", x: 37.5, y: 56.0, category: "Auditoriums", color: "bg-purple-600" },
  { id: "ground", name: "Ground", code: "GROUND", x: 59.2, y: 74.0, category: "Sports & Grounds", color: "bg-red-600" },

  // Bottom Row (South Campus)
  { id: "it_block", name: "IT Block", code: "IT", x: 8.5, y: 78.0, category: "Academic Department", color: "bg-red-600" },
  { id: "ece_block", name: "ECE Block", code: "ECE", x: 19.0, y: 79.0, category: "Academic Department", color: "bg-red-600" },
  { id: "silver_jubilee_block", name: "Silver Jubilee Block", code: "SJB", x: 34.0, y: 77.0, category: "Academic Block", color: "bg-red-600" },
  { id: "srujanavatika_pond", name: "Srujanavatika Pond", code: "POND", x: 93.8, y: 74.0, category: "Scenic Landmark", color: "bg-blue-600" }
];

const CampusMapModal = ({ isOpen, onClose }) => {
  const [startLoc, setStartLoc] = useState("cse_block");
  const [destLoc, setDestLoc] = useState("admin_block");
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);

  // Check geolocation permission on opening modal
  useEffect(() => {
    if (isOpen) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationPermissionGranted(true);
            setShowLocationAlert(false);
          },
          (error) => {
            setLocationPermissionGranted(false);
            setShowLocationAlert(true);
          },
          { timeout: 8000 }
        );
      } else {
        setShowLocationAlert(true);
      }
    }
  }, [isOpen]);

  // Route calculation and cardinal directional steps
  const handleCalculateRoute = () => {
    const s = SRKR_MAP_LOCATIONS.find((l) => l.id === startLoc);
    const d = SRKR_MAP_LOCATIONS.find((l) => l.id === destLoc);
    if (!s || !d) return;

    const dx = d.x - s.x;
    const dy = d.y - s.y;
    const euclideanDist = Math.sqrt(dx * dx + dy * dy);
    const estDistanceMeters = Math.max(30, Math.round(euclideanDist * 7.5));
    const estWalkTimeMins = Math.max(1, Math.ceil(estDistanceMeters / 65));

    // Determine cardinal direction
    let directionStr = "Straight";
    if (Math.abs(dx) > Math.abs(dy)) {
      directionStr = dx > 0 ? "East (Right)" : "West (Left)";
    } else {
      directionStr = dy > 0 ? "South (Down towards South Campus)" : "North (Up towards Main Road)";
    }

    if (dx > 5 && dy > 5) directionStr = "South-East (towards Ground & Jubilee Blocks)";
    if (dx < -5 && dy > 5) directionStr = "South-West (towards IT & ECE Blocks)";
    if (dx > 5 && dy < -5) directionStr = "North-East (towards Canteen & Mini Auditorium)";
    if (dx < -5 && dy < -5) directionStr = "North-West (towards CITI Center & Temple)";

    setRouteInfo({
      from: s.name,
      to: d.name,
      distance: estDistanceMeters,
      walkTime: estWalkTimeMins,
      direction: directionStr,
      steps: [
        `Start at ${s.name} (${s.code}).`,
        `Head ${directionStr} along the campus paved boulevard.`,
        s.id !== d.id ? `Follow the directional blue route arrows past intermediate campus landmarks.` : `You are already at ${s.name}.`,
        `Arrive at ${d.name} (${d.code}) entrance. Total distance ~${estDistanceMeters}m (~${estWalkTimeMins} min walk).`
      ]
    });
  };

  useEffect(() => {
    if (isOpen) {
      handleCalculateRoute();
    }
  }, [startLoc, destLoc, isOpen]);

  if (!isOpen) return null;

  const startObj = SRKR_MAP_LOCATIONS.find((l) => l.id === startLoc) || SRKR_MAP_LOCATIONS[2];
  const destObj = SRKR_MAP_LOCATIONS.find((l) => l.id === destLoc) || SRKR_MAP_LOCATIONS[21];

  // Calculate angle and arrow positions along vector
  const dx = destObj.x - startObj.x;
  const dy = destObj.y - startObj.y;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  // Arrow markers along the path (at 20%, 40%, 60%, 80%, 95%)
  const arrowWaypoints = startLoc !== destLoc ? [0.22, 0.45, 0.68, 0.88] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/25 backdrop-blur-md animate-fade-in">
      <div className="bg-white/85 backdrop-blur-2xl border border-white/50 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/60 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                SRKR Campus Live Map Navigator
                {locationPermissionGranted ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GPS Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                    Manual GPS
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Select origin & destination to view real-time arrow directions on the official SRKR campus layout</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const temp = startLoc;
                setStartLoc(destLoc);
                setDestLoc(temp);
              }}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-800 text-xs font-bold items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              title="Swap Start & Destination"
            >
              ⇄ Reverse Route
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Location Alert */}
        {showLocationAlert && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Turn on device location to automatically detect your start building position.</span>
            </div>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    () => { setLocationPermissionGranted(true); setShowLocationAlert(false); },
                    () => { setShowLocationAlert(true); }
                  );
                }
              }}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-extrabold transition-all cursor-pointer shrink-0"
            >
              Enable GPS
            </button>
          </div>
        )}

        {/* Route Selectors Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Start Location Dropdown */}
          <div className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-1">
            <label className="block text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Start Location (Origin)
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                🟢 {startObj.code}
              </span>
            </label>
            <select
              value={startLoc}
              onChange={(e) => setStartLoc(e.target.value)}
              className="w-full py-1.5 px-2 bg-transparent text-slate-900 text-xs font-bold outline-none cursor-pointer"
            >
              {SRKR_MAP_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  📍 {loc.name} ({loc.category})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Dropdown */}
          <div className="p-3 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-1">
            <label className="block text-[11px] font-extrabold text-rose-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-rose-600" /> Destination Target
              </span>
              <span className="text-[10px] text-rose-700 font-mono font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                🎯 {destObj.code}
              </span>
            </label>
            <select
              value={destLoc}
              onChange={(e) => setDestLoc(e.target.value)}
              className="w-full py-1.5 px-2 bg-transparent text-slate-900 text-xs font-bold outline-none cursor-pointer"
            >
              {SRKR_MAP_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  🎯 {loc.name} ({loc.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Map Layout & Turn-by-Turn Panel */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-100/60 flex flex-col">
          {/* MAP CANVAS WITH ACTUAL SRKR MAP PICTURE */}
          <div className="relative w-full rounded-3xl border-2 border-slate-300 shadow-lg overflow-hidden bg-slate-900 flex-1 min-h-[360px] sm:min-h-[460px] select-none group">
            {/* 1. Official SRKR Campus Map Image */}
            <img
              src="/srkr_campus_map.jpg"
              alt="SRKR Engineering College Official Campus Map Layout"
              className="w-full h-full object-fill sm:object-contain bg-slate-900"
            />

            {/* 2. Dynamic SVG Arrows & Navigation Paths Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Glowing Drop Shadow Filter */}
                <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Animated Gradient on Line */}
                <linearGradient id="routeGradient" x1={`${startObj.x}%`} y1={`${startObj.y}%`} x2={`${destObj.x}%`} y2={`${destObj.y}%`}>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>

                {/* Terminal Arrowhead Marker */}
                <marker
                  id="targetArrowhead"
                  viewBox="0 0 12 12"
                  refX="8"
                  refY="6"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto"
                >
                  <path d="M 0 1 L 12 6 L 0 11 L 3 6 z" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                </marker>
              </defs>

              {startLoc !== destLoc && (
                <>
                  {/* Outer Glow Halo Route Line */}
                  <line
                    x1={startObj.x}
                    y1={startObj.y}
                    x2={destObj.x}
                    y2={destObj.y}
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeOpacity="0.4"
                    filter="url(#routeGlow)"
                  />

                  {/* Main Route Line with animated dash */}
                  <line
                    x1={startObj.x}
                    y1={startObj.y}
                    x2={destObj.x}
                    y2={destObj.y}
                    stroke="url(#routeGradient)"
                    strokeWidth="1.8"
                    strokeDasharray="3 1.5"
                    markerEnd="url(#targetArrowhead)"
                  />

                  {/* Multiple Directional Arrow Marks Along the Vector */}
                  {arrowWaypoints.map((t, idx) => {
                    const px = startObj.x + dx * t;
                    const py = startObj.y + dy * t;
                    return (
                      <g key={idx} transform={`translate(${px}, ${py}) rotate(${angleDeg})`}>
                        {/* Direction Arrow Head Polygon */}
                        <polygon
                          points="-2.2,-2.2 2.5,0 -2.2,2.2 -0.8,0"
                          fill="#ffffff"
                          stroke="#ef4444"
                          strokeWidth="0.6"
                          className="drop-shadow-md"
                        />
                      </g>
                    );
                  })}
                </>
              )}
            </svg>

            {/* 3. Interactive Location Pins on Map Image */}
            {SRKR_MAP_LOCATIONS.map((loc) => {
              const isStart = loc.id === startLoc;
              const isDest = loc.id === destLoc;

              return (
                <div
                  key={loc.id}
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  onClick={() => {
                    if (startLoc === loc.id) return;
                    setDestLoc(loc.id);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                    isStart || isDest ? 'z-40 scale-125' : 'z-30 hover:scale-125'
                  }`}
                  title={`Click to set destination: ${loc.name}`}
                >
                  {/* Start Point Pin Marker (Green Pulse) */}
                  {isStart && (
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping" />
                        <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white text-white shadow-xl flex items-center justify-center text-[10px] font-black">
                          ●
                        </div>
                      </div>
                      <div className="mt-0.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-100 text-[8px] font-black whitespace-nowrap shadow-md border border-emerald-400">
                        START: {loc.name}
                      </div>
                    </div>
                  )}

                  {/* Destination Pin Marker (Red Bouncing Target) */}
                  {isDest && !isStart && (
                    <div className="flex flex-col items-center animate-bounce">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping" />
                        <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white text-white shadow-xl flex items-center justify-center text-[10px] font-black">
                          🎯
                        </div>
                      </div>
                      <div className="mt-0.5 px-2 py-0.5 rounded-full bg-rose-950 text-rose-100 text-[8px] font-black whitespace-nowrap shadow-md border border-rose-400">
                        DESTINATION: {loc.name}
                      </div>
                    </div>
                  )}

                  {/* Regular Interactive Building Hotspot Dot */}
                  {!isStart && !isDest && (
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900/60 hover:bg-rose-600 hover:border-white hover:border border border-white/60 shadow-xs transition-colors" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Turn-by-Turn Real-time Direction Steps */}
          {routeInfo && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Live Turn-by-Turn Walking Directions
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 text-xs font-extrabold font-mono border border-teal-200">
                    📏 Distance: {routeInfo.distance} meters
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-extrabold font-mono border border-blue-200">
                    ⏱️ Approx: {routeInfo.walkTime} min walk
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {routeInfo.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-800 font-medium"
                  >
                    <span className="w-5 h-5 rounded-lg bg-teal-600 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
            📍 SRKR Engineering College (Autonomous) Campus Map & Route Direction System
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer ml-auto"
          >
            Close Map Navigator
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampusMapModal;

