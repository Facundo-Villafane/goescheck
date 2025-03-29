// src/services/PrintingService.js

/**
 * Servicio para gestionar impresiones de tarjetas de embarque
 * Proporciona métodos independientes del entorno para impresión
 */
class PrintingService {
    /**
     * Obtener la lista de impresoras disponibles
     * @returns {Promise<Array>} Lista de impresoras
     */
    static async getPrinters() {
      // Primero intentar obtener las impresoras configuradas manualmente
      let printers = [];
      
      try {
        const savedPrinters = localStorage.getItem('configuredPrinters');
        if (savedPrinters) {
          printers = JSON.parse(savedPrinters);
        }

        // Añadir impresora PDF virtual si no existe
        const hasPdfPrinter = printers.some(p => 
          p.name === 'Vista Previa PDF' || p.id === 'pdf-preview'
        );
        
        if (!hasPdfPrinter) {
          printers.push({
            id: 'pdf-preview',
            name: 'Vista Previa PDF',
            description: 'Genera un PDF para previsualizar tarjetas de embarque',
            type: 'virtual',
            isAvailable: true,
            isPdfPrinter: true
          });
        }
      } catch (error) {
        console.error('Error al cargar impresoras configuradas:', error);
      }
      
      // Si estamos en Electron, añadir impresoras del sistema
      if (window.electronAPI && window.electronAPI.getSystemPrinters) {
        try {
          const systemPrinters = await window.electronAPI.getSystemPrinters();
          
          // Marcar las impresoras ya configuradas
          const configuredIds = new Set(printers.map(p => p.name));
          
          // Añadir solo las impresoras del sistema que no estén ya configuradas
          systemPrinters.forEach(sysPrinter => {
            if (!configuredIds.has(sysPrinter.name)) {
              printers.push({
                id: `system-${sysPrinter.name}`,
                name: sysPrinter.name,
                description: sysPrinter.description || `Impresora del sistema: ${sysPrinter.name}`,
                type: 'system', // Tipo predeterminado
                isAvailable: true,
                isSystemPrinter: true
              });
            }
          });
        } catch (error) {
          console.warn('No se pudieron obtener impresoras del sistema:', error);
        }
      }
      
      return printers;
    }
    
    /**
     * Obtener la impresora predeterminada
     * @returns {Promise<Object|null>} Impresora predeterminada o null si no hay
     */
    static async getDefaultPrinter() {
      const printers = await this.getPrinters();
      return printers.find(p => p.isDefault) || (printers.length > 0 ? printers[0] : null);
    }
    
    /**
     * Imprimir contenido HTML en una impresora específica
     * @param {string} printerName Nombre de la impresora
     * @param {HTMLElement} htmlElement Elemento HTML a imprimir
     * @param {Object} options Opciones de impresión
     * @returns {Promise<boolean>} Éxito de la impresión
     */
    static async printContent(printerName, htmlElement, options = {}) {
      // Verificar si es la impresora PDF
      if (printerName === 'Vista Previa PDF' || printerName === 'pdf-preview') {
        return this.generatePdfPreview(htmlElement, options);
      }
      
      // Si estamos en Electron, usar la API nativa
      if (window.electronAPI && window.electronAPI.printHTML) {
        try {
          // Convertir el elemento HTML a una cadena
          const htmlContent = htmlElement.outerHTML;
          return await window.electronAPI.printHTML(printerName, htmlContent, options);
        } catch (error) {
          console.error('Error al imprimir usando Electron:', error);
          // Si falla, intentar con el enfoque del navegador
        }
      }
      
      // Enfoque basado en el navegador (fallback)
      return new Promise((resolve) => {
        // Crear un iframe temporal para la impresión
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        
        document.body.appendChild(iframe);
        
        iframe.onload = () => {
          try {
            // Escribir el contenido HTML en el iframe
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.write(htmlElement.outerHTML);
            doc.close();
            
            // Aplicar estilos para impresión (solo borde de corte)
            const style = doc.createElement('style');
            style.textContent = `
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                }
                @page { 
                  size: 80mm 150mm; 
                  margin: 0; 
                }
              }
            `;
            doc.head.appendChild(style);
            
            // Ejecutar impresión con un pequeño retraso para permitir que los estilos se apliquen
            setTimeout(() => {
              iframe.contentWindow.print();
              
              // Limpiar el iframe después de la impresión
              setTimeout(() => {
                document.body.removeChild(iframe);
                resolve(true);
              }, 1000);
            }, 500);
          } catch (error) {
            console.error('Error al imprimir usando iframe:', error);
            document.body.removeChild(iframe);
            resolve(false);
          }
        };
        
        iframe.onerror = () => {
          console.error('Error al cargar el iframe');
          document.body.removeChild(iframe);
          resolve(false);
        };
      });
    }
    
