// src/components/check-in/BoardingPass.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import bwipjs from 'bwip-js';
import { FaPrint, FaCog } from 'react-icons/fa';
import PrinterSelector from './PrinterSelector';

const BoardingPass = ({ passenger, flightDetails, onPrint, onClose, showPrintButton = true, showLogo = true, onConfigurePrinters }) => {
  const componentRef = useRef();
  const [printerConfig, setPrinterConfig] = useState(null);
  const [showPrinterSelector, setShowPrinterSelector] = useState(false);
  const [barcodeError, setBarcodeError] = useState(false);
  const [logoData, setLogoData] = useState(null);
  const handlePrinterChange = (printer) => {
    setPrinterConfig(printer);
  };

// En el useEffect donde cargas el logo
useEffect(() => {
    // Intentar cargar el logo específico del vuelo
    const flightId = flightDetails?.id;
    console.log("Intentando cargar logo para vuelo:", flightId);
    
    if (flightId) {
      const flightLogo = localStorage.getItem(`logo_flight_${flightId}`);
      console.log("Logo específico encontrado:", !!flightLogo);
      if (flightLogo) {
        console.log("Tipo de logo:", flightLogo.substring(0, 40) + "..."); // Mostrar los primeros 40 caracteres
        setLogoData(flightLogo);
        return;
      }
    }
    
    // Si no hay logo específico, usar el global
    const globalLogo = localStorage.getItem('boardingPassLogo');
    console.log("Logo global encontrado:", !!globalLogo);
    if (globalLogo) {
      setLogoData(globalLogo);
    } else {
      // Si no hay logos, usar uno predeterminado
      const defaultLogo = getDefaultLogo();
      console.log("Usando logo predeterminado");
      setLogoData(defaultLogo);
    }
  }, [flightDetails?.id]);
  
  // Función para generar logo predeterminado
  const getDefaultLogo = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
      <rect width="200" height="60" fill="#f0f0f0" />
      <text x="20" y="35" font-family="Arial" font-size="20" font-weight="bold" fill="#333">AEROLÍNEA</text>
      <path d="M160,10 L190,30 L160,50 Z" fill="#2563eb"/>
    </svg>`;
  };
  
  // Función para generar el código PDF417 usando bwip-js
  // Función para generar el código PDF417 usando bwip-js
const generatePDF417 = () => {
    try {
      // Preparar datos para el código de barras
      const lastName = (passenger?.lastName || 'APELLIDO').toUpperCase();
      const firstName = (passenger?.firstName || 'NOMBRE').toUpperCase();
      const flightNum = flightDetails?.flightNumber || 'XX1234';
      const origin = flightDetails?.origin || 'XXX';
      const destination = flightDetails?.destination || 'XXX';
      const seat = passenger?.seat || 'XX'; // Obtener el asiento
      const seq = passenger?.ticket || 'XXX'; // Obtener el número de ticket
      
      // Formato básico para boarding pass con asiento incluido
      const boardingPassData = `${seq}/${lastName}/${firstName} ${flightNum} ${origin}${destination} ${seat}`;
      
      // Generar el código con bwip-js
      let canvas = document.createElement('canvas');
      
      bwipjs.toCanvas(canvas, {
        bcid: 'pdf417',        // Tipo de código: PDF417
        text: boardingPassData, // Texto a codificar (ahora incluye asiento)
        scale: 2,              // Escala del código
        height: 10,            // Altura del código
        includetext: false,    // No incluir texto
        textxalign: 'center',  // Alineación del texto
      });
      
      // Convertir a URL de datos
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error al generar el código PDF417:', error);
      setBarcodeError(true);
      return null;
    }
  };
  
  // Configuración de impresión
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      if (onPrint) onPrint();
    },
    pageStyle: printerConfig ? `
      @page {
        size: ${printerConfig.width}${printerConfig.units} ${printerConfig.height}${printerConfig.units};
        margin: 0;
      }
    ` : undefined
  });
  
  // Obtener información de equipaje formateada
  const getBaggageInfo = () => {
    const baggage = passenger?.baggage || { count: 0, weight: 0 };
    if (baggage.count === 0) return '--';
    return `${baggage.count} ${baggage.count === 1 ? 'PC' : 'PCS'} - ${baggage.weight} KG`;
  };
  
  // Actualizar el renderLogo en BoardingPass.jsx
const renderLogo = () => {
    // Si no hay datos de logo, no mostrar nada
    if (!logoData) {
      return null;
    }
    
    // Si es un SVG
    if (typeof logoData === 'string' && logoData.startsWith('<svg')) {
      try {
        return (
          <div 
            style={{ maxWidth: '80px', maxHeight: '40px' }} 
            dangerouslySetInnerHTML={{ __html: logoData }} 
          />
        );
      } catch (error) {
        console.error("Error renderizando SVG:", error);
        return null;
      }
    }
    
    // Si es una URL o data URL
    return (
      <img 
        src={logoData} 
        alt="Airline Logo" 
        style={{ maxWidth: '80px', maxHeight: '40px' }} 
        onError={(e) => {
          console.error("Error cargando imagen de logo:", e);
          // Ocultar la imagen en caso de error
          e.target.style.display = 'none';
        }}
      />
    );
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString || '-';
    }
  };
  
  // Formatear hora
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
    try {
      const parts = timeString.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    } catch (error) {
      return timeString || '-';
    }
  };

  // BarcodeComponent - Componente separado para el código de barras
  const BarcodeComponent = React.memo(() => {
    // Intentar generar el código de barras solo cuando sea necesario
    try {
      const barcodeUrl = generatePDF417();
      
      if (barcodeUrl) {
        return (
          <img 
            src={barcodeUrl} 
            alt="Boarding Pass Code" 
            style={{ width: '100%', height: '100%' }} 
            onError={() => setBarcodeError(true)}
          />
        );
      }
    } catch (e) {
      console.error("Error en componente de código de barras:", e);
    }
    
    // Fallback en caso de error
    return (
      <div style={{ 
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
        fontSize: '11px',
        color: '#666',
        border: '1px dashed #ccc'
      }}>
        Código de embarque no disponible
      </div>
    );
  });

  return (
    <div className="space-y-4">
       {/*Información de la impresora y botones de acción*/} 
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        {/*<div className="w-full md:w-auto">
          {showPrinterSelector ? (
            <PrinterSelector 
              onPrinterChange={handlePrinterChange}
              onConfigClick={onConfigurePrinters}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-sm">
                {printerConfig ? (
                  <>
                    <span className="font-medium">Impresora:</span> {printerConfig.name}
                  </>
                ) : (
                  <span className="text-sand">No hay impresora configurada</span>
                )}
              </div>
              <button 
                onClick={() => setShowPrinterSelector(prev => !prev)} 
                className="text-sand hover:text-noche"
                title="Cambiar impresora"
              >
                <FaCog />
              </button>
            </div>
          )}
        </div>*/}
        
        <div className="flex space-x-2 w-full md:w-auto justify-end">
          {/*{showPrintButton && (
            <button
              onClick={handlePrint}
              className="bg-sand hover:bg-noche text-white font-bold py-2 px-4 rounded flex items-center"
              disabled={!printerConfig}
            >
              <FaPrint className="mr-2" /> 
              {printerConfig?.id === 'pdf-preview' ? 'Vista Previa' : 'Imprimir'}
            </button>
          )}*/}
          
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
      
      {/* Vista previa de la tarjeta */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Vista previa:</h3>
        
        {/* Tarjeta de embarque (este es el componente que se imprimirá) */}
        <div ref={componentRef} className="boarding-pass bg-white" style={{ width: '350px', padding: '10px', fontFamily: 'Arial, sans-serif', margin: '0 auto', border: '1px dashed #ccc' }}>
          {/* Cabecera con logo y título */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h2 style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>BOARDING PASS</h2>
              <h3 style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{flightDetails?.airlineCode || 'XX'} {flightDetails?.flightNumber || '-'}</h3>
            </div>
            
            {/* Logo simplificado */}
            {showLogo && renderLogo()}
          </div>
          
          {/* Información del vuelo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{flightDetails?.origin || 'XXX'} → {flightDetails?.destination || 'XXX'}</div>
              <div style={{ fontSize: '12px' }}>
                DATE: {formatDate(flightDetails?.date)}<br />
                TIME: {formatTime(flightDetails?.std)} LT<br />
                GATE: {flightDetails?.gate || '--'}
              </div>
            </div>
            <div style={{ textAlign: 'center', border: '2px solid #000', padding: '5px 10px', borderRadius: '5px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{passenger?.seat || 'XX'}</div>
              <div style={{ fontSize: '10px' }}>SEAT</div>
            </div>
          </div>
          
          {/* Información del pasajero */}
          <div style={{ marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>PAX</div>
            <div style={{ fontSize: '16px', textTransform: 'uppercase' }}>{passenger?.lastName || '-'}/{passenger?.firstName || '-'}</div>
            <div style={{ fontSize: '12px' }}>
              ID: {passenger?.documentNumber || '-'}<br />
              SQN {passenger?.ticket || '-'}<br />
              BAG: {getBaggageInfo()}
            </div>
          </div>
          
          {/* Código de barras PDF417 */}
          <div style={{ textAlign: 'center', marginBottom: '10px', minHeight: '80px' }}>
            <BarcodeComponent />
          </div>
          
          {/* Pie de página */}
          <div style={{ fontSize: '10px', textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '10px' }}>
          Please proceed to the boarding gate at least 30 minutes before departure.<br/>
          Boarding closes 15 minutes before departure.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardingPass;