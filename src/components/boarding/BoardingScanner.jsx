// src/components/boarding/BoardingScanner.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaBarcode, FaKeyboard, FaExchangeAlt, FaSearch } from 'react-icons/fa';

const BoardingScanner = ({ onScanComplete, scanMode, setScanMode }) => {
  const [manualInput, setManualInput] = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const [scanActive, setScanActive] = useState(true);
  const inputRef = useRef(null);
  
  // Focus the manual input field when it becomes visible
  useEffect(() => {
    if (scanMode === 'manual' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);
  
  // Handle barcode scanner input (which typically ends with Enter key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!scanActive || scanMode !== 'scanner') return;
      
      // Accumulate input until Enter is pressed
      if (e.key === 'Enter') {
        // Process the scan
        if (lastScanned.trim()) {
          onScanComplete(lastScanned.trim());
          setLastScanned('');
        }
      } else if (e.key.length === 1) {
        // Accumulate the key
        setLastScanned(prev => prev + e.key);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scanActive, scanMode, lastScanned, onScanComplete]);
  
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScanComplete(manualInput.trim());
      setManualInput('');
    }
  };
  
  const toggleScanMode = () => {
    setScanMode(scanMode === 'scanner' ? 'manual' : 'scanner');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg flex items-center">
          {scanMode === 'scanner' ? (
            <><FaBarcode className="mr-2" /> Escaneo de Boarding Pass</>
          ) : (
            <><FaKeyboard className="mr-2" /> Entrada Manual</>
          )}
        </h2>
        <button
          onClick={toggleScanMode}
          className="flex items-center bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
        >
          <FaExchangeAlt className="mr-1" /> 
          {scanMode === 'scanner' ? 'Manual' : 'Escáner'}
        </button>
      </div>
      
      {scanMode === 'scanner' ? (
        <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <FaBarcode className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-600 mb-2">
            Escanee el código de barras de la tarjeta de embarque
          </p>
          <div className="flex items-center space-x-2 justify-center">
            <div className={`w-3 h-3 rounded-full ${scanActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm text-gray-500">
              {scanActive ? 'Escáner activo' : 'Escáner inactivo'}
            </p>
          </div>
          <button
            onClick={() => setScanActive(!scanActive)}
            className={`mt-2 px-3 py-1 rounded-md text-sm ${
              scanActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {scanActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Número de ticket o documento..."
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-md"
          >
            <FaSearch />
          </button>
        </form>
      )}
    </div>
  );
};

export default BoardingScanner;