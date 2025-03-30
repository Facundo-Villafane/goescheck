const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

// Directorio para almacenar datos
const userDataPath = app.getPath('userData');
const configsPath = path.join(userDataPath, 'configs')
// Asegurar que el directorio existe
if (!fs.existsSync(configsPath)) {
  fs.mkdirSync(configsPath, { recursive: true });
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../build/icons/icon.png'), // Añade un ícono
    title: "GOES Check-in System v0.1.0", // Título de la ventana
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // En desarrollo, carga desde el servidor de desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173/');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, carga desde los archivos construidos
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


// Inicializar la aplicación y configurar los manejadores de impresión
app.whenReady().then(() => {
  createWindow();
  
  // Configurar los manejadores de impresión
  setupPrintingHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

if (ipcMain.eventNames().includes('dialog:openFile')) {
  ipcMain.removeHandler('dialog:openFile');
}
// Manejador para abrir el diálogo de selección de archivos
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
    ]
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

// Manejador para guardar configuración de aeronave
ipcMain.handle('config:save', async (event, { configName, data }) => {
  try {
    const filePath = path.join(configsPath, `${configName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error saving config:', error);
    return { success: false, error: error.message };
  }
});

// Manejador para cargar configuración
ipcMain.handle('config:load', async (event, { configName }) => {
  try {
    const filePath = path.join(configsPath, `${configName}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    } else {
      return { success: false, error: 'Config file not found' };
    }
  } catch (error) {
    console.error('Error loading config:', error);
    return { success: false, error: error.message };
  }
});

// Manejador para listar configuraciones disponibles
ipcMain.handle('config:list', async () => {
  try {
    const files = fs.readdirSync(configsPath)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    return { success: true, configs: files };
  } catch (error) {
    console.error('Error listing configs:', error);
    return { success: false, error: error.message };
  }
});

// Manejador para guardar datos del vuelo completo
ipcMain.handle('flight:save', async (event, { flightNumber, data }) => {
  try {
    const flightsPath = path.join(userDataPath, 'flights');
    if (!fs.existsSync(flightsPath)) {
      fs.mkdirSync(flightsPath, { recursive: true });
    }
    
    const filePath = path.join(flightsPath, `${flightNumber}_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error saving flight data:', error);
    return { success: false, error: error.message };
  }
});

// Añadir un nuevo manejador específico para leer archivos Excel
ipcMain.handle('read:excelFile', async (event, filePath) => {
  try {
    console.log('Leyendo archivo Excel:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('El archivo no existe:', filePath);
      throw new Error('El archivo no existe');
    }
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      console.error('No se pudo encontrar la hoja de trabajo');
      throw new Error('No se pudo encontrar la hoja de trabajo');
    }
    
    const data = [];
    const headers = [];
    
    // Extraer cabeceras
    worksheet.getRow(1).eachCell((cell) => {
      headers.push(cell.value);
    });
    
    console.log('Cabeceras encontradas:', headers);
    
    // Extraer datos
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Omitir la fila de cabeceras
        const rowData = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber <= headers.length) {
            rowData[headers[colNumber - 1]] = cell.value;
          }
        });
        data.push(rowData);
      }
    });
    
    console.log(`Se encontraron ${data.length} filas de datos`);
    return data;
  } catch (error) {
    console.error('Error al leer archivo Excel:', error);
    throw error;
  }
});

// Manejador para guardar archivo Excel
ipcMain.handle('save:excelFile', async (event, { filePath, data }) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Passengers');
    
    // Añadir cabeceras
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      
      // Añadir datos
      data.forEach(item => {
        worksheet.addRow(Object.values(item));
      });
    }
    
    // Si no se proporciona ruta, mostrar diálogo para guardar
    if (!filePath) {
      const { canceled, filePath: savePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Guardar archivo Excel',
        defaultPath: 'passengers.xlsx',
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] }
        ]
      });
      
      if (canceled) {
        return false;
      }
      
      filePath = savePath;
    }
    
    await workbook.xlsx.writeFile(filePath);
    return true;
  } catch (error) {
    console.error('Error saving Excel file:', error);
    throw error;
  }
});

// Manejador para imprimir a PDF
ipcMain.handle('print:toPDF', async () => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Guardar PDF',
      defaultPath: 'check-in-summary.pdf',
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });
    
    if (canceled) {
      return false;
    }
    
    const data = await mainWindow.webContents.printToPDF({
      printBackground: true,
      landscape: false,
      pageSize: 'A4'
    });
    
    fs.writeFileSync(filePath, data);
    return true;
  } catch (error) {
    console.error('Error printing to PDF:', error);
    throw error;
  }
});