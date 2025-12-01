import React from 'react';

export const Header = ({ connected, error }) => {
  const getConnectionStatus = () => {
    if (error) {
      return {
        text: 'Connection Error',
        color: 'bg-red-400',
        bgColor: 'bg-red-400/10',
        textColor: 'text-red-400'
      };
    }
    return connected ? {
      text: 'Connected',
      color: 'bg-green-400',
      bgColor: 'bg-green-400/10',
      textColor: 'text-green-400'
    } : {
      text: 'Connecting...',
      color: 'bg-yellow-400',
      bgColor: 'bg-yellow-400/10',
      textColor: 'text-yellow-400'
    };
  };

  const status = getConnectionStatus();

  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-slate-900/30 backdrop-blur-md border-b border-cyan-500/30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  PosturePro
                </h1>
                <p className="text-xs text-gray-400 -mt-1">Advanced Spine Monitoring System</p>
              </div>
            </div>
          </div>

          {/* Center Section - Live Status */}
          <div className="flex-1 max-w-md mx-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`}></div>
                  <span className={`text-sm font-medium ${status.textColor}`}>
                    {status.text}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Live Monitoring • 60 FPS
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center space-x-3">
            {/* Connection Status Badge */}
            <div className={`px-3 py-1 rounded-full ${status.bgColor} border ${status.textColor}/30`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                <span className={`text-sm font-medium ${status.textColor}`}>
                  {status.text}
                </span>
              </div>
            </div>

            {/* Settings Button */}
            <button className="p-2 rounded-lg bg-slate-800/50 border border-cyan-500/20 hover:border-cyan-400/40 transition-all hover:bg-cyan-500/10">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Connection Error: {error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};