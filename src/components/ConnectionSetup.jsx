import React from 'react';

export const ConnectionSetup = ({ espIP, setEspIP, onConnect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-cyan-500/30 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            PosturePro
          </h1>
          <p className="text-gray-400 text-sm">Advanced Posture Monitoring System v2.0</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              ESP32 Device Configuration
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  IP Address
                </label>
                <input
                  type="text"
                  value={espIP}
                  onChange={(e) => setEspIP(e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Port
                </label>
                <input
                  type="text"
                  value="80"
                  disabled
                  className="w-full px-4 py-3 bg-slate-900/30 border border-gray-600/30 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={onConnect}
            className=" w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span >Connect to Device</span>
          </button>
        </div>
        
        {/* Information Panel */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Connection Guide
          </h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Ensure ESP32 is connected to WiFi</li>
            <li>• Check IP address in Serial Monitor</li>
            <li>• Device must be on same network</li>
            <li>• Default port: 80 (HTTP)</li>
          </ul>
        </div>
{/* Info Page Button */}
<div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
  <h3 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center">
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M3 5h11" />
    </svg>
    Learn About Spine & Posture
  </h3>

  <p className="text-xs text-gray-300 mb-3">
    Understanding how posture affects spinal alignment.
  </p>

  <a
    href="/infoscreen"
    className="w-full block text-center py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
  >
    Open Info Page →
  </a>
</div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            PosturePro © 2024 - Medical Grade Monitoring
          </p>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)
          `,
          filter: 'blur(60px)'
        }}></div>
      </div>
    </div>
  );
};