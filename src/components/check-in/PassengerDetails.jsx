// src/components/check-in/PassengerDetails.jsx
import { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaUndo } from 'react-icons/fa';
import { usePassengersContext } from '../../contexts/PassengersContext';

const PassengerDetails = ({ passenger, onUpdate }) => {
  const { uncheckInPassenger, updatePassenger } = usePassengersContext();
  const [passengerType, setPassengerType] = useState(passenger?.passengerType || 'ADT');
  const [gender, setGender] = useState(passenger?.gender || 'M');
  const [documentType, setDocumentType] = useState(passenger?.documentType || 'DNI');
  const [documentNumber, setDocumentNumber] = useState(passenger?.documentNumber || '');
  const [isEditingDocument, setIsEditingDocument] = useState(false);

  // Actualizar estados locales cuando cambia el pasajero seleccionado
  useEffect(() => {
    if (passenger) {
      setPassengerType(passenger.passengerType || 'ADT');
      setGender(passenger.gender || 'M');
      setDocumentType(passenger.documentType || 'DNI');
      setDocumentNumber(passenger.documentNumber || '');
      setIsEditingDocument(false);
    }
  }, [passenger]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setPassengerType(newType);
    
    // Notificar al componente padre sobre el cambio
    if (onUpdate) {
      onUpdate({
        ...passenger,
        passengerType: newType,
        gender
      });
    }
  };

  const handleGenderChange = (e) => {
    const newGender = e.target.value;
    setGender(newGender);
    
    // Notificar al componente padre sobre el cambio
    if (onUpdate) {
      onUpdate({
        ...passenger,
        passengerType,
        gender: newGender
      });
    }
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
  };

  const handleDocumentNumberChange = (e) => {
    setDocumentNumber(e.target.value);
  };

  const handleSaveDocument = async () => {
    // Validar que haya un número de documento
    if (!documentNumber.trim()) {
      alert('El número de documento es obligatorio');
      return;
    }
    
    // Actualizar pasajero con nuevo tipo y número de documento
    const updatedPassenger = {
      ...passenger,
      documentType,
      documentNumber
    };
    
    // Guardar cambios mediante el contexto
    try {
      const result = await updatePassenger(updatedPassenger);
      
      // Notificar al componente padre
      if (onUpdate) {
        onUpdate(result);
      }
      
      // Salir del modo edición
      setIsEditingDocument(false);
    } catch (error) {
      console.error('Error al actualizar el documento:', error);
      alert('Ocurrió un error al guardar los cambios');
    }
  };

  const handleCancelEdit = () => {
    // Restaurar valores originales
    setDocumentType(passenger.documentType || 'DNI');
    setDocumentNumber(passenger.documentNumber || '');
    setIsEditingDocument(false);
  };

  const handleUncheckIn = async () => {
    if (window.confirm('¿Estás seguro que deseas eliminar el check-in de este pasajero?')) {
      try {
        const updatedPassenger = await uncheckInPassenger(passenger);
        
        // Notificar al componente padre
        if (onUpdate) {
          onUpdate(updatedPassenger);
        }
      } catch (error) {
        console.error('Error al descheckear pasajero:', error);
        alert('Ocurrió un error al eliminar el check-in');
      }
    }
  };

  if (!passenger) return null;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h3 className="text-sm text-gray-500 mb-1">Nombre completo</h3>
        <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm text-gray-500">Documento</h3>
          {!isEditingDocument ? (
            <button 
              onClick={() => setIsEditingDocument(true)}
              className="text-blue-500 hover:text-blue-700 text-sm"
              title="Editar documento"
            >
              <FaEdit />
            </button>
          ) : null}
        </div>
        
        {isEditingDocument ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <select 
                value={documentType}
                onChange={handleDocumentTypeChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm flex-shrink-0"
              >
                <option value="DNI">DNI</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="CEDULA">Cédula</option>
                <option value="OTRO">Otro</option>
              </select>
              
              <input 
                type="text"
                value={documentNumber}
                onChange={handleDocumentNumberChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm flex-grow"
                placeholder="Número de documento"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={handleCancelEdit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded text-xs flex items-center"
              >
                <FaTimes className="mr-1" /> Cancelar
              </button>
              
              <button 
                onClick={handleSaveDocument}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center"
              >
                <FaSave className="mr-1" /> Guardar
              </button>
            </div>
          </div>
        ) : (
          <p className="font-medium">{passenger.documentType || 'DNI'}: {passenger.documentNumber}</p>
        )}
      </div>

      {passenger.ticket && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-1">SEQ</h3>
          <p className="font-medium">{passenger.ticket}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-1">Tipo de Pasajero</h3>
          <select
            value={passengerType}
            onChange={handleTypeChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="ADT">Adulto (ADT)</option>
            <option value="CHD">Niño (CHD)</option>
            <option value="INF">Infante (INF)</option>
          </select>
        </div>

        {passengerType === 'ADT' && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">Género</h3>
            <select
              value={gender}
              onChange={handleGenderChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
            >
              <option value="M">Masculino (M)</option>
              <option value="F">Femenino (F)</option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        {passenger.checkedIn ? (
          <div>
            <div className="flex justify-between items-center">
              <p className="font-medium text-green-600">Check-in completado</p>
              <button 
                onClick={handleUncheckIn}
                className="text-red-500 hover:text-red-700 flex items-center text-sm"
                title="Eliminar check-in"
              >
                <FaUndo className="mr-1" /> Deshacer check-in
              </button>
            </div>
            
            {passenger.checkInTime && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(passenger.checkInTime).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <p className="font-medium text-yellow-600">Pendiente de check-in</p>
        )}
      </div>

      {passenger.seat && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-1">Asiento asignado</h3>
          <p className="font-medium">{passenger.seat}</p>
        </div>
      )}
    </div>
  );
};

export default PassengerDetails;
