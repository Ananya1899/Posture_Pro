import React from 'react';
import { Link } from "react-router-dom";

export const InfoIntro = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-cyan-500/30 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Posture Science
          </h1>
          <p className="text-gray-400 text-sm">Learn the science behind posture and spine</p>
        </div>

        <Link
          to="/info"
          className="w-full block py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
        >
          Enter Info Page
        </Link>

        <div className="mt-8 text-center">
          <Link to="/" className="text-xs text-gray-400 underline">
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
};
