// src/components/summary/StatsSection.jsx
import React from 'react';
import { FaUsers, FaSuitcase } from 'react-icons/fa';

/**
 * Componente que muestra las estadísticas de pasajeros y equipaje
 */
const StatsSection = ({ stats, forwardRef }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" ref={forwardRef}>
      {/* Pasajeros */}
      <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <FaUsers className="mr-2" /> Pax
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Pax:</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <hr />
          <div className="flex justify-between">
            <span>ADT - M:</span>
            <span className="font-medium">{stats.byType.ADT.M}</span>
          </div>
          <div className="flex justify-between">
            <span>ADT - F:</span>
            <span className="font-medium">{stats.byType.ADT.F}</span>
          </div>
          <div className="flex justify-between">
            <span>CHD:</span>
            <span className="font-medium">{stats.byType.CHD}</span>
          </div>
          <div className="flex justify-between">
            <span>Inf:</span>
            <span className="font-medium">{stats.byType.INF}</span>
          </div>
        </div>
      </div>
      
      {/* Equipaje */}
      <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <FaSuitcase className="mr-2" /> Bags
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total pcs:</span>
            <span className="font-medium">{stats.baggage.count}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Weight:</span>
            <span className="font-medium">{stats.baggage.weight.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span>Average Pcs/Weight:</span>
            <span className="font-medium">
              {stats.total > 0 
                ? (stats.baggage.weight / stats.total).toFixed(1) 
                : '0'} kg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;