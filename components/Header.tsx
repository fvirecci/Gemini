
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-indigo-200 shadow-lg">
          G
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Gemini Assistant</h1>
          <p className="text-xs text-green-500 font-medium flex items-center">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            Online & Pronto
          </p>
        </div>
      </div>
      <nav className="hidden md:flex space-x-6">
        <button className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Dashboard</button>
        <button className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Impostazioni</button>
        <button className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
          Nuovo Progetto
        </button>
      </nav>
    </header>
  );
};
