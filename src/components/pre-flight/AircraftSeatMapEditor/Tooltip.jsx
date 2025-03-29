const Tooltip = ({ children, content }) => {
    return (
      <div className="relative group">
        {children}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 min-w-max z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </div>
      </div>
    );
  };
  
  export default Tooltip;