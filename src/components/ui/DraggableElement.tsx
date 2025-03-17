
import React, { useState } from 'react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useEditor, ElementProps } from '@/context/EditorContext';
import { cn } from '@/lib/utils';
import ResizableElement from './ResizableElement';

interface DraggableElementProps {
  element: ElementProps;
  isPreview?: boolean;
  canvasRef?: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  isPreview = false,
  canvasRef,
  children,
}) => {
  const { selectedElement, selectElement, responsiveMode } = useEditor();
  const { position, dragHandlers, elementRef } = useDragAndDrop({
    id: element.id,
    canvasRef,
  });
  
  const [isHovered, setIsHovered] = useState(false);
  
  const isSelected = selectedElement?.id === element.id;
  
  const getResponsiveStyles = () => {
    let width = element.size.width;
    
    // Adjust size based on responsive mode
    if (responsiveMode === 'tablet') {
      if (typeof width === 'number' && width > 700) {
        width = 700;
      }
    } else if (responsiveMode === 'mobile') {
      if (typeof width === 'number' && width > 350) {
        width = 350;
      } else if (width === '100%') {
        width = '100%';
      }
    }
    
    return { width };
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };
  
  const renderElementContent = () => {
    const { type, content, style } = element;
    const mergedStyles = { ...style, ...getResponsiveStyles() };
    
    switch (type) {
      case 'container':
        return (
          <div
            className={cn(
              "relative transition-all duration-200",
              isSelected && "element-highlight",
              isHovered && !isSelected && "ring-1 ring-primary/40"
            )}
            style={mergedStyles as React.CSSProperties}
            onClick={handleClick}
          >
            {children}
          </div>
        );
      
      case 'heading':
        return (
          <h2
            className={cn(
              "transition-all duration-200",
              isSelected && "element-highlight",
              isHovered && !isSelected && "ring-1 ring-primary/40"
            )}
            style={mergedStyles as React.CSSProperties}
            onClick={handleClick}
          >
            {content}
          </h2>
        );
      
      case 'paragraph':
        return (
          <p
            className={cn(
              "transition-all duration-200",
              isSelected && "element-highlight",
              isHovered && !isSelected && "ring-1 ring-primary/40"
            )}
            style={mergedStyles as React.CSSProperties}
            onClick={handleClick}
          >
            {content}
          </p>
        );
      
      case 'button':
        return (
          <button
            className={cn(
              "transition-all duration-200",
              isSelected && "element-highlight",
              isHovered && !isSelected && "ring-1 ring-primary/40"
            )}
            style={mergedStyles as React.CSSProperties}
            onClick={(e) => {
              e.preventDefault();
              handleClick(e);
            }}
          >
            {content}
          </button>
        );
      
      case 'image':
        return (
          <img
            src={content}
            alt="Content"
            className={cn(
              "transition-all duration-200",
              isSelected && "element-highlight",
              isHovered && !isSelected && "ring-1 ring-primary/40"
            )}
            style={mergedStyles as React.CSSProperties}
            onClick={handleClick}
          />
        );
      
      case 'divider':
        return (
          <hr
            className={cn(
              "transition-all duration-200",
              isSelected && "element-highlight",
              isHovered && !isSelected && "ring-1 ring-primary/40"
            )}
            style={mergedStyles as React.CSSProperties}
            onClick={handleClick}
          />
        );
      
      case 'spacer':
        return (
          <div
            className={cn(
              "transition-all duration-200",
              isSelected && "element-highlight",
              isHovered && !isSelected && "ring-1 ring-primary/40"
            )}
            style={{
              ...mergedStyles as React.CSSProperties,
              minHeight: '20px',
            }}
            onClick={handleClick}
          />
        );
      
      case 'text-list':
        return (
          <ul
            className={cn(
              "transition-all duration-200 list-disc pl-5",
              isSelected && "element-highlight",
              isHovered && !isSelected && "ring-1 ring-primary/40"
            )}
            style={mergedStyles as React.CSSProperties}
            onClick={handleClick}
          >
            {content.split('\n').map((item, index) => (
              <li key={index}>{item.trim()}</li>
            ))}
          </ul>
        );
      
      case 'card':
        return (
          <div
            className={cn(
              "transition-all duration-200 shadow-md rounded-lg overflow-hidden",
              isSelected && "element-highlight",
              isHovered && !isSelected && "ring-1 ring-primary/40"
            )}
            style={mergedStyles as React.CSSProperties}
            onClick={handleClick}
          >
            {children || (
              <>
                <div className="p-4">
                  <h3 className="text-lg font-medium">Card Title</h3>
                  <p className="text-muted-foreground">Card content goes here</p>
                </div>
              </>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // For preview components in the component panel
  if (isPreview) {
    return (
      <div
        className="cursor-grab hover:shadow-md transition-all duration-200 p-2 bg-white rounded-md border border-border"
        {...dragHandlers}
      >
        {renderElementContent()}
      </div>
    );
  }
  
  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: isSelected ? 10 : 1,
        cursor: isSelected ? 'grab' : 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...dragHandlers}
    >
      {isSelected ? (
        <ResizableElement element={element}>
          {renderElementContent()}
        </ResizableElement>
      ) : (
        renderElementContent()
      )}
    </div>
  );
};

export default DraggableElement;
