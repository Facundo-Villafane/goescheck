// Actualización de preload.js para exponer APIs de impresión

const { contextBridge, ipcRenderer } = require('electron');
const ExcelJS = require('exceljs');

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