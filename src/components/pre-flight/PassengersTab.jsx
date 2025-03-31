// src/components/pre-flight/PassengersTab.jsx
import React, { useState } from 'react';
import { usePassengersContext } from '../../contexts/PassengersContext';
import * as ExcelJS from 'exceljs';
import PassengerForm from './PassengerForm';
import PassengerList from './PassengerList';

const PassengersTab = ({ flightDetails, onBack, onFinish, onComplete }) => {
  const { passengerList, addPassengersFromExcel } = usePassengersContext();
  const [isLoading, setIsLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!flightDetails.id) {
      alert('Por favor, guarda primero la información del vuelo.');
      e.target.value = '';
      return;
    }
    
    setIsLoading(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('No se pudo encontrar la hoja de trabajo');
      }
      
      const headers = [];
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value);
      });
      
      const jsonData = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            if (colNumber <= headers.length) {
              const header = headers[colNumber - 1];
              if (header.toLowerCase().includes('nombre')) {
                rowData['firstName'] = cell.value;
              } else if (header.toLowerCase().includes('apellido')) {
                rowData['lastName'] = cell.value;
              } else if (header.toLowerCase().includes('documento') || header.toLowerCase().includes('dni')) {
                rowData['documentNumber'] = cell.value;
              } else if (header.toLowerCase().includes('tipo')) {
                rowData['documentType'] = cell.value;
              } else if (header.toLowerCase().includes('ticket')) {
                rowData['ticket'] = cell.value;
              } else {
                rowData[header] = cell.value;
              }
            }
          });
          jsonData.push(rowData);
        }
      });
      
      const passengersWithIds = jsonData.map((passenger, index) => ({
        id: `passenger-excel-${Date.now()}-${index}`,
        firstName: passenger.firstName || '',
        lastName: passenger.lastName || '',
        documentType: passenger.documentType || 'DNI',
        documentNumber: passenger.documentNumber || '',
        ticket: passenger.ticket || '',
        checkedIn: false,
        flightId: flightDetails.id,
        ...passenger
      }));
      
      const result = await addPassengersFromExcel(passengersWithIds);
      
      setExcelFile(file.name);
      if (onComplete) onComplete();
      
      e.target.value = '';
      
      setTimeout(() => {
        if (document.activeElement) {
          document.activeElement.blur();
        }
        setIsLoading(false);
      }, 100);
      
      alert(`Archivo procesado correctamente:\n- ${result.total} pasajeros en total\n- ${result.nuevos} nuevos pasajeros añadidos\n- ${result.actualizados} pasajeros actualizados`);
    } catch (error) {
      console.error('Error procesando archivo:', error);
      alert(`Error al procesar el archivo: ${error.message}`);
      if (e.target) e.target.value = '';
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Gestión de Pasajeros</h2>
      
      {/* Opciones para cargar Excel */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block w-full">
          
            <span className={`w-full px-4 py-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md cursor-pointer inline-block text-center`}>
              {isLoading ? 'Cargando...' : 'Cargar Excel'}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          {excelFile && (
            <div className="mt-2 text-sm text-gray-600">
              Archivo: {excelFile}
            </div>
          )}
        </div>
      </div>
      
      {/* Formulario para añadir pasajeros manualmente */}
      <PassengerForm 
        flightId={flightDetails.id} 
        onAdd={onComplete}
      />
      
      {/* Lista de pasajeros */}
      <PassengerList />
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium"
        >
          Finalizar y Continuar al Check-In
        </button>
      </div>
    </div>
  );
};

export default PassengersTab;