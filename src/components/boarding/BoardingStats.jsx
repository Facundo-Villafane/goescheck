// src/components/boarding/BoardingStats.jsx
import React from 'react';
import { FaUsers, FaMale, FaFemale, FaChild, FaBaby, FaCheck } from 'react-icons/fa';

const BoardingStats = ({ statistics }) => {
  // Calculate percentages
  const boardedPercentage = statistics.total > 0 
    ? Math.round((statistics.boarded / statistics.total) * 100) 
    : 0;
    
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="font-semibold text-lg mb-3 flex items-center">
        <FaUsers className="mr-2" /> Estado del Embarque
      </h2>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
        <div 
          className="bg-green-600 h-4 rounded-full"
          style={{ width: `${boardedPercentage}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 p-2 rounded">
          <span className="text-gray-700">Total:</span>
          <span className="float-right font-medium">{statistics.total}</span>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <span className="text-green-700">Embarcados:</span>
          <span className="float-right font-medium">{statistics.boarded}</span>
        </div>
        <div className="bg-yellow-50 p-2 rounded">
          <span className="text-yellow-700">Pendientes:</span>
          <span className="float-right font-medium">{statistics.pending}</span>
        </div>
        <div className="bg-blue-50 p-2 rounded">
          <span className="text-blue-700">Completado:</span>
          <span className="float-right font-medium">{boardedPercentage}%</span>
        </div>
      </div>
      
      <h3 className="font-medium mt-4 mb-2">Detalles por Tipo</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaMale className="text-blue-600 mr-1" /> 
            <FaFemale className="text-pink-600 mr-1" /> 
            <span>Adultos:</span>
          </div>
          <div>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
              {statistics.adults.boarded}/{statistics.adults.total}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaChild className="text-orange-600 mr-1" /> 
            <span>Niños:</span>
          </div>
          <div>
            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">
              {statistics.children.boarded}/{statistics.children.total}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaBaby className="text-purple-600 mr-1" /> 
            <span>Infantes:</span>
          </div>
          <div>
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
              {statistics.infants.boarded}/{statistics.infants.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardingStats;