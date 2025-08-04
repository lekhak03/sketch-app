// Design constants and styles for the sketch app
export const backgroundColors = [
  // Neutral colors
  { color: '#ffffff', name: 'White', category: 'neutral' },
  { color: '#1a1a1a', name: 'Black', category: 'neutral' },
  { color: '#F2F2F7', name: 'Light Gray', category: 'neutral' },
  { color: '#8E8E93', name: 'Gray', category: 'neutral' },
  
  // Vibrant colors
  { color: '#FF3B30', name: 'Red', category: 'vibrant' },
  { color: '#007AFF', name: 'Blue', category: 'vibrant' },
  { color: '#FF9500', name: 'Orange', category: 'vibrant' },
  { color: '#34C759', name: 'Green', category: 'vibrant' },
  { color: '#AF52DE', name: 'Purple', category: 'vibrant' },
  { color: '#FF2D92', name: 'Pink', category: 'vibrant' },
  { color: '#FFCC00', name: 'Yellow', category: 'vibrant' },
  { color: '#5856D6', name: 'Indigo', category: 'vibrant' },
];

// Footer height constant
export const FOOTER_HEIGHT = 40;

// Style functions for dynamic styling
export const getFooterBackgroundColor = (backgroundColor: string) => {
  if (backgroundColor === '#1a1a1a') {
    return 'rgba(26, 26, 26, 0.8)';
  } else if (backgroundColor === '#ffffff') {
    return 'rgba(255, 255, 255, 0.8)';
  } else {
    return `${backgroundColor}CC`;
  }
};

export const getFooterTextColor = (backgroundColor: string) => {
  return backgroundColor === '#1a1a1a' ? '#ffffff' : '#374151';
};

export const getFooterSecondaryTextColor = (backgroundColor: string) => {
  return backgroundColor === '#1a1a1a' ? '#9CA3AF' : '#6B7280';
};

export const getEraserIndicatorStyles = (backgroundColor: string, mousePosition: { x: number; y: number }, eraserWidth: number) => {
  const isLightBackground = backgroundColor === '#ffffff' || backgroundColor === '#F2F2F7';
  
  return {
    left: mousePosition.x,
    top: mousePosition.y,
    transform: 'translate(-50%, -50%)',
    width: `${eraserWidth}px`,
    height: `${eraserWidth}px`,
    borderRadius: '50%',
    background: isLightBackground 
      ? 'rgba(0, 0, 0, 0.2)' 
      : 'rgba(255, 255, 255, 0.15)',
    border: isLightBackground
      ? '2px solid rgba(0, 0, 0, 0.4)'
      : '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: isLightBackground
      ? '0 0 10px rgba(0, 0, 0, 0.3)'
      : '0 0 10px rgba(255, 255, 255, 0.2)'
  };
};

export const getMainContainerStyles = (backgroundColor: string) => {
  return {
    backgroundColor,
    touchAction: 'none' as const
  };
};

export const getCanvasStyles = (backgroundColor: string) => {
  return {
    backgroundColor,
    touchAction: 'none' as const
  };
};

export const getFooterStyles = (backgroundColor: string) => {
  return {
    backgroundColor: getFooterBackgroundColor(backgroundColor)
  };
};

export const getFooterTextStyles = (backgroundColor: string) => {
  return { color: getFooterTextColor(backgroundColor) };
};

export const getFooterSecondaryTextStyles = (backgroundColor: string) => {
  return { color: getFooterSecondaryTextColor(backgroundColor) };
};

// CSS class names for consistent styling
export const cssClasses = {
  // Main container
  mainContainer: "relative w-screen h-screen overflow-hidden",
  
  // Canvas
  canvas: "absolute inset-0",
  
  // Toolbar
  toolbar: "absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 animate-fade-in",
  toolSelection: "flex bg-white/80 backdrop-blur-xl rounded-2xl shadow-ios-lg border border-white/40 overflow-hidden",
  toolButton: "px-4 py-3 transition-all duration-300 ease-out flex items-center gap-2",
  toolButtonActive: "bg-ios-blue text-white shadow-lg",
  toolButtonInactive: "text-ios-gray-700 hover:bg-ios-gray-50 active:scale-95",
  toolDivider: "w-px bg-ios-gray-200",
  
  // Action buttons
  actionButton: "p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-ios-lg border border-white/40 transition-all duration-300 ease-out hover:scale-105 active:scale-95",
  colorToggleButton: "color-toggle p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-ios-lg border border-white/40 text-ios-gray-700 hover:bg-ios-gray-50 transition-all duration-300 ease-out hover:scale-105 active:scale-95",
  exportButton: "text-ios-green hover:bg-ios-green/10",
  exportButtonDisabled: "text-ios-gray-400 cursor-not-allowed",
  clearButton: "text-ios-red hover:bg-ios-red/10",
  clearButtonDisabled: "text-ios-gray-400 cursor-not-allowed",
  
  // Loading spinners
  loadingSpinner: "w-5 h-5 border-2 border-ios-gray-300 rounded-full animate-spin",
  exportSpinner: "border-t-ios-green",
  clearSpinner: "border-t-ios-red",
  
  // Success toast
  successToast: "absolute top-20 left-1/2 transform -translate-x-1/2 animate-slide-up",
  successToastContent: "bg-ios-green/90 backdrop-blur-xl rounded-2xl shadow-ios-lg border border-ios-green/20 px-4 py-3 flex items-center gap-2",
  
  // Color picker
  colorPicker: "absolute top-24 left-1/2 transform -translate-x-1/2 color-picker",
  colorPickerContent: "bg-white/95 backdrop-blur-xl rounded-3xl shadow-ios-xl border border-white/40 p-6 max-w-sm animate-scale-in",
  colorPickerHeader: "flex items-center justify-between mb-4",
  colorPickerTitle: "text-lg font-semibold text-ios-gray-900",
  colorPickerCloseButton: "p-1 rounded-full hover:bg-ios-gray-100 transition-colors",
  colorSection: "mb-4",
  colorSectionTitle: "text-sm font-medium text-ios-gray-600 mb-2",
  colorGrid: "flex flex-wrap gap-2",
  colorButton: "w-10 h-10 rounded-xl transition-all duration-300 ease-out hover:scale-110 active:scale-95",
  colorButtonActive: "ring-3 ring-ios-blue ring-offset-2 shadow-lg scale-110",
  colorButtonInactive: "ring-1 ring-ios-gray-200 hover:ring-ios-gray-300",
  
  // Footer
  footer: "absolute bottom-0 left-0 right-0 backdrop-blur-xl",
  footerContent: "flex items-center justify-between px-6 py-3",
  footerStatus: "flex items-center gap-2",
  footerStatusDot: "w-2 h-2 rounded-full",
  footerStatusText: "text-sm font-medium",
  footerCredit: "text-xs font-medium",
  footerConnection: "flex items-center gap-2",
  
  // Floating action button
  fab: "fixed bottom-20 right-6 md:hidden",
  fabButton: "w-14 h-14 bg-ios-blue rounded-full shadow-ios-xl text-white flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95",
  
  // Eraser indicator
  eraserIndicator: "fixed pointer-events-none z-50 transition-all duration-100 ease-out",
  
  // Cursor classes
  cursorPen: "cursor-pen",
  cursorEraser: "cursor-eraser"
}; 