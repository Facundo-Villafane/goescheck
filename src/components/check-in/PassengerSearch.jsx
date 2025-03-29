import { useState } from 'react';
import { usePassengersContext } from '../../contexts/PassengersContext';

const PassengerSearch = ({ onSelect }) => {
  const { passengerList } = usePassengersContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.length < 2) {
      setResults([]);
      return;
    }

    // Depuración para ver qué contiene passengerList
    console.log("Lista de pasajeros:", passengerList);

    // Buscar pasajeros que coincidan con el término
    const filtered = passengerList.filter(
      passenger => {
        // Verificar que passenger tiene las propiedades necesarias
        if (!passenger || !passenger.firstName || !passenger.lastName) {
          console.log("Pasajero con datos incompletos:", passenger);
          return false;
        }

        const fullName = `${passenger.firstName} ${passenger.lastName}`.toLowerCase();
        const lastNameFirst = `${passenger.lastName} ${passenger.firstName}`.toLowerCase();
        const docNumber = passenger.documentNumber ? passenger.documentNumber.toString().toLowerCase() : '';
        
        return fullName.includes(term) || 
               lastNameFirst.includes(term) || 
               docNumber.includes(term);
      }
    );

    console.log("Resultados filtrados:", filtered);
    setResults(filtered);
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o documento..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {results.length > 0 && (
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
          {results.map((passenger) => (
            <div
              key={passenger.id}
              className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                onSelect(passenger);
                setSearchTerm('');
                setResults([]);
              }}
            >
              <div className="font-medium">{passenger.lastName}, {passenger.firstName}</div>
              <div className="text-sm text-gray-600">
                {passenger.documentType || 'Doc'}: {passenger.documentNumber}
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm.length >= 2 && results.length === 0 && (
        <div className="p-3 text-center text-gray-500">
          No se encontraron pasajeros
        </div>
      )}
    </div>
  );
};

export default PassengerSearch;