    /**
     * Generar una vista previa en PDF del contenido
     * @param {HTMLElement} htmlElement Elemento HTML a convertir en PDF
     * @param {Object} options Opciones del PDF
     * @returns {Promise<Object>} Resultado de la generación
     */
    static async generatePdfPreview(htmlElement, options = {}) {
      // Si estamos en Electron, usar la API nativa
      if (window.electronAPI && window.electronAPI.printToPDF) {
        try {
          // Convertir el elemento HTML a una cadena
          const htmlContent = htmlElement.outerHTML;
          
          // Configurar opciones para PDF
          const pdfOptions = {
            pageSize: options.pageSize || 'A4',
            landscape: options.landscape || false,
            printBackground: true,
            marginsType: 1  // sin márgenes
          };
          
          return await window.electronAPI.printToPDF({
            htmlContent: htmlContent,
            options: pdfOptions
          });
        } catch (error) {
          console.error('Error al generar PDF usando Electron:', error);
        }
      }
      
      // Simulación para cuando no estamos en Electron (navegador web)
      return new Promise((resolve) => {
        try {
          console.log('Vista previa PDF (simulada):', htmlElement);
          
          // Crear ventana modal con vista previa
          const previewContainer = document.createElement('div');
          previewContainer.style.position = 'fixed';
          previewContainer.style.top = '0';
          previewContainer.style.left = '0';
          previewContainer.style.width = '100%';
          previewContainer.style.height = '100%';
          previewContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          previewContainer.style.zIndex = '9999';
          previewContainer.style.display = 'flex';
          previewContainer.style.flexDirection = 'column';
          previewContainer.style.alignItems = 'center';
          previewContainer.style.justifyContent = 'center';
          
          // Título
          const titleBar = document.createElement('div');
          titleBar.style.width = '100%';
          titleBar.style.maxWidth = '600px';
          titleBar.style.display = 'flex';
          titleBar.style.justifyContent = 'space-between';
          titleBar.style.alignItems = 'center';
          titleBar.style.padding = '10px';
          titleBar.style.backgroundColor = '#f0f0f0';
          titleBar.style.borderTopLeftRadius = '5px';
          titleBar.style.borderTopRightRadius = '5px';
          
          const title = document.createElement('h3');
          title.textContent = 'Vista Previa PDF - Tarjeta de Embarque';
          title.style.margin = '0';
          title.style.color = '#333';
          
          const closeBtn = document.createElement('button');
          closeBtn.textContent = '✕';
          closeBtn.style.background = 'none';
          closeBtn.style.border = 'none';
          closeBtn.style.fontSize = '18px';
          closeBtn.style.cursor = 'pointer';
          closeBtn.style.color = '#333';
          
          closeBtn.onclick = () => {
            document.body.removeChild(previewContainer);
            resolve({success: true, simulated: true});
          };
          
          titleBar.appendChild(title);
          titleBar.appendChild(closeBtn);
          
          // Contenido
          const contentWrapper = document.createElement('div');
          contentWrapper.style.backgroundColor = 'white';
          contentWrapper.style.padding = '20px';
          contentWrapper.style.maxWidth = '600px';
          contentWrapper.style.width = '100%';
          contentWrapper.style.maxHeight = '80vh';
          contentWrapper.style.overflowY = 'auto';
          contentWrapper.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          
          // Clonar el elemento HTML
          const clone = htmlElement.cloneNode(true);
          contentWrapper.appendChild(clone);
          
          // Agregar todo al contenedor
          previewContainer.appendChild(titleBar);
          previewContainer.appendChild(contentWrapper);
          
          // Mostrar en el cuerpo del documento
          document.body.appendChild(previewContainer);
          
          // Nota: En un entorno real, esto sería reemplazado por la generación real de PDF
          console.log('Simulación de vista previa PDF completada');
        } catch (error) {
          console.error('Error al simular vista previa PDF:', error);
          resolve({success: false, error: error.message});
        }
      });
    }
    
