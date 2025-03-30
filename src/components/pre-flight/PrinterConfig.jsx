// src/components/pre-flight/PrinterConfig.jsx
import React, { useState, useEffect } from 'react';
import { FaPrint, FaSearch, FaEdit, FaTrash, FaCog, FaSave, FaRedo, FaTimes, FaCheckCircle } from 'react-icons/fa';

const PrinterConfig = ({ onSave, onClose }) => {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [printerConfig, setPrinterConfig] = useState({
    name: '',
    description: '',
    type: 'thermal',
    width: 80,
    height: 150,
    units: 'mm',
    dpi: 300,
    isDefault: false,
    connection: {
      type: 'usb',
      address: '',
      port: '',
    }
  });
  
  // Cargar impresoras desde localStorage y el sistema
  useEffect(() => {
    const loadPrinters = async () => {
      try {
        setIsLoading(true);
        
        // Cargar impresoras guardadas en localStorage
        const savedPrinters = localStorage.getItem('configuredPrinters');
        
        if (savedPrinters) {
          const parsedPrinters = JSON.parse(savedPrinters);
          setPrinters(parsedPrinters);
          
          // Seleccionar la impresora por defecto, si existe
          const defaultPrinter = parsedPrinters.find(p => p.isDefault);
          if (defaultPrinter) {
            setSelectedPrinter(defaultPrinter);
          }
        }
        
        // Intentar detectar impresoras del sistema usando Electron
        // Solo si estamos en un entorno Electron
        if (window.electronAPI) {
          try {
            const systemPrinters = await window.electronAPI.getSystemPrinters();
            if (Array.isArray(systemPrinters) && systemPrinters.length > 0) {
              // Procesar impresoras del sistema y combinarlas con las guardadas
              handleSystemPrinters(systemPrinters);
            }
          } catch (error) {
            console.warn('No se pudieron detectar impresoras del sistema:', error);
          }
        }
      } catch (error) {
        console.error('Error loading printers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPrinters();
  }, []);
  
  // Procesar impresoras del sistema y combinarlas con las guardadas
  const handleSystemPrinters = (systemPrinters) => {
    setPrinters(prevPrinters => {
      const existingIds = new Set(prevPrinters.map(p => p.id));
      const newPrinters = [];
      
      // Crear objetos de impresora para las nuevas del sistema
      systemPrinters.forEach(sysPrinter => {
        const printerId = `system-${sysPrinter.name}`;
        if (!existingIds.has(printerId)) {
          newPrinters.push({
            id: printerId,
            name: sysPrinter.name,
            description: sysPrinter.description || `Impresora del sistema: ${sysPrinter.name}`,
            type: detectPrinterType(sysPrinter.name), // Función auxiliar para inferir el tipo
            width: 80,
            height: 150,
            units: 'mm',
            dpi: 300,
            isDefault: sysPrinter.isDefault && prevPrinters.every(p => !p.isDefault),
            connection: {
              type: 'system',
              address: '',
              port: '',
            }
          });
        }
      });
      
      return [...prevPrinters, ...newPrinters];
    });
  };
  
  // Inferir tipo de impresora basado en su nombre
  const detectPrinterType = (printerName) => {
    const lowerName = printerName.toLowerCase();
    if (lowerName.includes('thermal') || lowerName.includes('receipt') || lowerName.includes('ticket')) {
      return 'thermal';
    } else if (lowerName.includes('laser')) {
      return 'laser';
    } else if (lowerName.includes('inkjet') || lowerName.includes('ink-jet')) {
      return 'inkjet';
    }
    return 'thermal'; // Por defecto, asumimos térmica para impresión de boarding passes
  };
  
  // Guardar impresoras en localStorage cuando cambien
  useEffect(() => {
    if (printers.length > 0) {
      localStorage.setItem('configuredPrinters', JSON.stringify(printers));
      
      // Notificar al componente padre sobre el cambio
      if (onSave) {
        onSave(printers);
      }
    }
  }, [printers, onSave]);
  
  // Detectar impresoras del sistema usando Electron si está disponible
  const handleDetectPrinters = async () => {
    setIsLoading(true);
    
    // Si estamos en entorno Electron, usar la API real
    if (window.electronAPI && window.electronAPI.getSystemPrinters) {
      try {
        const systemPrinters = await window.electronAPI.getSystemPrinters();
        // Añadir impresora PDF virtual si no existe
      const hasPdfPrinter = systemPrinters.some(p => 
        p.name === 'Vista Previa PDF' || p.id === 'pdf-preview'
      );
      
      if (!hasPdfPrinter) {
        systemPrinters.push({
          id: 'pdf-preview',
          name: 'Vista Previa PDF',
          description: 'Genera un PDF para previsualizar tarjetas de embarque',
          isDefault: false
        });
      }
        handleSystemPrinters(systemPrinters);
      } catch (error) {
        console.error('Error detecting system printers:', error);
        
        // Si falla, usar datos de simulación como fallback
        simulateDetectPrinters();
      } finally {
        setIsLoading(false);
      }
    } else {
      // Si no estamos en Electron, simular detección
      simulateDetectPrinters();
    }
  };
  
  // Simulación de detección de impresoras (para desarrollo o cuando Electron no está disponible)
  const simulateDetectPrinters = () => {
    setTimeout(() => {
      const detectedPrinters = [
        { 
          id: 'printer-1', 
          name: 'Thermal Printer USB', 
          description: 'Impresora térmica de tickets', 
          type: 'thermal',
          connection: { type: 'usb', address: 'USB001', port: '' }
        },
        { 
          id: 'printer-2', 
          name: 'Network Printer', 
          description: 'Impresora de red', 
          type: 'laser',
          connection: { type: 'network', address: '192.168.1.100', port: '9100' }
        },
        { 
            id: 'pdf-preview', 
            name: 'Vista Previa PDF', 
            description: 'Genera un PDF para previsualizar tarjetas de embarque', 
            type: 'virtual'
          }
      ];
      
      handleSystemPrinters(detectedPrinters);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleAddPrinter = () => {
    // Resetear el formulario
    setPrinterConfig({
      name: '',
      description: '',
      type: 'thermal',
      width: 80,
      height: 150,
      units: 'mm',
      dpi: 300,
      isDefault: false,
      connection: {
        type: 'usb',
        address: '',
        port: '',
      }
    });
    
    setIsEditing(true);
  };
  
  const handleEditPrinter = (printer) => {
    setPrinterConfig({
      ...printer,
      connection: printer.connection || { type: 'usb', address: '', port: '' }
    });
    setIsEditing(true);
  };
  
  const handleRemovePrinter = (printerId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta impresora?')) {
      setPrinters(prevPrinters => prevPrinters.filter(p => p.id !== printerId));
      
      if (selectedPrinter && selectedPrinter.id === printerId) {
        setSelectedPrinter(null);
      }
    }
  };
  
  const handleSavePrinter = () => {
    if (!printerConfig.name) {
      alert('Por favor ingrese un nombre para la impresora');
      return;
    }
    
    let newPrintersList = [...printers];
    
    // Generar un ID único si es una nueva impresora
    if (!printerConfig.id) {
      printerConfig.id = `printer-${Date.now()}`;
      newPrintersList.push(printerConfig);
    } else {
      // Actualizar una impresora existente
      const index = newPrintersList.findIndex(p => p.id === printerConfig.id);
      if (index >= 0) {
        newPrintersList[index] = printerConfig;
      }
    }
    
    // Si esta impresora es la predeterminada, actualizar las demás
    if (printerConfig.isDefault) {
      newPrintersList = newPrintersList.map(p => ({
        ...p,
        isDefault: p.id === printerConfig.id
      }));
    }
    
    setPrinters(newPrintersList);
    setSelectedPrinter(printerConfig);
    setIsEditing(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Para propiedades anidadas (como connection.type)
      const [parent, child] = name.split('.');
      setPrinterConfig({
        ...printerConfig,
        [parent]: {
          ...printerConfig[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      // Para propiedades de nivel superior
      setPrinterConfig({
        ...printerConfig,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  const setDefaultPrinter = (printerId) => {
    const updatedPrinters = printers.map(printer => ({
      ...printer,
      isDefault: printer.id === printerId
    }));
    
    setPrinters(updatedPrinters);
    
    // Actualizar la impresora seleccionada si estaba seleccionada
    if (selectedPrinter && selectedPrinter.id === printerId) {
      setSelectedPrinter({...selectedPrinter, isDefault: true});
    }
  };
  
  const testPrinter = async (printer) => {
    setIsLoading(true);
    
    // Si estamos en entorno Electron, usar la API real
    if (window.electronAPI && window.electronAPI.printTest) {
      try {
        const success = await window.electronAPI.printTest(printer.name);
        if (success) {
          alert(`Prueba de impresión enviada a ${printer.name} correctamente.`);
        } else {
          alert(`No se pudo imprimir en ${printer.name}. Verifique la conexión.`);
        }
      } catch (error) {
        console.error('Error printing test page:', error);
        alert(`Error al imprimir: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Simulación si no estamos en Electron
      setTimeout(() => {
        alert(`Simulación: Prueba de impresión enviada a ${printer.name}`);
        setIsLoading(false);
      }, 1500);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        
        
      </div>
      
      {isEditing ? (
        // Formulario de edición
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la impresora*
              </label>
              <input
                type="text"
                name="name"
                value={printerConfig.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ej: Impresora de Tarjetas"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                name="description"
                value={printerConfig.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ej: Impresora térmica para boarding passes"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de impresora
              </label>
              <select
                name="type"
                value={printerConfig.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="thermal">Térmica</option>
                <option value="inkjet">Inyección de tinta</option>
                <option value="laser">Láser</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de conexión
              </label>
              <select
                name="connection.type"
                value={printerConfig.connection.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="usb">USB</option>
                <option value="network">Red</option>
                <option value="bluetooth">Bluetooth</option>
                <option value="system">Sistema</option>
              </select>
            </div>
            
            {printerConfig.connection.type === 'network' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección IP
                </label>
                <input
                  type="text"
                  name="connection.address"
                  value={printerConfig.connection.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ej: 192.168.1.100"
                />
              </div>
            )}
            
            {printerConfig.connection.type === 'network' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puerto
                </label>
                <input
                  type="text"
                  name="connection.port"
                  value={printerConfig.connection.port}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ej: 9100"
                />
              </div>
            )}
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Configuración de tamaño para tarjetas de embarque
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600">Ancho</label>
                  <input
                    type="number"
                    name="width"
                    value={printerConfig.width}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Alto</label>
                  <input
                    type="number"
                    name="height"
                    value={printerConfig.height}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Unidades</label>
                  <select
                    name="units"
                    value={printerConfig.units}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                    <option value="inch">pulgadas</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DPI (Resolución)
              </label>
              <select
                name="dpi"
                value={printerConfig.dpi}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="203">203 DPI (estándar)</option>
                <option value="300">300 DPI (alta)</option>
                <option value="600">600 DPI (muy alta)</option>
              </select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={printerConfig.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Establecer como impresora predeterminada</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSavePrinter}
              className="px-4 py-2 bg-sand hover:bg-noche text-white rounded-md"
            >
              Guardar
            </button>
          </div>
        </div>
      ) : (
        // Vista de lista de impresoras
        <div>
          <div className="flex justify-between mb-4">
            <button
              type="button"
              onClick={handleDetectPrinters}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center"
            >
              {isLoading ? (
                <>
                  <FaRedo className="animate-spin mr-2" />
                  Detectando...
                </>
              ) : (
                <>
                  <FaSearch className="mr-2" />
                  Detectar Impresoras
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleAddPrinter}
              className="px-4 py-2 bg-sand hover:bg-noche text-white rounded-md flex items-center"
            >
              <FaPrint className="mr-2" />
              Añadir Impresora
            </button>
          </div>
          
          {printers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <FaPrint className="mx-auto h-12 w-12 mb-3 text-gray-400" />
              <p>No hay impresoras configuradas</p>
              <p className="text-sm mt-2">Haga clic en "Detectar Impresoras" o "Añadir Impresora" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {printers.map((printer) => (
                <div 
                  key={printer.id}
                  className={`border rounded-lg p-4 ${
                    selectedPrinter?.id === printer.id 
                      ? 'border-sand bg-dia' 
                      : 'border-gray-200 hover:border-sand'
                  }`}
                  onClick={() => setSelectedPrinter(printer)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{printer.name}</h3>
                        {printer.isDefault && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Predeterminada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{printer.description}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        <div>Tipo: {printer.type === 'thermal' ? 'Térmica' : printer.type === 'inkjet' ? 'Inyección' : 'Láser'}</div>
                        <div>Conexión: {printer.connection?.type === 'usb' ? 'USB' : 
                                        printer.connection?.type === 'network' ? `Red (${printer.connection.address})` : 
                                        printer.connection?.type === 'system' ? 'Sistema' : 'Bluetooth'}</div>
                        <div>Tamaño: {printer.width}×{printer.height} {printer.units}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          testPrinter(printer);
                        }}
                        title="Imprimir página de prueba"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <FaPrint />
                      </button>
                      
                      {!printer.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDefaultPrinter(printer.id);
                          }}
                          title="Establecer como predeterminada"
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPrinter(printer);
                        }}
                        title="Editar"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePrinter(printer.id);
                        }}
                        title="Eliminar"
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrinterConfig;