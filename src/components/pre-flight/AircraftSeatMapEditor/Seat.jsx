// src/components/pre-flight/AircraftSeatMapEditor/Seat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaCheck, FaTrash, FaPencilAlt, FaBan, FaStar, FaWheelchair } from 'react-icons/fa';

// ID único para controlar qué menú está abierto
let openMenuId = null;

// Componente para un asiento individual
const Seat = ({ 
  seat, 
  sectionColor, 
  rowIndex, 
  seatIndex, 
  toggleSeatProperty, 
  deleteSeat,
  updateSeatLabel,
  closeAllMenus 
}) => {
  // Estados
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabel, setNewLabel] = useState(seat.label);
  
  // Referencias
  const menuRef = useRef(null);
  const labelInputRef = useRef(null);
  const seatRef = useRef(null);
  
  // Generar un ID único para este asiento
  const menuId = useRef(`seat-menu-${rowIndex}-${seatIndex}-${Math.random().toString(36).substring(2, 9)}`);
  
  // Efecto para manejar clic fuera del menú
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        
        // Si estaba editando la etiqueta, guardarla
        if (isEditingLabel) {
          handleSaveLabel();
        }
      }
    };
    
    if (menuOpen) {
      // Si este menú se está abriendo, cerrar cualquier otro menú abierto
      if (openMenuId && openMenuId !== menuId.current) {
        // Disparar un evento personalizado para cerrar otros menús
        window.dispatchEvent(new CustomEvent('closeAllMenus', { 
          detail: { except: menuId.current } 
        }));
      }
      
      // Establecer este como el menú abierto actual
      openMenuId = menuId.current;
      
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, isEditingLabel]);
  
  // Efecto para escuchar evento de cierre
  useEffect(() => {
    const handleCloseAllMenus = (event) => {
      // Cerrar este menú si no es la excepción
      if (event.detail.except !== menuId.current) {
        setMenuOpen(false);
        
        // Si estaba editando la etiqueta, guardarla
        if (isEditingLabel) {
          handleSaveLabel();
        }
      }
    };
    
    window.addEventListener('closeAllMenus', handleCloseAllMenus);
    
    return () => {
      window.removeEventListener('closeAllMenus', handleCloseAllMenus);
    };
  }, [isEditingLabel]);
  
  // Efecto para enfocar el input al editar
  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      // Enfocar y seleccionar todo el texto
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);
  
  // Función para validar etiqueta
  const validateLabel = (label) => {
    // Debe tener algún valor
    if (!label || label.trim() === '') {
      return false;
    }
    
    // Limitar a máximo 2 caracteres
    if (label.length > 2) {
      return false;
    }
    
    // Debe ser una letra válida o un número corto
    const validPattern = /^[A-Z0-9]{1,2}$/i;
    return validPattern.test(label);
  };
  
  // Función para guardar la etiqueta
  const handleSaveLabel = () => {
    // Convertir a mayúsculas y eliminar espacios
    const trimmedLabel = newLabel.trim().toUpperCase();
    
    if (validateLabel(trimmedLabel)) {
      // Usar la función de actualización solo si la etiqueta es válida y diferente
      if (trimmedLabel !== seat.label) {
        updateSeatLabel(rowIndex, seatIndex, trimmedLabel);
      }
    } else {
      // Si no es válida, volver a la etiqueta original
      setNewLabel(seat.label);
      
      // Notificar error
      if (seatRef.current) {
        seatRef.current.classList.add('shake-animation');
        setTimeout(() => {
          if (seatRef.current) {
            seatRef.current.classList.remove('shake-animation');
          }
        }, 500);
      }
    }
    
    setIsEditingLabel(false);
  };
  
  // Manejar tecla en edición de etiqueta
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveLabel();
    } else if (e.key === 'Escape') {
      // Cancelar edición
      setNewLabel(seat.label);
      setIsEditingLabel(false);
    }
  };
  
  // Determinar clases para el asiento según sus propiedades
  let seatClasses = "w-10 h-10 flex items-center justify-center border rounded-md cursor-pointer transition-all duration-200 ";
  
  if (seat.isBlocked) {
    seatClasses += "bg-gray-300 text-gray-500 border-gray-400";
  } else if (seat.isPremium) {
    seatClasses += "bg-purple-100 border-purple-300 text-purple-700";
  } else if (seat.isSpecial) {
    seatClasses += "bg-yellow-100 border-yellow-300 text-yellow-700";
  } else {
    seatClasses += "bg-opacity-10 border-opacity-30 text-opacity-90";
  }

  // Agregar clase para animación de error
  seatClasses += " relative"; // Para posicionar absolutamente el elemento de error
  
  return (
    <div className="relative" ref={menuRef}>
      <div 
        ref={seatRef}
        className={seatClasses}
        style={{ 
          backgroundColor: seat.isBlocked ? undefined : `${sectionColor}20`,
          borderColor: seat.isBlocked ? undefined : `${sectionColor}60`,
          color: seat.isBlocked ? undefined : sectionColor
        }}
        onClick={() => {
          if (!isEditingLabel) {
            setMenuOpen(!menuOpen);
          }
        }}
      >
        {isEditingLabel ? (
          <input
            ref={labelInputRef}
            type="text"
            className="w-7 h-7 text-center border border-blue-400 rounded"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onBlur={handleSaveLabel}
            onKeyDown={handleKeyDown}
            maxLength={2}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{seat.label}</span>
        )}
        
        {/* Indicadores visuales de propiedades especiales */}
        {!isEditingLabel && (
          <div className="absolute -top-1 -right-1 flex">
            {seat.isPremium && (
              <span className="text-purple-500" title="Asiento premium">
                <FaStar size={8} />
              </span>
            )}
            {seat.isSpecial && (
              <span className="text-yellow-600 ml-0.5" title="Asiento especial">
                <FaWheelchair size={8} />
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Menú contextual del asiento */}
      {menuOpen && (
        <div className="absolute top-full mt-1 bg-white shadow-lg rounded-md p-1 z-10 min-w-36">
          <div className="font-medium text-xs py-1 px-2 text-gray-500 border-b">
            Asiento {seat.id}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditingLabel(true);
              setNewLabel(seat.label);
              setMenuOpen(false);
            }}
            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center"
          >
            <FaPencilAlt size={10} className="mr-2" /> Editar etiqueta
          </button>
          <button
            type="button"
            onClick={() => {
              toggleSeatProperty(rowIndex, seatIndex, 'blocked');
              setMenuOpen(false);
            }}
            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center"
          >
            <FaBan size={10} className="mr-2" />
            {seat.isBlocked ? 'Desbloquear asiento' : 'Bloquear asiento'}
            {seat.isBlocked && <FaCheck size={12} className="ml-auto" />}
          </button>
          <button
            type="button"
            onClick={() => {
              toggleSeatProperty(rowIndex, seatIndex, 'premium');
              setMenuOpen(false);
            }}
            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center"
          >
            <FaStar size={10} className="mr-2" />
            {seat.isPremium ? 'Quitar premium' : 'Marcar como premium'}
            {seat.isPremium && <FaCheck size={12} className="ml-auto" />}
          </button>
          <button
            type="button"
            onClick={() => {
              toggleSeatProperty(rowIndex, seatIndex, 'special');
              setMenuOpen(false);
            }}
            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center"
          >
            <FaWheelchair size={10} className="mr-2" />
            {seat.isSpecial ? 'Quitar especial' : 'Marcar como especial'}
            {seat.isSpecial && <FaCheck size={12} className="ml-auto" />}
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            type="button"
            onClick={() => {
              // Confirmar antes de eliminar
              if (window.confirm(`¿Estás seguro de eliminar el asiento ${seat.id}?`)) {
                deleteSeat(rowIndex, seatIndex);
                setMenuOpen(false);
              }
            }}
            className="block w-full text-left px-2 py-1 text-sm hover:bg-red-100 text-red-600 rounded flex items-center"
          >
            <FaTrash size={10} className="mr-2" /> Eliminar asiento
          </button>
        </div>
      )}
      
      {/* Estilos para la animación de error */}
      <style jsx>{`
        .shake-animation {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-1px); }
          20%, 40%, 60%, 80% { transform: translateX(1px); }
        }
      `}</style>
    </div>
  );
};

export default Seat;