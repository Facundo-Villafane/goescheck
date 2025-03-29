// src/components/flights/MvtFormModal.jsx
import { useEffect } from 'react';

const MvtFormModal = ({ mvtData, setMvtData, onClose, onSave }) => {
  
  // Genera la vista previa del mensaje MVT
  const getMvtPreview = () => {
    try {
      // Formatear fecha para mostrar el mes abreviado
      const formattedDate = mvtData.date ? 
        `${mvtData.date.slice(8, 10)}${new Date(mvtData.date).toLocaleString('en-US', {month: 'short'}).toUpperCase()}` : '';
      
      return `MVT
${mvtData.flightNumber}/${formattedDate}.${mvtData.aircraft} ${mvtData.crew} ${mvtData.capacity} ${mvtData.departureAirport}
AD ${mvtData.actualDeparture}/${mvtData.airborne} EA ${mvtData.estimatedArrival} ${mvtData.arrivalAirport}
PAX ${mvtData.passengers.men}/${mvtData.passengers.women}/${mvtData.passengers.children}/${mvtData.passengers.infants}
BAG ${mvtData.baggage.pieces}/${mvtData.baggage.weight} KGS POS ${mvtData.baggage.position}
DLY/${mvtData.delay}
RMK ${mvtData.remarks || 'NIL'}`;
    } catch (error) {
      console.error("Error generando vista previa MVT:", error);
      return "Error generando vista previa";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Datos de Vuelo (MVT)</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información del vuelo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Vuelo</label>
              <input
                type="text"
                value={mvtData.flightNumber}
                onChange={(e) => setMvtData({...mvtData, flightNumber: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                value={mvtData.date}
                onChange={(e) => setMvtData({...mvtData, date: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Matrícula</label>
              <input
                type="text"
                value={mvtData.aircraft}
                onChange={(e) => setMvtData({...mvtData, aircraft: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tripulación (formato: 2/4)</label>
              <input
                type="text"
                value={mvtData.crew}
                onChange={(e) => setMvtData({...mvtData, crew: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="2/4"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacidad (formato: Y186)</label>
              <input
                type="text"
                value={mvtData.capacity}
                onChange={(e) => setMvtData({...mvtData, capacity: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Y186"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Aeropuerto Origen</label>
              <input
                type="text"
                value={mvtData.departureAirport}
                onChange={(e) => setMvtData({...mvtData, departureAirport: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Horas de operación */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora Real Salida (formato: 1944)</label>
              <input
                type="text"
                value={mvtData.actualDeparture}
                onChange={(e) => setMvtData({...mvtData, actualDeparture: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="1944"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora Despegue (formato: 1955)</label>
              <input
                type="text"
                value={mvtData.airborne}
                onChange={(e) => setMvtData({...mvtData, airborne: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="1955"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora Estimada Arribo (formato: 2105)</label>
              <input
                type="text"
                value={mvtData.estimatedArrival}
                onChange={(e) => setMvtData({...mvtData, estimatedArrival: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="2105"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Aeropuerto Destino</label>
              <input
                type="text"
                value={mvtData.arrivalAirport}
                onChange={(e) => setMvtData({...mvtData, arrivalAirport: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Pasajeros */}
            <div className="col-span-2">
              <h3 className="font-semibold text-lg mt-4 mb-2">Pasajeros</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hombres</label>
                  <input
                    type="number"
                    value={mvtData.passengers.men}
                    onChange={(e) => setMvtData({...mvtData, passengers: {...mvtData.passengers, men: parseInt(e.target.value) || 0}})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mujeres</label>
                  <input
                    type="number"
                    value={mvtData.passengers.women}
                    onChange={(e) => setMvtData({...mvtData, passengers: {...mvtData.passengers, women: parseInt(e.target.value) || 0}})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Niños</label>
                  <input
                    type="number"
                    value={mvtData.passengers.children}
                    onChange={(e) => setMvtData({...mvtData, passengers: {...mvtData.passengers, children: parseInt(e.target.value) || 0}})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Infantes</label>
                  <input
                    type="number"
                    value={mvtData.passengers.infants}
                    onChange={(e) => setMvtData({...mvtData, passengers: {...mvtData.passengers, infants: parseInt(e.target.value) || 0}})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            {/* Equipaje */}
            <div className="col-span-2">
              <h3 className="font-semibold text-lg mt-4 mb-2">Equipaje</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Piezas</label>
                  <input
                    type="number"
                    value={mvtData.baggage.pieces}
                    onChange={(e) => setMvtData({...mvtData, baggage: {...mvtData.baggage, pieces: parseInt(e.target.value) || 0}})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Peso Total (kg)</label>
                  <input
                    type="number"
                    value={mvtData.baggage.weight}
                    onChange={(e) => setMvtData({...mvtData, baggage: {...mvtData.baggage, weight: parseInt(e.target.value) || 0}})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Distribución en Bodegas</label>
                  <input
                    type="text"
                    value={mvtData.baggage.position}
                    onChange={(e) => setMvtData({...mvtData, baggage: {...mvtData.baggage, position: e.target.value}})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ejemplo: 01/350/02/302"
                  />
                  <p className="mt-1 text-xs text-gray-500">Formato: posición1/peso1/posición2/peso2...</p>
                </div>
              </div>
            </div>
            
            {/* Información adicional */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Retraso (Delay)</label>
              <input
                type="text"
                value={mvtData.delay}
                onChange={(e) => setMvtData({...mvtData, delay: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Observaciones (RMK)</label>
              <input
                type="text"
                value={mvtData.remarks}
                onChange={(e) => setMvtData({...mvtData, remarks: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="NIL"
              />
            </div>
          </div>
          
          {/* Vista previa MVT */}
          <div className="mt-6 p-3 bg-gray-100 rounded font-mono whitespace-pre overflow-auto">
            {getMvtPreview()}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="mr-3 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="bg-sand hover:bg-noche text-white py-2 px-4 rounded"
            >
              Guardar MVT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MvtFormModal;