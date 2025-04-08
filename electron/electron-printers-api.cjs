// Módulo para gestionar impresoras y funcionalidades de impresión en Electron
const { ipcMain, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Set up IPC events for printers and printing
function setupPrintingHandlers() {
  // Get list of system printers
  ipcMain.handle('getSystemPrinters', async (event) => {
    try {
      // Fix: Use webContents property to access getPrinters
      const printers = event.sender.webContents.getPrinters();
      return printers;
    } catch (error) {
      console.error('Error getting system printers:', error);
      
      // Alternative approach if the above doesn't work
      try {
        // Get the focused window and use its webContents
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
          return focusedWindow.webContents.getPrinters();
        }
        return [];
      } catch (fallbackError) {
        console.error('Fallback error getting printers:', fallbackError);
        return [];
      }
    }
  });

  // Imprimir a PDF y mostrar vista previa
ipcMain.handle('printToPDF', async (event, { htmlContent, options = {} }) => {
    try {
      // Guardar el contenido HTML en un archivo temporal
      const tempFile = path.join(os.tmpdir(), `print-pdf-${Date.now()}.html`);
      fs.writeFileSync(tempFile, htmlContent, 'utf8');
  
      // Crear ventana oculta para la generación del PDF
      const pdfWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
      });
  
      // Cargar el archivo HTML
      await pdfWindow.loadFile(tempFile);
  
      // Configurar opciones del PDF
      const pdfOptions = {
        marginsType: 1, // sin margen
        printBackground: true,
        pageSize: options.pageSize || 'A4',
        landscape: options.landscape || false,
      };
  
      // Generar PDF
      const pdfData = await pdfWindow.webContents.printToPDF(pdfOptions);
      
      // Guardar el PDF en un archivo temporal
      const pdfPath = path.join(os.tmpdir(), `boarding-pass-${Date.now()}.pdf`);
      fs.writeFileSync(pdfPath, pdfData);
  
      // Limpiar recursos
      pdfWindow.close();
      fs.unlinkSync(tempFile);
  
      // Abrir el PDF con la aplicación predeterminada del sistema
      const { shell } = require('electron');
      shell.openPath(pdfPath);
  
      return {
        success: true,
        pdfPath
      };
    } catch (error) {
      console.error('Error generando vista previa PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Imprimir una página de prueba en una impresora específica
  ipcMain.handle('printTest', async (event, printerName) => {
    try {
      // Crear contenido de prueba como HTML
      const testContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Página de Prueba</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 2cm;
              text-align: center;
            }
            h1 {
              font-size: 18px;
              margin-bottom: 1cm;
            }
            p {
              font-size: 12px;
              margin-bottom: 0.5cm;
            }
            .footer {
              margin-top: 1cm;
              border-top: 1px dashed #000;
              padding-top: 0.5cm;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <h1>PÁGINA DE PRUEBA</h1>
          <p>Sistema de Check-in - Impresión de Tarjeta de Embarque</p>
          <p>Impresora: ${printerName}</p>
          <p>Fecha y hora: ${new Date().toLocaleString()}</p>
          <div class="footer">
            Si esta página se imprimió correctamente, la impresora está configurada adecuadamente.
          </div>
        </body>
        </html>
      `;

      // Guardar en archivo temporal
      const tempFile = path.join(os.tmpdir(), `test-print-${Date.now()}.html`);
      fs.writeFileSync(tempFile, testContent, 'utf8');

      // Crear ventana oculta para imprimir
      const printWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
      });

      // Cargar el contenido HTML
      await printWindow.loadFile(tempFile);

      // Configurar opciones de impresión
      const options = {
        silent: true,
        printBackground: true,
        color: true,
        margin: {
          marginType: 'custom',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        },
        deviceName: printerName,
      };

      // Imprimir
      const success = await new Promise((resolve) => {
        printWindow.webContents.print(options, (success, failureReason) => {
          resolve(success);
        });
      });

      // Limpiar recursos
      printWindow.close();
      fs.unlinkSync(tempFile);

      return success;
    } catch (error) {
      console.error('Error imprimiendo página de prueba:', error);
      return false;
    }
  });

  // Imprimir contenido HTML directamente
  ipcMain.handle('printHTML', async (event, { printerName, htmlContent, options = {} }) => {
    try {
      // Guardar el contenido HTML en un archivo temporal
      const tempFile = path.join(os.tmpdir(), `print-${Date.now()}.html`);
      fs.writeFileSync(tempFile, htmlContent, 'utf8');

      // Crear ventana oculta para la impresión
      const printWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
      });

      // Cargar el archivo HTML
      await printWindow.loadFile(tempFile);

      // Configurar opciones de impresión
      const printOptions = {
        silent: true,
        printBackground: true,
        color: options.color !== false,
        margin: options.margin || {
          marginType: 'custom',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        },
        landscape: options.landscape || false,
        deviceName: printerName,
      };

      // Imprimir
      const success = await new Promise((resolve) => {
        printWindow.webContents.print(printOptions, (success, failureReason) => {
          resolve(success);
        });
      });

      // Limpiar recursos
      printWindow.close();
      fs.unlinkSync(tempFile);

      return success;
    } catch (error) {
      console.error('Error imprimiendo contenido HTML:', error);
      return false;
    }
  });

  // Generar e imprimir un PDF de boarding pass
  ipcMain.handle('printBoardingPass', async (event, { passenger, flightDetails, printerName, options = {} }) => {
    try {
      // Este manejador podría implementar lógica específica para tarjetas de embarque,
      // como generar el PDF417 en el servidor y luego imprimir.
      // Por ahora, simplemente delegamos al manejador de impresión HTML general
      
      // El contenido HTML se recibiría del renderer
      return await event.invoke('printHTML', { printerName, htmlContent: options.htmlContent });
    } catch (error) {
      console.error('Error imprimiendo tarjeta de embarque:', error);
      return false;
    }
  });
  
  return {
    // Exponer funciones para pruebas o configuración desde el código principal
    getSystemPrinters: (webContents) => webContents.getPrinters()
  };
}

module.exports = { setupPrintingHandlers };