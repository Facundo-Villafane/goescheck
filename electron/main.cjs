const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { setupPrintingHandlers } = require('./electron-printers-api.cjs');

// Configuración de logging para diagnóstico
function log(message) {
  try {
    const logPath = path.join(app.getPath('userData'), 'app.log');
    fs.appendFileSync(logPath, `${new Date().toISOString()}: ${message}\n`);
    console.log(message); // También mostrar en consola para desarrollo
  } catch (error) {
    console.error('Error writing to log:', error);
  }
}

// Directorio para almacenar datos
const userDataPath = app.getPath('userData');
const configsPath = path.join(userDataPath, 'configs');
log("Electron starting up...");
log("Environment: " + (process.env.NODE_ENV || 'production'));

// Asegurar que el directorio existe
if (!fs.existsSync(configsPath)) {
  fs.mkdirSync(configsPath, { recursive: true });
  log("Created configs directory: " + configsPath);
}

let mainWindow;

function createWindow() {
  log("Creating main window...");
  
  // Debug logging to see what paths are being used
  const preloadPath = path.resolve(__dirname, 'preload.cjs');
  log('__dirname: ' + __dirname);
  log('Preload path: ' + preloadPath);
  log('Path exists: ' + fs.existsSync(preloadPath));
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../build/icons/icon.png'),
    title: "GOES Check-in System v0.1.0",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      // Add these lines to help with debugging
      devTools: true,
      webSecurity: false // Only for development/debugging
    }
  });

  // More debug logging
  log("Window created, loading URL...");
  
  // Cargar la aplicación
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173/');
    log("Loaded development URL");
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, carga desde los archivos construidos
    try {
      const indexPath = path.join(__dirname, '../dist/index.html');
      log("Production index path: " + indexPath);
      log("Path exists: " + fs.existsSync(indexPath));
      
      if (!fs.existsSync(indexPath)) {
        // Intenta buscar en rutas alternativas comunes para producción
        const altPaths = [
          path.join(__dirname, 'dist/index.html'),
          path.join(app.getAppPath(), 'dist/index.html'),
          path.join(process.cwd(), 'dist/index.html'),
          path.join(app.getPath('exe'), '../resources/app/dist/index.html')
        ];
        
        for (const alt of altPaths) {
          log("Checking alternative path: " + alt);
          if (fs.existsSync(alt)) {
            log("Found alternative path: " + alt);
            mainWindow.loadFile(alt);
            break;
          }
        }
        
        // Si no encuentra ninguna alternativa, intenta usar loadURL directamente
        if (!mainWindow.webContents.getURL()) {
          log("No valid index.html found, trying file:// URL");
          mainWindow.loadURL(`file://${__dirname}/../dist/index.html`);
        }
      } else {
        mainWindow.loadFile(indexPath);
        log("Loaded production file");
      }
    } catch (error) {
      log("Error loading index file: " + error.message);
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Evento para saber cuando la ventana está lista
  mainWindow.webContents.on('did-finish-load', () => {
    log("Main window finished loading");
  });
  
  // Capturar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Failed to load: ${errorCode} - ${errorDescription}`);
  });
}

// Cargar variables de entorno para el proceso principal
function loadEnv() {
  try {
    const NODE_ENV = process.env.NODE_ENV || 'production';
    log(`Loading environment for ${NODE_ENV}`);
    
    // Intentar cargar desde .env.{NODE_ENV}
    const envFile = path.join(__dirname, '..', `.env.${NODE_ENV}`);
    log(`Checking env file: ${envFile}`);
    
    if (fs.existsSync(envFile)) {
      const envConfig = require('dotenv').parse(fs.readFileSync(envFile));
      Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
      });
      log(`Loaded environment variables from: ${envFile}`);
    } else {
      log(`Environment file not found: ${envFile}`);
      
      // Intentar cargar desde config.json en userDataPath (para producción)
      const configPath = path.join(app.getPath('userData'), 'config.json');
      log(`Checking config file: ${configPath}`);
      
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        Object.assign(process.env, config);
        log(`Loaded config from: ${configPath}`);
      } else {
        log(`Config file not found: ${configPath}`);
      }
    }
    
    // Registrar las variables VITE cargadas
    const loadedVars = Object.keys(process.env)
      .filter(key => key.startsWith('VITE_'))
      .join(', ');
    log(`Loaded VITE variables: ${loadedVars || 'none'}`);
  } catch (error) {
    log(`Error loading environment: ${error.message}`);
  }
}

// Cargar variables antes de hacer cualquier otra cosa
loadEnv();

function checkRequiredEnv() {
  const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN'];
  const missing = required.filter(key => !process.env[`${key}`]);
  
  if (missing.length > 0) {
    log(`Warning: Missing environment variables: ${missing.join(', ')}`);
    
    // En producción, crear variables dummy para permitir que la app continúe
    if (process.env.NODE_ENV !== 'development') {
      log("Creating dummy variables for production");
      missing.forEach(key => {
        process.env[key] = `dummy-${key}`;
      });
      return true;
    }
    
    return false;
  }
  
  return true;
}

// Add these IPC handlers directly in main.cjs
function setupPrinterHandlers() {
  // Get list of system printers
  ipcMain.handle('getSystemPrinters', async (event) => {
    try {
      // Access the webContents object directly
      const printers = mainWindow.webContents.getPrinters();
      return printers;
    } catch (error) {
      log('Error getting system printers: ' + error.message);
      return [];
    }
  });

  // Add handlers for other printer operations...
  ipcMain.handle('printTest', async (event, printerName) => {
    // Implementation...
    log('Print test requested for: ' + printerName);
    return true; // Temporary placeholder
  });

  ipcMain.handle('printHTML', async (event, { printerName, htmlContent, options }) => {
    // Implementation...
    log('Print HTML requested for: ' + printerName);
    return true; // Temporary placeholder
  });

  ipcMain.handle('printBoardingPass', async (event, { passenger, flightDetails, printerName, options }) => {
    // Implementation...
    log('Print boarding pass requested for: ' + (passenger?.lastName || 'unknown'));
    return true; // Temporary placeholder
  });
}

