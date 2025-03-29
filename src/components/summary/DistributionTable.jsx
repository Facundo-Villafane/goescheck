// src/components/summary/DistributionTable.jsx
import React from 'react';
import { FaPlane } from 'react-icons/fa';

/**
 * Componente que muestra la distribución de pasajeros por secciones
 */
const DistributionTable = ({ stats, getSectionsInfo, forwardRef }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 print:shadow-none print:border" ref={forwardRef}>
      <h2 className="text-lg font-semibold mb-3 flex items-center">
        <FaPlane className="mr-2" /> Distribution by Zones
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2">Zones</th>
              <th className="border border-gray-300 p-2">M</th>
              <th className="border border-gray-300 p-2">F</th>
              <th className="border border-gray-300 p-2">C</th>
              <th className="border border-gray-300 p-2">I</th>
              <th className="border border-gray-300 p-2 font-medium">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {/* Generar filas dinámicamente para cada sección */}
            {Object.keys(stats.bySection).map(sectionId => {
              const section = stats.bySection[sectionId];
              const sectionInfo = getSectionsInfo().find(s => s.id === sectionId) || 
                                  { id: sectionId, name: sectionId, color: '#888888' };
              
              return (
                <tr key={sectionId}>
                  <td className="border border-gray-300 p-2 font-medium"
                      style={{ color: sectionInfo.color }}>
                    {sectionId}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">{section.M}</td>
                  <td className="border border-gray-300 p-2 text-center">{section.F}</td>
                  <td className="border border-gray-300 p-2 text-center">{section.CHD}</td>
                  <td className="border border-gray-300 p-2 text-center">{section.INF}</td>
                  <td className="border border-gray-300 p-2 text-center font-medium">{section.total}</td>
                </tr>
              );
            })}
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2 font-medium">TOTAL</td>
              <td className="border border-gray-300 p-2 text-center font-medium">{stats.totals.M}</td>
              <td className="border border-gray-300 p-2 text-center font-medium">{stats.totals.F}</td>
              <td className="border border-gray-300 p-2 text-center font-medium">{stats.totals.CHD}</td>
              <td className="border border-gray-300 p-2 text-center font-medium">{stats.totals.INF}</td>
              <td className="border border-gray-300 p-2 text-center font-medium">{stats.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Secciones */}
      <div className="mt-4">
        <h3 className="font-medium mb-2">Zones:</h3>
        <div className="flex flex-wrap gap-2">
          {getSectionsInfo().map(section => (
            <div 
              key={section.id} 
              className="px-2 py-1 rounded text-sm" 
              style={{ 
                backgroundColor: `${section.color}20`, // Color de fondo con transparencia
                color: section.color,
                borderColor: section.color,
                borderWidth: '1px'
              }}
            >
              {section.id}: {section.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistributionTable;