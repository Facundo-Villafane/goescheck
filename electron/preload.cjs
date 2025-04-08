// Actualización de preload.js para exponer APIs de impresión

const { contextBridge, ipcRenderer } = require('electron');
// Try to load ExcelJS with robust error handling
let ExcelJS;
try {
  ExcelJS = require('exceljs');
  console.log('ExcelJS loaded successfully');
} catch (error) {
  console.error('Failed to load ExcelJS:', error);
  // Create a dummy ExcelJS object that will show error messages
  ExcelJS = {
    Workbook: class {
      constructor() {
        throw new Error('ExcelJS module could not be loaded. Please check your installation.');
      }
    }
  };
}

// Exponer variables de entorno seguras
contextBridge.exposeInMainWorld('env', {
  FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
});

// Exponer APIs seguras a la ventana de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Funciones existentes...
  selectExcelFile: async () => {
    return await ipcRenderer.invoke('dialog:openFile');
  },
  
  readExcelFile: async (filePath) => {
    try {
      return await ipcRenderer.invoke('read:excelFile', filePath);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      throw error;
    }
  },
  
  saveExcelFile: async (filePath, data) => {
    try {
      return await ipcRenderer.invoke('save:excelFile', { filePath, data });
    } catch (error) {
      console.error('Error saving Excel file:', error);
      throw error;
    }
  },
  
  printToPDF: async () => {
    return await ipcRenderer.invoke('print:toPDF');
  },
  
  saveConfig: async (configName, data) => {
    return await ipcRenderer.invoke('config:save', { configName, data });
  },
  
  loadConfig: async (configName) => {
    return await ipcRenderer.invoke('config:load', { configName });
  },
  
  listConfigs: async () => {
    return await ipcRenderer.invoke('config:list');
  },
  
  saveFlight: async (flightNumber, data) => {
    return await ipcRenderer.invoke('flight:save', { flightNumber, data });
  },
  
  // Nuevas funciones para impresoras e impresión
  
  // Obtener lista de impresoras del sistema
  getSystemPrinters: async () => {
    try {
      return await ipcRenderer.invoke('getSystemPrinters');
    } catch (error) {
      console.error('Error obteniendo impresoras del sistema:', error);
      throw error;
    }
  },
  
  // Imprimir una página de prueba en una impresora específica
  printTest: async (printerName) => {
    try {
      return await ipcRenderer.invoke('printTest', printerName);
    } catch (error) {
      console.error('Error imprimiendo página de prueba:', error);
      throw error;
    }
  },
  
  // Imprimir contenido HTML en una impresora específica
  printHTML: async (printerName, htmlContent, options = {}) => {
    try {
      return await ipcRenderer.invoke('printHTML', {
        printerName,
        htmlContent,
        options
      });
    } catch (error) {
      console.error('Error imprimiendo contenido HTML:', error);
      throw error;
    }
  },
  
  // Generar e imprimir una tarjeta de embarque
  printBoardingPass: async (passenger, flightDetails, printerName, htmlContent) => {
    try {
      return await ipcRenderer.invoke('printBoardingPass', {
        passenger,
        flightDetails,
        printerName,
        options: {
          htmlContent
        }
      });
    } catch (error) {
      console.error('Error imprimiendo tarjeta de embarque:', error);
      throw error;
    }
  }
});