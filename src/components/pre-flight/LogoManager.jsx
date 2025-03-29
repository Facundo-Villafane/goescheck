// src/components/pre-flight/SimpleLogoManager.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaSave, FaUndo, FaTimes, FaLink } from 'react-icons/fa';

const LogoManager = ({ onSave, onClose }) => {
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' o 'url'
  const fileInputRef = useRef(null);
  
  // Cargar logo existente al iniciar
  useEffect(() => {
    // Cargar logo global existente
    const savedLogo = localStorage.getItem('boardingPassLogo');
    if (savedLogo) {
      setLogoPreview(savedLogo);
      
      // Si parece una URL, establecer el modo URL
      if (savedLogo.startsWith('http') || savedLogo.startsWith('https') || 
          savedLogo.startsWith('data:image')) {
        setLogoUrl(savedLogo);
        setInputMode('url');
      }
    }
  }, []);
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Si es SVG
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setLogoPreview(content);
        setLogoFile(file);
      };
      reader.readAsText(file);
    } 
    // Si es otra imagen
    else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setLogoPreview(content);
        setLogoFile(file);
      };
      reader.readAsDataURL(file);
    }
    // Formato no soportado
    else {
      alert('Por favor seleccione un archivo SVG o imagen (PNG, JPG)');
    }
  };
  
  const handleUrlChange = (e) => {
    setLogoUrl(e.target.value);
  }
  
  const handleUrlPreview = () => {
    if (logoUrl) {
      setLogoPreview(logoUrl);
    }
  }
  
  const handleSave = () => {
    if (logoPreview) {
      // Guardar en localStorage
      localStorage.setItem('boardingPassLogo', logoPreview);
      
      if (onSave) {
        onSave(logoPreview);
      }
    }
    
    if (onClose) {
      onClose();
    }
  };
  
  // Renderizar la vista previa del logo
  const renderLogoPreview = () => {
    if (!logoPreview) {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded p-4" style={{height: '100px'}}>
          <p className="text-gray-500 text-sm">No hay logo seleccionado</p>
        </div>
      );
    }
    
    // Si es SVG
    if (typeof logoPreview === 'string' && 
        (logoPreview.trim().startsWith('<svg') || logoPreview.trim().startsWith('<?xml'))) {
      return (
        <div 
          className="bg-white border rounded p-4 flex justify-center"
          style={{height: '100px'}}
          dangerouslySetInnerHTML={{ __html: logoPreview }} 
        />
      );
    }
    
    // Si es imagen
    return (
      <div className="bg-white border rounded p-4 flex justify-center" style={{height: '100px'}}>
        <img 
          src={logoPreview} 
          alt="Logo Preview" 
          style={{maxHeight: '80px'}}
          onError={(e) => {
            console.error("Error cargando logo:", e);
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  };
  
  return (
    <div className="bg-white p-4 rounded shadow-lg max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Configurar Logo</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        )}
      </div>
      
      {/* Pestañas para seleccionar modo */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${inputMode === 'file' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setInputMode('file')}
        >
          Cargar archivo
        </button>
        <button
          className={`py-2 px-4 ${inputMode === 'url' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setInputMode('url')}
        >
          Ingresar URL
        </button>
      </div>
      
      {/* Input de archivo o URL */}
      {inputMode === 'file' ? (
        <div className="mb-4">
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
          >
            <FaUpload className="mr-2" /> Seleccionar Archivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex">
            <input
              type="text" 
              value={logoUrl}
              onChange={handleUrlChange}
              placeholder="https://ejemplo.com/logo.svg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
            />
            <button 
              onClick={handleUrlPreview}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-md"
            >
              <FaLink />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Ingrese la URL de una imagen o SVG. Asegúrese de que sea accesible públicamente.
          </p>
        </div>
      )}
      
      <div className="mb-4">
        {renderLogoPreview()}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setLogoPreview('');
            setLogoFile(null);
            setLogoUrl('');
          }}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
        >
          <FaUndo className="mr-2" /> Limpiar
        </button>
        
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
          disabled={!logoPreview}
        >
          <FaSave className="mr-2" /> Guardar
        </button>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>Formatos soportados: SVG, PNG, JPG o URL</p>
        <p>El logo se guardará globalmente para todos los boarding passes.</p>
      </div>
    </div>
  );
};

export default LogoManager;