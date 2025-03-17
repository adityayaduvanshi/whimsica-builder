import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from "sonner";

// Types
export interface ElementProps {
  id: string;
  type: 'container' | 'heading' | 'paragraph' | 'button' | 'image' | 'divider' | 'spacer' | 'text-list' | 'card';
  content: string;
  style: Record<string, string | number>;
  children?: ElementProps[];
  parentId?: string | null;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
}

export interface PageData {
  id: string;
  name: string;
  elements: ElementProps[];
}

export type ResponsiveMode = 'desktop' | 'tablet' | 'mobile';

interface EditorContextProps {
  pages: PageData[];
  activePage: PageData | null;
  selectedElement: ElementProps | null;
  isDragging: boolean;
  responsiveMode: ResponsiveMode;
  history: { past: PageData[]; future: PageData[] };
  setPages: (pages: PageData[]) => void;
  addPage: (name: string) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  setActivePage: (pageId: string) => void;
  addElement: (element: Omit<ElementProps, 'id'>) => void;
  updateElement: (id: string, props: Partial<ElementProps>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setIsDragging: (dragging: boolean) => void;
  setResponsiveMode: (mode: ResponsiveMode) => void;
  saveProject: () => void;
  exportHTML: () => void;
  undo: () => void;
  redo: () => void;
}

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

// Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 10);

// Initial page with some basic elements
const initialPage: PageData = {
  id: generateId(),
  name: 'Home',
  elements: [
    {
      id: generateId(),
      type: 'container',
      content: '',
      style: {
        backgroundColor: '#ffffff',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      },
      position: { x: 0, y: 0 },
      size: { width: '100%', height: 'auto' },
      children: [
        {
          id: generateId(),
          type: 'heading',
          content: 'Welcome to Your Website',
          style: {
            fontSize: '32px',
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'center',
          },
          position: { x: 0, y: 0 },
          size: { width: 'auto', height: 'auto' },
        },
        {
          id: generateId(),
          type: 'paragraph',
          content: 'Start building your website by dragging elements from the panel.',
          style: {
            fontSize: '16px',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '600px',
          },
          position: { x: 0, y: 0 },
          size: { width: 'auto', height: 'auto' },
        },
        {
          id: generateId(),
          type: 'button',
          content: 'Get Started',
          style: {
            backgroundColor: 'hsl(215, 100%, 60%)',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
          },
          position: { x: 0, y: 0 },
          size: { width: 'auto', height: 'auto' },
        },
      ],
    },
  ],
};

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [pages, setPages] = useState<PageData[]>([initialPage]);
  const [activePage, setActivePageState] = useState<PageData | null>(initialPage);
  const [selectedElement, setSelectedElement] = useState<ElementProps | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [responsiveMode, setResponsiveMode] = useState<ResponsiveMode>('desktop');
  const [history, setHistory] = useState<{ past: PageData[]; future: PageData[] }>({
    past: [],
    future: [],
  });

  // Save current state to history before making changes
  const saveToHistory = useCallback(() => {
    if (activePage) {
      setHistory((prev) => ({
        past: [...prev.past, { ...activePage }],
        future: [],
      }));
    }
  }, [activePage]);

  const addPage = useCallback((name: string) => {
    const newPage: PageData = {
      id: generateId(),
      name,
      elements: [],
    };
    setPages((prev) => [...prev, newPage]);
    setActivePageState(newPage);
    toast.success(`Page "${name}" created`);
  }, []);

  const duplicatePage = useCallback((pageId: string) => {
    const pageToDuplicate = pages.find((p) => p.id === pageId);
    if (pageToDuplicate) {
      const newPage: PageData = {
        ...pageToDuplicate,
        id: generateId(),
        name: `${pageToDuplicate.name} (Copy)`,
      };
      setPages((prev) => [...prev, newPage]);
      toast.success(`Page "${pageToDuplicate.name}" duplicated`);
    }
  }, [pages]);

