
import React, { useState, useRef, useEffect } from 'react';
import { useEditor, ElementProps } from '@/context/EditorContext';
import { ArrowUpLeftSquare, ArrowUpRightSquare, ArrowDownLeftSquare, ArrowDownRightSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizableElementProps {
  element: ElementProps;
  children: React.ReactNode;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

const ResizableElement: React.FC<ResizableElementProps> = ({
  element,
  children,
  onResizeStart,
  onResizeEnd,
}) => {
  const { updateElement } = useEditor();
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Convert size to actual pixels
  const parseSize = (size: string | number): number => {
    if (typeof size === 'number') return size;
    if (size === 'auto' || size === '100%') return elementRef.current?.clientWidth || 200;
    return parseInt(size) || 100;
  };

  // Start resizing when a handle is clicked
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setActiveHandle(handle);
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    startPosRef.current = { x: clientX, y: clientY };
    startSizeRef.current = {
      width: parseSize(element.size.width),
      height: parseSize(element.size.height),
    };
    
    if (onResizeStart) onResizeStart();
    
    // Add global event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('touchmove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.addEventListener('touchend', handleResizeEnd);
  };

  // Handle resize movement
  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing) return;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const deltaX = clientX - startPosRef.current.x;
    const deltaY = clientY - startPosRef.current.y;
    
    let newWidth = startSizeRef.current.width;
    let newHeight = startSizeRef.current.height;
    
    // Adjust width based on the active handle
    if (activeHandle === 'top-right' || activeHandle === 'right' || activeHandle === 'bottom-right') {
      newWidth = Math.max(50, startSizeRef.current.width + deltaX);
    } else if (activeHandle === 'top-left' || activeHandle === 'left' || activeHandle === 'bottom-left') {
      newWidth = Math.max(50, startSizeRef.current.width - deltaX);
    }
    
    // Adjust height based on the active handle
    if (activeHandle === 'bottom-left' || activeHandle === 'bottom' || activeHandle === 'bottom-right') {
      newHeight = Math.max(30, startSizeRef.current.height + deltaY);
    } else if (activeHandle === 'top-left' || activeHandle === 'top' || activeHandle === 'top-right') {
      newHeight = Math.max(30, startSizeRef.current.height - deltaY);
    }
    
    // Update element size
    updateElement(element.id, {
      size: {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      },
    });
  };

  // End resizing
  const handleResizeEnd = () => {
    setIsResizing(false);
    setActiveHandle(null);
    
    if (onResizeEnd) onResizeEnd();
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('touchmove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.removeEventListener('touchend', handleResizeEnd);
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('touchmove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('touchend', handleResizeEnd);
    };
  }, []);

  return (
    <div 
      className="relative"
      ref={elementRef}
      style={{
        width: element.size.width,
        height: element.size.height !== 'auto' ? element.size.height : 'auto',
      }}
    >
      {children}
      
      {/* Resize handles */}
      <div 
        className={cn(
          "absolute top-0 left-0 w-4 h-4 cursor-nwse-resize bg-primary rounded-full opacity-0 hover:opacity-80 transition-opacity z-50",
          isResizing && activeHandle === 'top-left' && "opacity-80"
        )}
        onMouseDown={(e) => handleResizeStart(e, 'top-left')}
        onTouchStart={(e) => handleResizeStart(e, 'top-left')}
      />
      
      <div 
        className={cn(
          "absolute top-0 right-0 w-4 h-4 cursor-nesw-resize bg-primary rounded-full opacity-0 hover:opacity-80 transition-opacity z-50",
          isResizing && activeHandle === 'top-right' && "opacity-80"
        )}
        onMouseDown={(e) => handleResizeStart(e, 'top-right')}
        onTouchStart={(e) => handleResizeStart(e, 'top-right')}
      />
      
      <div 
        className={cn(
          "absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize bg-primary rounded-full opacity-0 hover:opacity-80 transition-opacity z-50",
          isResizing && activeHandle === 'bottom-left' && "opacity-80"
        )}
        onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
        onTouchStart={(e) => handleResizeStart(e, 'bottom-left')}
      />
      
      <div 
        className={cn(
          "absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-primary rounded-full opacity-0 hover:opacity-80 transition-opacity z-50",
          isResizing && activeHandle === 'bottom-right' && "opacity-80"
        )}
        onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
        onTouchStart={(e) => handleResizeStart(e, 'bottom-right')}
      />
    </div>
  );
};

export default ResizableElement;
