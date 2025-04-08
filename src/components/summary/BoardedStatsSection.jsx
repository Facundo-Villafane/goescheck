// src/components/summary/BoardedStatsSection.jsx
import React, { useState, useEffect } from 'react';
import { FaUsers, FaMale, FaFemale, FaChild, FaBaby, FaSuitcase, FaPlaneArrival, FaExchangeAlt } from 'react-icons/fa';

/**
 * Componente que muestra estadísticas específicas de pasajeros embarcados
 */
const BoardedStatsSection = ({ stats, forwardRef }) => {
  // Estado para controlar la unidad de peso, inicializado desde localStorage
  const [weightUnit, setWeightUnit] = useState(() => {
    return localStorage.getItem('weightUnit') || 'kg';
  });
  
  // Función para convertir kg a libras
  const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);
  
  // Actualizar localStorage cuando cambia la unidad
  useEffect(() => {
    localStorage.setItem('weightUnit', weightUnit);
  }, [weightUnit]);
  
  // Calcular porcentajes
  const malePercentage = stats.total > 0 ? Math.round((stats.totals.M / stats.total) * 100) : 0;
  const femalePercentage = stats.total > 0 ? Math.round((stats.totals.F / stats.total) * 100) : 0;
  const childPercentage = stats.total > 0 ? Math.round((stats.totals.CHD / stats.total) * 100) : 0;
  const infantPercentage = stats.total > 0 ? Math.round((stats.totals.INF / stats.total) * 100) : 0;
  
  // Calcular promedio de equipaje por pasajero según unidad
  const avgBaggagePerPax = stats.total > 0 
    ? weightUnit === 'kg'
      ? `${(stats.baggage.weight / stats.total).toFixed(1)} kg`
      : `${kgToLbs(stats.baggage.weight / stats.total)} lb`
    : weightUnit === 'kg' ? '0 kg' : '0 lb';

  // Calcular el número de pasajeros con equipaje (corregido)
  // En lugar de usar el count como número de pasajeros, contamos cuántos pasajeros tienen baggage
  const passengersWithBaggage = Math.min(stats.baggage.count, stats.total);
  const baggagePassengerPercentage = stats.total > 0 
    ? Math.round((passengersWithBaggage / stats.total) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" ref={forwardRef}>
      {/* Pasajeros */}
      <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <FaPlaneArrival className="mr-2 text-green-600" /> Boarded Passengers
        </h2>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="text-right text-sm text-green-700 font-medium">
            {stats.total} pasajeros
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Adultos masculinos */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <FaMale className="mr-1 text-blue-600" /> Adultos (M)
              </span>
              <span>{stats.totals.M} ({malePercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${malePercentage}%` }}></div>
            </div>
          </div>
          
          {/* Adultos femeninos */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <FaFemale className="mr-1 text-pink-600" /> Adultos (F)
              </span>
              <span>{stats.totals.F} ({femalePercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-pink-600 h-1.5 rounded-full" style={{ width: `${femalePercentage}%` }}></div>
            </div>
          </div>
          
          {/* Niños */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <FaChild className="mr-1 text-orange-600" /> Niños
              </span>
              <span>{stats.totals.CHD} ({childPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-orange-600 h-1.5 rounded-full" style={{ width: `${childPercentage}%` }}></div>
            </div>
          </div>
          
          {/* Infantes */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <FaBaby className="mr-1 text-purple-600" /> Infantes
              </span>
              <span>{stats.totals.INF} ({infantPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${infantPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Equipaje */}
      <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold flex items-center">
            <FaSuitcase className="mr-2" /> Boarded Baggage
          </h2>
          
          {/* Botón para alternar entre kg y libras */}
          <button 
            onClick={() => setWeightUnit(weightUnit === 'kg' ? 'lb' : 'kg')}
            className="flex items-center text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
            title="Cambiar unidad de peso"
          >
            <FaExchangeAlt className="mr-1" /> 
            {weightUnit.toUpperCase()}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-md text-center">
            <div className="text-3xl font-bold text-blue-700">{stats.baggage.count}</div>
            <div className="text-sm text-blue-700">Piezas totales</div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md text-center">
            <div className="text-3xl font-bold text-blue-700">
              {weightUnit === 'kg' 
                ? stats.baggage.weight.toFixed(1) 
                : kgToLbs(stats.baggage.weight)}
            </div>
            <div className="text-sm text-blue-700">Peso total ({weightUnit})</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Promedio por pasajero:</span>
            <span className="font-medium">{avgBaggagePerPax}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Promedio por pieza:</span>
            <span className="font-medium">
              {stats.baggage.count > 0 
                ? (weightUnit === 'kg'
                  ? `${(stats.baggage.weight / stats.baggage.count).toFixed(1)} kg`
                  : `${kgToLbs(stats.baggage.weight / stats.baggage.count)} lb`)
                : weightUnit === 'kg' ? '0 kg' : '0 lb'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Pasajeros con equipaje:</span>
            <span className="font-medium">
              {baggagePassengerPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardedStatsSection;