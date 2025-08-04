import { useEffect, useState } from 'react';
import { Brush, Eraser, Trash2, Download, Palette, Settings, X, Check } from 'lucide-react';
import { useCanvas } from './hooks/useCanvas';
import { exportPng } from './hooks/utils'
import { ERASER_WIDTH } from './constants';
import { 
  backgroundColors, 
  FOOTER_HEIGHT,
  cssClasses,
  getMainContainerStyles,
  getCanvasStyles,
  getFooterStyles,
  getFooterTextStyles,
  getFooterSecondaryTextStyles,
  getEraserIndicatorStyles
} from './homeDesign';

function App() {
  const currentBackgroundColor = localStorage.getItem('backgroundColor');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [backgroundColor, setBackgroundColor] = useState<string>(currentBackgroundColor || '#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);

  const {
    canvasRef,
    startDrawing,
    draw,
    paths,
    stopDrawing,
    clearCanvas,
    handleDatabaseUpdate,
    redrawPaths,
  } = useCanvas(backgroundColor);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - FOOTER_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      localStorage.setItem('backgroundColor', backgroundColor)
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let savedPathsString = localStorage.getItem('drawPaths');
    const savedPaths = savedPathsString ? JSON.parse(savedPathsString) : [];

    if (savedPaths.length > 0) { redrawPaths(savedPaths) }
    else redrawPaths(paths);

  }, [backgroundColor, startDrawing]);

  useEffect(() => {
    handleDatabaseUpdate();
  }, []);

  // Mouse tracking for eraser indicator
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseEnter = () => {
      setIsMouseOverCanvas(true);
    };

    const handleMouseLeave = () => {
      setIsMouseOverCanvas(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // handle the main calls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDraw = (event: MouseEvent | TouchEvent) => {
      draw(event, tool);
    };

    const handleStartDrawing = (event: MouseEvent | TouchEvent) => {
      startDrawing(event, tool);
    };

    // Mouse events
    canvas.addEventListener('mousedown', handleStartDrawing);
    canvas.addEventListener('mousemove', handleDraw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('mouseover', stopDrawing);
    canvas.addEventListener('mousedown', stopDrawing);
    canvas.addEventListener('click', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', handleStartDrawing);
    canvas.addEventListener('touchmove', handleDraw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    return () => {
      // drawing mouse
      canvas.removeEventListener('mousedown', handleStartDrawing);
      canvas.removeEventListener('mousemove', handleDraw);
      // stop drawing
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mousedown', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('mouseover', stopDrawing);
      canvas.removeEventListener('click', stopDrawing);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);

      // drawing touch
      canvas.removeEventListener('touchstart', handleStartDrawing);
      canvas.removeEventListener('touchmove', handleDraw);
    };
  }, [startDrawing, draw, stopDrawing, redrawPaths]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.color-picker') && !target.closest('.color-toggle')) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportPng(canvasRef?.current?.toDataURL('image/png') || '');
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      clearCanvas();
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsClearing(false);
    }
  };

  const neutralColors = backgroundColors.filter(color => color.category === 'neutral');
  const vibrantColors = backgroundColors.filter(color => color.category === 'vibrant');

  return (
    <div className={cssClasses.mainContainer} style={getMainContainerStyles(backgroundColor)}>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`${cssClasses.canvas} ${tool === 'eraser' ? cssClasses.cursorEraser : cssClasses.cursorPen}`}
        style={getCanvasStyles(backgroundColor)}
      />

      {/* Eraser Indicator Circle */}
      {tool === 'eraser' && isMouseOverCanvas && (
        <div 
          className={cssClasses.eraserIndicator}
          style={getEraserIndicatorStyles(backgroundColor, mousePosition, ERASER_WIDTH)}
        />
      )}

      {/* Top Toolbar - Modern iOS Style */}
      <div className={cssClasses.toolbar}>
        
        {/* Tool Selection */}
        <div className={cssClasses.toolSelection}>
          <button
            onClick={() => setTool('pen')}
            className={`${cssClasses.toolButton} ${
              tool === 'pen' ? cssClasses.toolButtonActive : cssClasses.toolButtonInactive
            }`}
          >
            <Brush size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Pen</span>
          </button>
          <div className={cssClasses.toolDivider}></div>
          <button
            onClick={() => setTool('eraser')}
            className={`${cssClasses.toolButton} ${
              tool === 'eraser' ? cssClasses.toolButtonActive : cssClasses.toolButtonInactive
            }`}
          >
            <Eraser size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Eraser</span>
          </button>
        </div>

        {/* Color Picker Toggle */}
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={cssClasses.colorToggleButton}
        >
          <Palette size={20} strokeWidth={2} />
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`${cssClasses.actionButton} ${
            isExporting ? cssClasses.exportButtonDisabled : cssClasses.exportButton
          }`}
        >
          {isExporting ? (
            <div className={`${cssClasses.loadingSpinner} ${cssClasses.exportSpinner}`}></div>
          ) : (
            <Download size={20} strokeWidth={2} />
          )}
        </button>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          disabled={isClearing}
          className={`${cssClasses.actionButton} ${
            isClearing ? cssClasses.clearButtonDisabled : cssClasses.clearButton
          }`}
        >
          {isClearing ? (
            <div className={`${cssClasses.loadingSpinner} ${cssClasses.clearSpinner}`}></div>
          ) : (
            <Trash2 size={20} strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Export Success Toast */}
      {showExportSuccess && (
        <div className={cssClasses.successToast}>
          <div className={cssClasses.successToastContent}>
            <Check size={16} className="text-white" />
            <span className="text-white text-sm font-medium">Image exported successfully!</span>
          </div>
        </div>
      )}

      {/* Enhanced Color Picker Panel - Fixed Positioning */}
      {showColorPicker && (
        <div className={cssClasses.colorPicker}>
          <div className={cssClasses.colorPickerContent}>
            {/* Header */}
            <div className={cssClasses.colorPickerHeader}>
              <h3 className={cssClasses.colorPickerTitle}>Background Color</h3>
              <button
                onClick={() => setShowColorPicker(false)}
                className={cssClasses.colorPickerCloseButton}
              >
                <X size={16} className="text-ios-gray-500" />
              </button>
            </div>

            {/* Neutral Colors */}
            <div className={cssClasses.colorSection}>
              <h4 className={cssClasses.colorSectionTitle}>Neutral</h4>
              <div className={cssClasses.colorGrid}>
                {neutralColors.map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => {
                      setBackgroundColor(color);
                      setShowColorPicker(false);
                    }}
                    className={`${cssClasses.colorButton} ${
                      backgroundColor === color
                        ? cssClasses.colorButtonActive
                        : cssClasses.colorButtonInactive
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>
            </div>

            {/* Vibrant Colors */}
            <div>
              <h4 className={cssClasses.colorSectionTitle}>Vibrant</h4>
              <div className={cssClasses.colorGrid}>
                {vibrantColors.map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => {
                      setBackgroundColor(color);
                      setShowColorPicker(false);
                    }}
                    className={`${cssClasses.colorButton} ${
                      backgroundColor === color
                        ? cssClasses.colorButtonActive
                        : cssClasses.colorButtonInactive
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Bar - iOS Style with Dynamic Background */}
      <div className={cssClasses.footer} style={getFooterStyles(backgroundColor)}>
        <div className={cssClasses.footerContent}>
          <div className={cssClasses.footerStatus} style={getFooterTextStyles(backgroundColor)}>
            <div className={`${cssClasses.footerStatusDot} ${tool === 'pen' ? 'bg-ios-blue' : 'bg-ios-gray-400'}`}></div>
            <span className={cssClasses.footerStatusText}>{tool === 'pen' ? 'Drawing' : 'Erasing'}</span>
          </div>
          
          <div className={cssClasses.footerCredit} style={getFooterSecondaryTextStyles(backgroundColor)}>
            Made with ❤️ by Lekhak
          </div>
          
          <div className={cssClasses.footerConnection}>
            <div className={`${cssClasses.footerStatusDot} bg-ios-green`}></div>
            <span className={cssClasses.footerStatusText} style={getFooterTextStyles(backgroundColor)}>Connected</span>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className={cssClasses.fab}>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={cssClasses.fabButton}
        >
          <Palette size={24} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default App;