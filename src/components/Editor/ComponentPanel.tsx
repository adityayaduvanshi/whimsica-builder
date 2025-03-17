
import React from 'react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { ElementProps } from '@/context/EditorContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface ComponentPanelProps {
  canvasRef?: React.RefObject<HTMLDivElement>;
}

const ComponentPanel: React.FC<ComponentPanelProps> = () => {
  // Define component categories and their elements
  const categories = [
    {
      id: 'layout',
      name: 'Layout',
      components: [
        {
          type: 'container',
          label: 'Container',
          icon: (
            <div className="w-12 h-8 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="w-8 h-4 bg-gray-200"></div>
            </div>
          ),
        },
        {
          type: 'spacer',
          label: 'Spacer',
          icon: (
            <div className="w-12 h-8 flex items-center justify-center">
              <div className="w-8 h-2 bg-gray-200"></div>
            </div>
          ),
        },
        {
          type: 'card',
          label: 'Card',
          icon: (
            <div className="w-12 h-8 border border-gray-300 rounded-md bg-white shadow-sm flex items-center justify-center">
              <div className="w-8 h-4 bg-gray-200"></div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'basic',
      name: 'Basic',
      components: [
        {
          type: 'heading',
          label: 'Heading',
          icon: <span className="text-xl font-bold">H</span>,
        },
        {
          type: 'paragraph',
          label: 'Paragraph',
          icon: (
            <div className="flex flex-col gap-1">
              <div className="w-10 h-1 bg-gray-300"></div>
              <div className="w-12 h-1 bg-gray-300"></div>
              <div className="w-8 h-1 bg-gray-300"></div>
            </div>
          ),
        },
        {
          type: 'button',
          label: 'Button',
          icon: (
            <div className="px-2 py-1 bg-primary text-white text-xs rounded">
              Button
            </div>
          ),
        },
        {
          type: 'divider',
          label: 'Divider',
          icon: <div className="w-12 h-0.5 bg-gray-300"></div>,
        },
        {
          type: 'text-list',
          label: 'List',
          icon: (
            <div className="flex flex-col gap-1 pl-2">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                <div className="w-8 h-1 bg-gray-300"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                <div className="w-10 h-1 bg-gray-300"></div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'media',
      name: 'Media',
      components: [
        {
          type: 'image',
          label: 'Image',
          icon: (
            <div className="w-12 h-8 border border-gray-300 flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          ),
        },
      ],
    },
  ];

  // Function to render a draggable component
  const DraggableComponent = ({ type, label, icon }: { type: ElementProps['type']; label: string; icon: React.ReactNode }) => {
    const { dragHandlers } = useDragAndDrop({
      type,
      isNew: true,
    });

    return (
      <div
        className="flex flex-col items-center gap-2 p-3 rounded-md hover:bg-secondary transition-colors cursor-grab"
        {...dragHandlers}
        draggable="true"
        data-component-type={type}
      >
        <div className="flex items-center justify-center w-16 h-12">{icon}</div>
        <span className="text-xs font-medium">{label}</span>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-white border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Components</h2>
        <p className="text-sm text-muted-foreground">Drag and drop to add to canvas</p>
      </div>
      
      <Tabs defaultValue="layout" className="w-full">
        <div className="px-4 py-2 border-b border-border">
          <TabsList className="w-full">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex-1 text-xs"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <ScrollArea className="h-[calc(100vh-220px)]">
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="p-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                {category.components.map((component, index) => (
                  <DraggableComponent
                    key={`${category.id}-${index}`}
                    type={component.type as ElementProps['type']}
                    label={component.label}
                    icon={component.icon}
                  />
                ))}
              </div>
              
              {category.id === 'basic' && (
                <>
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground mb-2">
                    Tip: Drag elements onto the canvas to position them
                  </p>
                </>
              )}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default ComponentPanel;
