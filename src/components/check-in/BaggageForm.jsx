// src/components/check-in/BaggageForm.jsx
import { useState, useEffect } from 'react';

let globalTagCounter = 1;

const BaggageForm = ({ baggage, onChange, flightInfo, passengerInfo }) => {
    // Estado local para una nueva pieza de equipaje
    const [newPieceWeight, setNewPieceWeight] = useState('');
  
  // Si no hay una lista de piezas, inicializar como array vacío
  const pieces = baggage.pieces || [];
  
  // Calcular el peso total y la cantidad de piezas
  const totalWeight = pieces.reduce((sum, piece) => sum + piece.weight, 0);
  const totalCount = pieces.length;

  // Intentar inicializar el contador con un valor almacenado en localStorage
  useEffect(() => {
    const savedCounter = localStorage.getItem('baggageTagCounter');
    if (savedCounter) {
      globalTagCounter = parseInt(savedCounter);
    }
  }, []);
  
  // Generar código de etiqueta de equipaje
  const generateBaggageTag = () => {
    // Valores de vuelo (usar los reales o valores por defecto)
    const flightNumber = flightInfo?.flightNumber || '1234';
    const destination = flightInfo?.destination || 'DST';
    
    // Número secuencial - formatear como 4 dígitos con ceros a la izquierda
    const sequentialNumber = String(globalTagCounter).padStart(4, '0');
    
    // Incrementar el contador global para la próxima etiqueta
    globalTagCounter++;
    
    // Guardar el contador actualizado en localStorage
    localStorage.setItem('baggageTagCounter', globalTagCounter.toString());
    
    // Formato: Número de vuelo-Destino-Secuencial
    return `${flightNumber}-${destination}-${sequentialNumber}`;
  };
  
  const handleAddPiece = () => {
    // Validar que el peso sea un número positivo
    const weight = parseFloat(newPieceWeight);
    if (isNaN(weight) || weight <= 0) {
      alert('Por favor ingrese un peso válido');
      return;
    }
    
    // Generar etiqueta para el equipaje
    const tag = generateBaggageTag();
    
    // Añadir la nueva pieza a la lista
    const newPieces = [...pieces, { 
      id: Date.now(),
      tag: tag,
      weight 
    }];
    
    // Actualizar el estado en el componente padre
    onChange({
      ...baggage,
      pieces: newPieces,
      count: newPieces.length,
      weight: newPieces.reduce((sum, piece) => sum + piece.weight, 0)
    });
    
    // Limpiar el campo de entrada
    setNewPieceWeight('');
  };
  
  const handleRemovePiece = (pieceId) => {
    // Filtrar la pieza eliminada
    const newPieces = pieces.filter(piece => piece.id !== pieceId);
    
    // Actualizar el estado en el componente padre
    onChange({
      ...baggage,
      pieces: newPieces,
      count: newPieces.length,
      weight: newPieces.reduce((sum, piece) => sum + piece.weight, 0)
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm italic mb-2">
        El registro de equipaje es opcional. Añada cada pieza de equipaje por separado.
      </p>
      
      <div className="flex space-x-2">
        <div className="flex-grow">
          <label htmlFor="new-piece-weight" className="block text-sm font-medium text-gray-700 mb-1">
            Peso de la pieza (kg)
          </label>
          <input
            id="new-piece-weight"
            type="number"
            min="0.1"
            step="0.1"
            value={newPieceWeight}
            onChange={(e) => setNewPieceWeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: 23.5"
          />
        </div>
        
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAddPiece}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md h-10"
          >
            Añadir
          </button>
        </div>
      </div>
      
      {pieces.length > 0 && (
        <div className="border border-gray-200 rounded-md">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 grid grid-cols-12">
            <span className="font-medium col-span-6">Etiqueta</span>
            <span className="font-medium col-span-4 text-center">Peso (kg)</span>
            <span className="font-medium col-span-2 text-right">Acción</span>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {pieces.map((piece) => (
              <div key={piece.id} className="px-4 py-2 border-b border-gray-200 grid grid-cols-12 items-center">
                <span className="font-mono text-sm col-span-6">{piece.tag}</span>
                <span className="col-span-4 text-center">{piece.weight} kg</span>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemovePiece(piece.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar pieza"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex justify-between text-sm">
          <span>Total de piezas:</span>
          <span className="font-medium">{totalCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Peso total:</span>
          <span className="font-medium">{totalWeight.toFixed(1)} kg</span>
        </div>
      </div>
    </div>
  );
};

export default BaggageForm;