    /**
     * Imprimir una tarjeta de embarque
     * @param {Object} passenger Datos del pasajero
     * @param {Object} flightDetails Detalles del vuelo
     * @param {string} printerName Nombre de la impresora
     * @param {HTMLElement} boardingPassElement Elemento HTML de la tarjeta
     * @returns {Promise<boolean>} Éxito de la impresión
     */
    static async printBoardingPass(passenger, flightDetails, printerName, boardingPassElement) {
      // Verificar si es la impresora PDF
      if (printerName === 'Vista Previa PDF' || printerName === 'pdf-preview') {
        return this.generatePdfPreview(boardingPassElement, {
          pageSize: {width: 80, height: 150, unit: 'mm'},
          landscape: false
        });
      }
      
      // Si estamos en Electron, usar API específica para tarjetas de embarque
      if (window.electronAPI && window.electronAPI.printBoardingPass) {
        try {
          return await window.electronAPI.printBoardingPass(
            passenger, 
            flightDetails, 
            printerName, 
            boardingPassElement.outerHTML
          );
        } catch (error) {
          console.error('Error al imprimir tarjeta de embarque con Electron:', error);
          // Si falla, intentar el método general
        }
      }
      
      // Usar método general de impresión
      return this.printContent(printerName, boardingPassElement, {
        // Opciones específicas para tarjetas de embarque
        landscape: false,
        color: true
      });
    }
    
    /**
     * Imprimir una página de prueba en una impresora específica
     * @param {string} printerName Nombre de la impresora
     * @returns {Promise<boolean>} Éxito de la impresión
     */
    static async printTestPage(printerName) {
      // Verificar si es la impresora PDF
      if (printerName === 'Vista Previa PDF' || printerName === 'pdf-preview') {
        const testElement = this.createTestPageElement(printerName);
        return this.generatePdfPreview(testElement, {
          pageSize: 'A5',
          landscape: false
        });
      }
      
      // Si estamos en Electron, usar la API nativa
      if (window.electronAPI && window.electronAPI.printTest) {
        try {
          return await window.electronAPI.printTest(printerName);
        } catch (error) {
          console.error('Error al imprimir página de prueba con Electron:', error);
          // Si falla, intentar con el enfoque del navegador
        }
      }
      
      // Crear contenido de prueba y usar método general de impresión
      const testElement = this.createTestPageElement(printerName);
      return this.printContent(printerName, testElement);
    }
    
    /**
     * Crear elemento HTML para página de prueba
     * @param {string} printerName Nombre de la impresora
     * @returns {HTMLElement} Elemento HTML de la página de prueba
     */
    static createTestPageElement(printerName) {
      const testElement = document.createElement('div');
      testElement.style.width = '350px';
      testElement.style.padding = '20px';
      testElement.style.fontFamily = 'Arial, sans-serif';
      testElement.innerHTML = `
        <h2 style="text-align: center; font-size: 18px; margin-bottom: 20px;">Página de Prueba</h2>
        <p style="text-align: center; font-size: 14px;">Sistema de Check-in</p>
        <p style="text-align: center; font-size: 14px;">Impresora: ${printerName}</p>
        <p style="text-align: center; font-size: 14px;">Fecha: ${new Date().toLocaleString()}</p>
        <div style="border-top: 1px dashed #000; margin-top: 30px; padding-top: 20px; text-align: center; font-size: 12px;">
          <p>Si puede ver este mensaje, la impresora está funcionando correctamente.</p>
        </div>
      `;
      return testElement;
    }
  }
  
  export default PrintingService;