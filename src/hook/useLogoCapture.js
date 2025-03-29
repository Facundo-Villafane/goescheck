// src/hooks/useLogoCapture.js
import { useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';

/**
 * Hook personalizado para capturar un componente como imagen
 * @returns {Object} - Objeto con referencia y función para capturar
 */
const useLogoCapture = () => {
  // Referencia para el componente Logo
  const logoRef = useRef(null);
  
  // Función para capturar el logo como imagen
  const captureLogoAsImage = useCallback(() => {
    return new Promise(async (resolve) => {
      if (!logoRef.current) {
        console.warn('Logo reference not found');
        resolve(null);
        return;
      }

      try {
        const canvas = await html2canvas(logoRef.current, {
          backgroundColor: null,
          scale: 2, // Mayor escala para mejor calidad
          logging: false,
          useCORS: true
        });
        
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        console.error('Error capturing logo:', error);
        resolve(null);
      }
    });
  }, []);

  return { logoRef, captureLogoAsImage };
};

export default useLogoCapture;