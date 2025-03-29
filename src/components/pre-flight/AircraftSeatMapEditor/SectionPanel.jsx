// src/components/pre-flight/AircraftSeatMapEditor/SectionPanel.jsx
import { useState } from 'react';
import { FaTrash, FaPencilAlt, FaSync, FaInfoCircle, FaEye } from 'react-icons/fa';

const SectionPanel = ({ 
  sections, 
  updateSection, 
  deleteSection, 
  updateSectionLabels,
  highlightSection
}) => {
  const [editMode, setEditMode] = useState({});
  const [tempNames, setTempNames] = useState({});

  // Función para activar edición manual
  const startEditing = (sectionId) => {
    // Guardar el nombre actual
    setTempNames(prev => ({
      ...prev,
      [sectionId]: sections.find(s => s.id === sectionId)?.name || ''
    }));
    setEditMode(prev => ({ ...prev, [sectionId]: true }));
  };

  // Función para guardar edición manual
  const saveEditing = (sectionId) => {
    if (tempNames[sectionId]) {
      updateSection(sectionId, { name: tempNames[sectionId] });
    }
    setEditMode(prev => ({ ...prev, [sectionId]: false }));
  };

  // Manejar tecla Enter en edición
  const handleKeyDown = (e, sectionId) => {
    if (e.key === 'Enter') {
      saveEditing(sectionId);
    } else if (e.key === 'Escape') {
      // Cancelar edición
      setEditMode(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  return (
    <div className="border rounded-md p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium">Secciones</h3>
        <button
          type="button"
          onClick={updateSectionLabels}
          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center"
          title="Actualizar nombres con rangos de filas"
        >
          <FaSync size={10} className="mr-1" /> Auto-etiquetas
        </button>
      </div>

      <div className="space-y-2 mb-2">
        {sections.map((section) => (
          <div key={section.id} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2 cursor-pointer"
              style={{ backgroundColor: section.color }}
              onClick={() => highlightSection && highlightSection(section.id)}
              title="Click para resaltar filas de esta sección"
            ></div>
            
            {editMode[section.id] ? (
              <input
                type="text"
                value={tempNames[section.id] || ''}
                onChange={(e) => setTempNames(prev => ({
                  ...prev,
                  [section.id]: e.target.value
                }))}
                onBlur={() => saveEditing(section.id)}
                onKeyDown={(e) => handleKeyDown(e, section.id)}
                className="flex-grow px-2 py-1 border border-blue-300 rounded-md text-sm"
                autoFocus
              />
            ) : (
              <div className="flex-grow flex items-center justify-between">
                <span className="text-sm truncate mr-1">{section.name}</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => highlightSection && highlightSection(section.id)}
                    className="text-gray-400 hover:text-gray-600 mr-1"
                    title="Resaltar filas de esta sección"
                  >
                    <FaEye size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEditing(section.id)}
                    className="text-gray-400 hover:text-gray-600 mr-1"
                    title="Editar nombre manualmente"
                  >
                    <FaPencilAlt size={10} />
                  </button>
                  <input
                    type="color"
                    value={section.color}
                    onChange={(e) => updateSection(section.id, { color: e.target.value })}
                    className="w-5 h-5 border-0 p-0 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => deleteSection(section.id)}
                    className="ml-1 text-red-500 hover:text-red-700"
                    title="Eliminar sección"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 flex items-center">
        <FaInfoCircle size={10} className="mr-1" /> 
        Haz clic en el círculo de color para resaltar las filas de esa sección
      </div>
    </div>
  );
};

export default SectionPanel;