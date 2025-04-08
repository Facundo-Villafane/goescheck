// src/components/summary/StatsSection.jsx
import React, { useState } from 'react';
import { FaUsers, FaSuitcase, FaExchangeAlt } from 'react-icons/fa';

/**
 * Componente que muestra las estadísticas de pasajeros y equipaje
 */
const StatsSection = ({ stats, forwardRef }) => {
  // Estado para controlar la unidad de peso
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' o 'lb'
  
  // Función para convertir kg a libras
  const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);
  
  // Obtener el peso según la unidad seleccionada
  const getTotalWeight = () => {
    return weightUnit === 'kg' 
      ? `${stats.baggage.weight.toFixed(1)} kg`
      : `${kgToLbs(stats.baggage.weight)} lb`;
  };
  
  // Obtener el peso promedio por pasajero
  const getAverageWeight = () => {
    if (stats.total <= 0) return weightUnit === 'kg' ? '0 kg' : '0 lb';
    
    const avgWeight = stats.baggage.weight / stats.total;
    return weightUnit === 'kg'
      ? `${avgWeight.toFixed(1)} kg`
      : `${kgToLbs(avgWeight)} lb`;
  };
  
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
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold flex items-center">
            <FaSuitcase className="mr-2" /> Bags
          </h2>
          
          {/* Botón para alternar entre kg y libras */}
          <button 
            onClick={() => setWeightUnit(weightUnit === 'kg' ? 'lb' : 'kg')}
            className="flex items-center text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
            title="Toggle weight unit"
          >
            <FaExchangeAlt className="mr-1" /> 
            {weightUnit.toUpperCase()}
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total pcs:</span>
            <span className="font-medium">{stats.baggage.count}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Weight:</span>
            <span className="font-medium">{getTotalWeight()}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span>Average Weight/Pax:</span>
            <span className="font-medium">{getAverageWeight()}</span>
          </div>
          {stats.baggage.count > 0 && (
            <div className="flex justify-between items-center">
              <span>Average Weight/Piece:</span>
              <span className="font-medium">
                {weightUnit === 'kg'
                  ? `${(stats.baggage.weight / stats.baggage.count).toFixed(1)} kg`
                  : `${kgToLbs(stats.baggage.weight / stats.baggage.count)} lb`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;