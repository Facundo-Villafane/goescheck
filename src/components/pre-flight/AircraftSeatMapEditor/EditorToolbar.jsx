import { 
    FaUndo, FaRedo, FaPlus, FaUpload, FaDownload 
  } from 'react-icons/fa';
  
  const EditorToolbar = ({ 
    handleUndo, 
    handleRedo, 
    historyIndex, 
    historyStackLength,
    addRow,
    addSection,
    importConfig,
    exportConfig
  }) => {
    return (
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <div className="flex gap-1 flex-wrap">
          <button 
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            title="Deshacer"
          >
            <FaUndo />
          </button>
          <button 
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= historyStackLength - 1}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            title="Rehacer"
          >
            <FaRedo />
          </button>
          <div className="border-r mx-1 h-8"></div>
          <button 
            type="button"
            onClick={() => addRow('start')}
            className="p-2 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700"
            title="Agregar fila al inicio"
          >
            <FaPlus /> Inicio
          </button>
          <button 
            type="button"
            onClick={() => addRow('end')}
            className="p-2 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700"
            title="Agregar fila al final"
          >
            <FaPlus /> Final
          </button>
          <button 
            type="button"
            onClick={addSection}
            className="p-2 rounded-md bg-green-100 hover:bg-green-200 text-green-700"
            title="Agregar sección"
          >
            <FaPlus /> Sección
          </button>
        </div>
        
        <div className="flex gap-1">
            <button 
                type="button"
                onClick={importConfig}
                className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center"
                title="Importar configuración"
            >
                <FaUpload className="mr-1" /> Importar
            </button>
            <button 
                type="button"
                onClick={exportConfig}
                className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center"
                title="Exportar configuración actual"
            >
                <FaDownload className="mr-1" /> Exportar
            </button>
        </div>
      </div>
    );
  };
  
  export default EditorToolbar;