// Manejador de errores no capturados
process.on('uncaughtException', (error) => {
  log(`UNCAUGHT EXCEPTION: ${error.message}`);
  log(error.stack);
  fs.writeFileSync(
    path.join(app.getPath('userData'), 'error.log'),
    `${new Date().toISOString()}: ${error.stack}\n`,
    { flag: 'a' }
  );
});

// Inicializar la aplicación y configurar los manejadores de impresión
app.whenReady().then(() => {
  log("App is ready");
  
  // Verificar variables de entorno requeridas
  const envOk = checkRequiredEnv();
  if (!envOk && process.env.NODE_ENV === 'development') {
    log("Exiting due to missing required environment variables in development");
    app.exit(1);
    return;
  }
  
  createWindow();
  
  // Configurar los manejadores de impresión
  setupPrintingHandlers();
  setupPrinterHandlers(); 
  
  log("Setup complete");
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    log("All windows closed, quitting app");
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    log("App activated, creating window");
    createWindow();
  }
});

if (ipcMain.eventNames().includes('dialog:openFile')) {
  ipcMain.removeHandler('dialog:openFile');
}
// Manejador para abrir el diálogo de selección de archivos
ipcMain.handle('dialog:openFile', async () => {
  log("Open file dialog requested");
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
    ]
  });
  if (canceled) {
    log("File dialog canceled");
    return null;
  } else {
    log(`File selected: ${filePaths[0]}`);
    return filePaths[0];
  }
});

// Manejador para guardar configuración de aeronave
ipcMain.handle('config:save', async (event, { configName, data }) => {
  try {
    log(`Saving config: ${configName}`);
    const filePath = path.join(configsPath, `${configName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    log(`Config saved to: ${filePath}`);
    return { success: true, path: filePath };
  } catch (error) {
    log(`Error saving config: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// Manejador para cargar configuración
ipcMain.handle('config:load', async (event, { configName }) => {
  try {
    log(`Loading config: ${configName}`);
    const filePath = path.join(configsPath, `${configName}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      log(`Config loaded from: ${filePath}`);
      return { success: true, data: JSON.parse(data) };
    } else {
      log(`Config file not found: ${filePath}`);
      return { success: false, error: 'Config file not found' };
    }
  } catch (error) {
    log(`Error loading config: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// Manejador para listar configuraciones disponibles
ipcMain.handle('config:list', async () => {
  try {
    log("Listing available configs");
    const files = fs.readdirSync(configsPath)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    log(`Found ${files.length} configs`);
    return { success: true, configs: files };
  } catch (error) {
    log(`Error listing configs: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// Manejador para guardar datos del vuelo completo
ipcMain.handle('flight:save', async (event, { flightNumber, data }) => {
  try {
    log(`Saving flight data: ${flightNumber}`);
    const flightsPath = path.join(userDataPath, 'flights');
    if (!fs.existsSync(flightsPath)) {
      fs.mkdirSync(flightsPath, { recursive: true });
      log(`Created flights directory: ${flightsPath}`);
    }
    
    const filePath = path.join(flightsPath, `${flightNumber}_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    log(`Flight data saved to: ${filePath}`);
    return { success: true, path: filePath };
  } catch (error) {
    log(`Error saving flight data: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// Añadir un nuevo manejador específico para leer archivos Excel
ipcMain.handle('read:excelFile', async (event, filePath) => {
  try {
    log(`Reading Excel file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      log(`File does not exist: ${filePath}`);
      throw new Error('El archivo no existe');
    }
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      log('Could not find worksheet');
      throw new Error('No se pudo encontrar la hoja de trabajo');
    }
    
    const data = [];
    const headers = [];
    
    // Extraer cabeceras
    worksheet.getRow(1).eachCell((cell) => {
      headers.push(cell.value);
    });
    
    log(`Headers found: ${headers.join(', ')}`);
    
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
    
    log(`Found ${data.length} rows of data`);
    return data;
  } catch (error) {
    log(`Error reading Excel file: ${error.message}`);
    throw error;
  }
});

// Manejador para guardar archivo Excel
ipcMain.handle('save:excelFile', async (event, { filePath, data }) => {
  try {
    log('Saving Excel file');
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
      log('No path provided, showing save dialog');
      const { canceled, filePath: savePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Guardar archivo Excel',
        defaultPath: 'passengers.xlsx',
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] }
        ]
      });
      
      if (canceled) {
        log('Save dialog canceled');
        return false;
      }
      
      filePath = savePath;
    }
    
    await workbook.xlsx.writeFile(filePath);
    log(`Excel file saved to: ${filePath}`);
    return true;
  } catch (error) {
    log(`Error saving Excel file: ${error.message}`);
    throw error;
  }
});

// Manejador para imprimir a PDF
ipcMain.handle('print:toPDF', async () => {
  try {
    log('Print to PDF requested');
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Guardar PDF',
      defaultPath: 'check-in-summary.pdf',
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });
    
    if (canceled) {
      log('PDF save dialog canceled');
      return false;
    }
    
    const data = await mainWindow.webContents.printToPDF({
      printBackground: true,
      landscape: false,
      pageSize: 'A4'
    });
    
    fs.writeFileSync(filePath, data);
    log(`PDF saved to: ${filePath}`);
    return true;
  } catch (error) {
    log(`Error printing to PDF: ${error.message}`);
    throw error;
  }
});