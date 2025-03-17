import { useState, useRef, useCallback, useEffect } from 'react';
import { useEditor, ElementProps } from '@/context/EditorContext';
import { toast } from 'sonner';

interface Position {
  x: number;
  y: number;
}

interface UseDragAndDropProps {
  id?: string;
  type?: ElementProps['type'];
  canvasRef?: React.RefObject<HTMLDivElement>;
  isNew?: boolean;
}

export const useDragAndDrop = ({ id, type, canvasRef, isNew = false }: UseDragAndDropProps = {}) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosRef = useRef<Position>({ x: 0, y: 0 });
  const elementStartPosRef = useRef<Position>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  
  const {
    selectedElement,
    updateElement,
    addElement,
    selectElement,
    setIsDragging: setEditorIsDragging
  } = useEditor();

  const handleDragStart = useCallback((e: React.DragEvent | React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }
    
    dragStartPosRef.current = { x: clientX, y: clientY };
    
    if (isNew && type) {
      if ('dataTransfer' in e) {
        e.dataTransfer.setData('component-type', type);
      }
    }
    
    if (id && !isNew) {
      selectElement(id);
      setIsDragging(true);
      setEditorIsDragging(true);
      
      if (selectedElement) {
        elementStartPosRef.current = selectedElement.position;
      }
    }
    
    if (isNew && type) {
      setIsDragging(true);
      setEditorIsDragging(true);
      
      elementStartPosRef.current = { x: 0, y: 0 };
    }
  }, [id, isNew, selectElement, selectedElement, type, setEditorIsDragging]);

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const deltaX = clientX - dragStartPosRef.current.x;
    const deltaY = clientY - dragStartPosRef.current.y;
    
    if (id && selectedElement && !isNew) {
      const newPosition = {
        x: elementStartPosRef.current.x + deltaX,
        y: elementStartPosRef.current.y + deltaY,
      };
      
      setPosition(newPosition);
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        updateElement(id, { position: newPosition });
      }
    }
  }, [isDragging, id, selectedElement, updateElement]);

  const handleDragEnd = useCallback((e: MouseEvent | TouchEvent | DragEvent) => {
    if (!isDragging && !isNew) return;
    
    if (isNew && type && ('dataTransfer' in e)) {
      const canvas = document.querySelector('.canvas-grid');
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        
        let clientX: number, clientY: number;
        
        if ('touches' in e && e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
          clientX = e.clientX;
          clientY = e.clientY;
        } else {
          return;
        }
        
        const x = clientX - canvasRect.left;
        const y = clientY - canvasRect.top;
        
        const newElement = {
          type,
          content: type === 'heading' ? 'New Heading' 
                  : type === 'paragraph' ? 'New paragraph text'
                  : type === 'button' ? 'Button'
                  : type === 'image' ? 'https://via.placeholder.com/300x200'
                  : type === 'divider' ? '' : '',
          style: {
            ...(type === 'heading' ? { 
              fontSize: '24px',
              fontWeight: '600',
              color: '#1e293b',
            } : {}),
            ...(type === 'paragraph' ? {
              fontSize: '16px',
              color: '#64748b',
            } : {}),
            ...(type === 'button' ? {
              backgroundColor: 'hsl(215, 100%, 60%)',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
            } : {}),
            ...(type === 'image' ? {
              maxWidth: '100%',
              height: 'auto',
            } : {}),
            ...(type === 'divider' ? {
              width: '100%',
              height: '1px',
              backgroundColor: '#e2e8f0',
              margin: '20px 0',
            } : {}),
            ...(type === 'container' ? {
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              minHeight: '100px',
              width: '100%',
            } : {}),
          },
          position: { x, y },
          size: { 
            width: type === 'container' || type === 'divider' ? '100%' : 'auto', 
            height: 'auto' 
          },
          parentId: null,
        };
        
        addElement(newElement);
        toast.success(`Added ${type} element`);
      }
    }
    
    setIsDragging(false);
    setEditorIsDragging(false);
  }, [isNew, type, addElement, isDragging, setEditorIsDragging]);

  useEffect(() => {
    if (isNew) {
      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        
        if (e.dataTransfer && e.dataTransfer.getData('component-type') === type) {
          handleDragEnd(e);
        }
      };
      
      document.addEventListener('drop', handleDrop);
      
      return () => {
        document.removeEventListener('drop', handleDrop);
      };
    }
  }, [isNew, type, handleDragEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('touchmove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchend', handleDragEnd);
      
      if (elementRef.current) {
        elementRef.current.classList.add('dragging');
      }
      
      return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('touchmove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
    
    if (elementRef.current) {
      elementRef.current.classList.remove('dragging');
    }
    
    return undefined;
  }, [isDragging, handleDrag, handleDragEnd]);

  useEffect(() => {
    if (id && selectedElement && selectedElement.id === id) {
      setPosition(selectedElement.position);
    }
  }, [id, selectedElement]);

  const dragHandlers = {
    onDragStart: handleDragStart,
    onMouseDown: handleDragStart,
    onTouchStart: handleDragStart,
  };

  return { position, isDragging, dragHandlers, elementRef };
};
