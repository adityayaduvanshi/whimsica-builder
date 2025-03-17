
import React, { useRef, useEffect, useState } from 'react';
import { useEditor, ElementProps } from '@/context/EditorContext';
import DraggableElement from '@/components/ui/DraggableElement';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { toast } from "sonner";

const Canvas: React.FC = () => {
  const { activePage, selectedElement, selectElement, responsiveMode, deleteElement } = useEditor();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Reset selected element when clicking on the canvas
  const handleCanvasClick = () => {
    selectElement(null);
  };
  
  // Adjust canvas width based on responsive mode
  const getCanvasWidth = () => {
    switch (responsiveMode) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      default:
        return '100%';
    }
  };
  
  // Helper function to render elements recursively
  const renderElements = (elements: ElementProps[]) => {
    return elements.map((element) => {
      if (element.type === 'container' && element.children) {
        return (
          <DraggableElement
            key={element.id}
            element={element}
            canvasRef={canvasRef}
          >
            {renderElements(element.children)}
          </DraggableElement>
        );
      }
      
      return (
        <DraggableElement
          key={element.id}
          element={element}
          canvasRef={canvasRef}
        />
      );
    });
  };
  
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle delete key
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedElement &&
        document.activeElement === document.body
      ) {
        e.preventDefault();
        deleteElement(selectedElement.id);
        toast.info("Element deleted");
      }
      
      // Handle Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
      }
      
      // Handle Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement]);
  
  // Handle zoom
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };
  
  const handleResetZoom = () => {
    setScale(1);
  };
  
  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // The actual drop handling is in useDragAndDrop.ts
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-secondary">
        <div className="text-sm font-medium">
          {activePage ? activePage.name : 'Canvas'}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background transition-colors"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          
          <button
            className="text-xs px-2 hover:bg-background rounded"
            onClick={handleResetZoom}
          >
            {Math.round(scale * 100)}%
          </button>
          
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background transition-colors"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 bg-secondary">
        <div
          className="min-h-[calc(100vh-6.5rem)] flex justify-center p-8"
          onClick={handleCanvasClick}
        >
          <div
            ref={canvasRef}
            className={cn(
              "bg-white h-[calc(100vh-6.5rem-4rem)] border border-border rounded-md shadow-sm canvas-grid relative transition-all duration-200",
              responsiveMode !== 'desktop' && "mx-auto",
              isDragOver && "drop-indicator"
            )}
            style={{
              width: getCanvasWidth(),
              transform: `scale(${scale})`,
              transformOrigin: 'center top',
              overflow: 'auto',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {activePage?.elements && renderElements(activePage.elements)}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Canvas;