  const deletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) {
      toast.error("Cannot delete the only page");
      return;
    }
    
    setPages((prev) => {
      const newPages = prev.filter((p) => p.id !== pageId);
      // If active page is deleted, set another page as active
      if (activePage?.id === pageId) {
        setActivePageState(newPages[0]);
      }
      return newPages;
    });
    toast.success("Page deleted");
  }, [pages, activePage]);

  const setActivePage = useCallback((pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (page) {
      setActivePageState(page);
      setSelectedElement(null);
    }
  }, [pages]);

  const addElement = useCallback((element: Omit<ElementProps, 'id'>) => {
    if (!activePage) return;
    
    saveToHistory();
    
    const newElement: ElementProps = {
      ...element,
      id: generateId(),
    };
    
    // For new elements with no content, provide defaults based on type
    if (!newElement.content) {
      if (newElement.type === 'heading') {
        newElement.content = 'New Heading';
      } else if (newElement.type === 'paragraph') {
        newElement.content = 'New paragraph text';
      } else if (newElement.type === 'button') {
        newElement.content = 'Button';
      } else if (newElement.type === 'image') {
        newElement.content = 'https://via.placeholder.com/300x200';
      } else if (newElement.type === 'text-list') {
        newElement.content = 'Item 1\nItem 2\nItem 3';
      }
    }
    
    // For new elements with no style, provide defaults based on type
    if (!newElement.style || Object.keys(newElement.style).length === 0) {
      if (newElement.type === 'heading') {
        newElement.style = { 
          fontSize: '24px',
          fontWeight: '600',
          color: '#1e293b',
        };
      } else if (newElement.type === 'paragraph') {
        newElement.style = {
          fontSize: '16px',
          color: '#64748b',
        };
      } else if (newElement.type === 'button') {
        newElement.style = {
          backgroundColor: 'hsl(215, 100%, 60%)',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
        };
      } else if (newElement.type === 'image') {
        newElement.style = {
          maxWidth: '100%',
          height: 'auto',
        };
      } else if (newElement.type === 'divider') {
        newElement.style = {
          width: '100%',
          height: '1px',
          backgroundColor: '#e2e8f0',
          margin: '20px 0',
        };
      } else if (newElement.type === 'container') {
        newElement.style = {
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          minHeight: '100px',
          width: '100%',
        };
      } else if (newElement.type === 'spacer') {
        newElement.style = {
          width: '100%',
          height: '20px',
        };
      } else if (newElement.type === 'text-list') {
        newElement.style = {
          fontSize: '16px',
          color: '#64748b',
          lineHeight: '1.6',
        };
      } else if (newElement.type === 'card') {
        newElement.style = {
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          width: '300px',
          minHeight: '100px',
        };
      }
    }
    
    setPages((prev) =>
      prev.map((page) => {
        if (page.id === activePage.id) {
          return {
            ...page,
            elements: [...page.elements, newElement],
          };
        }
        return page;
      })
    );
    
    // Update active page reference
    setActivePageState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: [...prev.elements, newElement],
      };
    });
    
    setSelectedElement(newElement);
  }, [activePage, saveToHistory]);

  const updateElement = useCallback((id: string, props: Partial<ElementProps>) => {
    if (!activePage) return;
    
    saveToHistory();
    
    const updateElementRecursive = (elements: ElementProps[]): ElementProps[] => {
      return elements.map((el) => {
        if (el.id === id) {
          const updatedElement = { ...el, ...props };
          if (selectedElement?.id === id) {
            setSelectedElement(updatedElement);
          }
          return updatedElement;
        }
        
        if (el.children) {
          return {
            ...el,
            children: updateElementRecursive(el.children),
          };
        }
        
        return el;
      });
    };
    
    setPages((prev) =>
      prev.map((page) => {
        if (page.id === activePage.id) {
          return {
            ...page,
            elements: updateElementRecursive(page.elements),
          };
        }
        return page;
      })
    );
    
    // Update active page reference
    setActivePageState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: updateElementRecursive(prev.elements),
      };
    });
  }, [activePage, selectedElement, saveToHistory]);

  const deleteElement = useCallback((id: string) => {
    if (!activePage) return;
    
    saveToHistory();
    
    const deleteElementRecursive = (elements: ElementProps[]): ElementProps[] => {
      return elements
        .filter((el) => el.id !== id)
        .map((el) => {
          if (el.children) {
            return {
              ...el,
              children: deleteElementRecursive(el.children),
            };
          }
          return el;
        });
    };
    
    setPages((prev) =>
      prev.map((page) => {
        if (page.id === activePage.id) {
          return {
            ...page,
            elements: deleteElementRecursive(page.elements),
          };
        }
        return page;
      })
    );
    
    // Update active page reference
    setActivePageState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: deleteElementRecursive(prev.elements),
      };
    });
    
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
    
    toast.success("Element deleted");
  }, [activePage, selectedElement, saveToHistory]);

  const selectElement = useCallback((id: string | null) => {
    if (!activePage || !id) {
      setSelectedElement(null);
      return;
    }
    
    const findElementRecursive = (elements: ElementProps[]): ElementProps | null => {
      for (const el of elements) {
        if (el.id === id) {
          return el;
        }
        
        if (el.children) {
          const found = findElementRecursive(el.children);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    const element = findElementRecursive(activePage.elements);
    setSelectedElement(element);
  }, [activePage]);

  const saveProject = useCallback(() => {
    try {
      const projectData = JSON.stringify({ pages });
      localStorage.setItem('website-builder-project', projectData);
      toast.success("Project saved successfully");
    } catch (error) {
      toast.error("Failed to save project");
      console.error("Save error:", error);
    }
  }, [pages]);

  const exportHTML = useCallback(() => {
    try {
      // Simple HTML generation example
      if (!activePage) {
        toast.error("No active page to export");
        return;
      }
      
      const generateElementHTML = (element: ElementProps): string => {
        // Create a style object that includes positioning without absolute position
        const styleObj = { ...element.style };
        
        // Add position from element.position, but using relative positioning
        const positionStyle = `position: relative; left: ${element.position.x}px; top: ${element.position.y}px;`;
        
        // Add size from element.size
        const sizeStyle = `width: ${element.size.width}${typeof element.size.width === 'number' ? 'px' : ''}; height: ${element.size.height}${typeof element.size.height === 'number' ? 'px' : ''};`;
        
        // Combine all styles
        const styleString = Object.entries(styleObj)
          .map(([key, value]) => `${key}: ${value};`)
          .join(' ') + ' ' + positionStyle + ' ' + sizeStyle;
        
        switch (element.type) {
          case 'container':
            const childrenHTML = element.children
              ? element.children.map(generateElementHTML).join('')
              : '';
            return `<div style="${styleString}">${childrenHTML}</div>`;
          
          case 'heading':
            return `<h1 style="${styleString}">${element.content}</h1>`;
          
          case 'paragraph':
            return `<p style="${styleString}">${element.content}</p>`;
          
          case 'button':
            return `<button style="${styleString}">${element.content}</button>`;
          
          case 'image':
            return `<img src="${element.content}" style="${styleString}" alt="Image" />`;
          
          case 'divider':
            return `<hr style="${styleString}" />`;
          
          case 'spacer':
            return `<div style="${styleString}"></div>`;
          
          case 'text-list':
            const listItems = element.content.split('\n')
              .map(item => `<li>${item.trim()}</li>`)
              .join('');
            return `<ul style="${styleString}">${listItems}</ul>`;
          
          case 'card':
            return `<div style="${styleString}"><div style="padding: 16px;"><h3 style="font-size: 18px; margin-bottom: 8px;">Card Title</h3><p>Card content goes here</p></div></div>`;
          
          default:
            return '';
        }
      };
      
      const css = `
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .canvas-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
        }
      `;
      
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activePage.name}</title>
  <style>${css}</style>
</head>
<body>
  <div class="canvas-container">
    ${activePage.elements.map(generateElementHTML).join('')}
  </div>
</body>
</html>
      `.trim();
      
      // Create a blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activePage.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("HTML exported successfully");
    } catch (error) {
      toast.error("Failed to export HTML");
      console.error("Export error:", error);
    }
  }, [activePage]);

  const undo = useCallback(() => {
    if (history.past.length === 0) return;
    
    const newPast = [...history.past];
    const previousState = newPast.pop();
    
    if (previousState && activePage) {
      setHistory({
        past: newPast,
        future: [activePage, ...history.future],
      });
      
      setPages((prev) =>
        prev.map((page) => (page.id === previousState.id ? previousState : page))
      );
      
      setActivePageState(previousState);
    }
  }, [history, activePage]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return;
    
    const [nextState, ...newFuture] = history.future;
    
    if (nextState && activePage) {
      setHistory({
        past: [...history.past, activePage],
        future: newFuture,
      });
      
      setPages((prev) =>
        prev.map((page) => (page.id === nextState.id ? nextState : page))
      );
      
      setActivePageState(nextState);
    }
  }, [history, activePage]);

  const value: EditorContextProps = {
    pages,
    activePage,
    selectedElement,
    isDragging,
    responsiveMode,
    history,
    setPages,
    addPage,
    duplicatePage,
    deletePage,
    setActivePage,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    setIsDragging,
    setResponsiveMode,
    saveProject,
    exportHTML,
    undo,
    redo,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = (): EditorContextProps => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
