// src/components/pre-flight/TabNavigation.jsx
import React from 'react';
import { FaInfoCircle, FaPlane, FaUsers, FaCheck } from 'react-icons/fa';

const TabNavigation = ({ activeTab, setActiveTab, completedSteps }) => {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      <TabButton
        active={activeTab === 'info'}
        onClick={() => setActiveTab('info')}
        icon={<FaInfoCircle className="mr-2" />}
        label="1. Información del Vuelo"
        completed={completedSteps.info}
      />
      
      <TabButton
        active={activeTab === 'aircraft'}
        onClick={() => setActiveTab('aircraft')}
        icon={<FaPlane className="mr-2" />}
        label="2. Configuración de Aeronave"
        completed={completedSteps.aircraft}
        disabled={!completedSteps.info}
      />
      
      <TabButton
        active={activeTab === 'passengers'}
        onClick={() => setActiveTab('passengers')}
        icon={<FaUsers className="mr-2" />}
        label="3. Pasajeros"
        completed={completedSteps.passengers}
        disabled={!completedSteps.info || !completedSteps.aircraft}
      />
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, completed, disabled }) => {
  return (
    <button
      className={`py-2 px-4 ${
        active 
          ? 'border-b-2 border-blue-600 text-blue-600' 
          : 'text-gray-500 hover:text-blue-600'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center">
        {icon}
        <span>{label}</span>
        {completed && <FaCheck className="ml-2 text-green-500" />}
      </div>
    </button>
  );
};

export default TabNavigation;