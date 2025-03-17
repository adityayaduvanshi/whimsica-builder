
import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

// Predefined color options
const backgroundColorOptions = [
  { label: 'White', value: '#ffffff' },
  { label: 'Light Gray', value: '#f8fafc' },
  { label: 'Light Blue', value: '#eff6ff' },
  { label: 'Light Green', value: '#f0fdf4' },
  { label: 'Light Yellow', value: '#fefce8' },
  { label: 'Light Red', value: '#fef2f2' },
  { label: 'Light Purple', value: '#faf5ff' },
  { label: 'Light Pink', value: '#fdf2f8' },
];

const PropertyPanel: React.FC = () => {
  const { selectedElement, updateElement, deleteElement } = useEditor();
  
  if (!selectedElement) {
    return (
      <div className="h-full w-full bg-white border-l border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Properties</h2>
          <p className="text-sm text-muted-foreground">Select an element to edit</p>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-220px)] p-4">
          <p className="text-muted-foreground text-sm text-center">
            Select an element on the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }
  
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateElement(selectedElement.id, { content: e.target.value });
  };
  
  const handleStyleChange = (property: string, value: string | number) => {
    updateElement(selectedElement.id, {
      style: {
        ...selectedElement.style,
        [property]: value,
      },
    });
  };
  
  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    updateElement(selectedElement.id, {
      position: {
        ...selectedElement.position,
        [axis]: value,
      },
    });
  };
  
  const handleSizeChange = (dimension: 'width' | 'height', value: string | number) => {
    updateElement(selectedElement.id, {
      size: {
        ...selectedElement.size,
        [dimension]: value,
      },
    });
  };
  
  const handleDelete = () => {
    deleteElement(selectedElement.id);
  };
  
  // Determine which fields to display based on element type
  const showContent = selectedElement.type !== 'container' && selectedElement.type !== 'divider';
  const showTextStyles = selectedElement.type === 'heading' || selectedElement.type === 'paragraph' || selectedElement.type === 'button';
  const showBackgroundColor = selectedElement.type === 'container' || selectedElement.type === 'button';
  const showBorderRadius = selectedElement.type === 'container' || selectedElement.type === 'button' || selectedElement.type === 'image';
  const showPadding = selectedElement.type === 'container' || selectedElement.type === 'button';
  
  return (
    <div className="h-full w-full bg-white border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Properties</h2>
        <p className="text-sm text-muted-foreground capitalize">
          {selectedElement.type} Element
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-220px)]">
        <Tabs defaultValue="content" className="w-full">
          <div className="px-4 py-2 border-b border-border">
            <TabsList className="w-full">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
              <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-4">
            <TabsContent value="content" className="mt-0">
              {showContent && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    {selectedElement.type === 'paragraph' ? (
                      <textarea
                        id="content"
                        className="w-full p-2 min-h-[100px] border border-input rounded-md"
                        value={selectedElement.content}
                        onChange={handleContentChange}
                      />
                    ) : (
                      <Input
                        id="content"
                        value={selectedElement.content}
                        onChange={handleContentChange}
                      />
                    )}
                  </div>
                </div>
              )}
              
              {!showContent && (
                <p className="text-sm text-muted-foreground">
                  This element type doesn't have editable content.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="style" className="mt-0">
              <div className="space-y-4">
                {showTextStyles && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="color">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color"
                          type="color"
                          className="w-12 h-10 p-1"
                          value={selectedElement.style.color as string || '#000000'}
                          onChange={(e) => handleStyleChange('color', e.target.value)}
                        />
                        <Input
                          value={selectedElement.style.color as string || '#000000'}
                          onChange={(e) => handleStyleChange('color', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size (px)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="fontSize"
                          min={8}
                          max={72}
                          step={1}
                          value={[parseInt(selectedElement.style.fontSize as string || '16')]}
                          onValueChange={(value) => handleStyleChange('fontSize', `${value[0]}px`)}
                          className="flex-1"
                        />
                        <span className="text-sm w-8 text-right">
                          {parseInt(selectedElement.style.fontSize as string || '16')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fontWeight">Font Weight</Label>
                      <select
                        id="fontWeight"
                        className="w-full p-2 border border-input rounded-md"
                        value={selectedElement.style.fontWeight as string || '400'}
                        onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                      >
                        <option value="300">Light</option>
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="600">Semibold</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="textAlign">Text Align</Label>
                      <select
                        id="textAlign"
                        className="w-full p-2 border border-input rounded-md"
                        value={selectedElement.style.textAlign as string || 'left'}
                        onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                        <option value="justify">Justify</option>
                      </select>
                    </div>
                  </>
                )}
                
                {showBackgroundColor && (
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        className="w-12 h-10 p-1"
                        value={selectedElement.style.backgroundColor as string || '#ffffff'}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                      />
                      <Input
                        value={selectedElement.style.backgroundColor as string || '#ffffff'}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {backgroundColorOptions.map((color) => (
                        <button
                          key={color.value}
                          className="w-full aspect-square rounded-md border border-border hover:border-primary transition-colors"
                          style={{ backgroundColor: color.value }}
                          onClick={() => handleStyleChange('backgroundColor', color.value)}
                          title={color.label}
                        />
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <button
                        className="w-full aspect-square rounded-md border border-border hover:border-primary transition-colors bg-gradient-to-r from-blue-100 to-blue-200"
                        onClick={() => handleStyleChange('backgroundColor', 'linear-gradient(to right, #e0f2fe, #bfdbfe)')}
                        title="Blue Gradient"
                      />
                      <button
                        className="w-full aspect-square rounded-md border border-border hover:border-primary transition-colors bg-gradient-to-r from-green-100 to-green-200"
                        onClick={() => handleStyleChange('backgroundColor', 'linear-gradient(to right, #dcfce7, #bbf7d0)')}
                        title="Green Gradient"
                      />
                      <button
                        className="w-full aspect-square rounded-md border border-border hover:border-primary transition-colors bg-gradient-to-r from-purple-100 to-purple-200"
                        onClick={() => handleStyleChange('backgroundColor', 'linear-gradient(to right, #f3e8ff, #e9d5ff)')}
                        title="Purple Gradient"
                      />
                      <button
                        className="w-full aspect-square rounded-md border border-border hover:border-primary transition-colors bg-gradient-to-r from-pink-100 to-pink-200"
                        onClick={() => handleStyleChange('backgroundColor', 'linear-gradient(to right, #fce7f3, #fbcfe8)')}
                        title="Pink Gradient"
                      />
                    </div>
                  </div>
                )}
                
                {showBorderRadius && (
                  <div className="space-y-2">
                    <Label htmlFor="borderRadius">Border Radius (px)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="borderRadius"
                        min={0}
                        max={50}
                        step={1}
                        value={[parseInt(selectedElement.style.borderRadius as string || '0')]}
                        onValueChange={(value) => handleStyleChange('borderRadius', `${value[0]}px`)}
                        className="flex-1"
                      />
                      <span className="text-sm w-8 text-right">
                        {parseInt(selectedElement.style.borderRadius as string || '0')}
                      </span>
                    </div>
                  </div>
                )}
                
                {showPadding && (
                  <div className="space-y-2">
                    <Label htmlFor="padding">Padding (px)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="padding"
                        min={0}
                        max={100}
                        step={1}
                        value={[parseInt(selectedElement.style.padding as string || '0')]}
                        onValueChange={(value) => handleStyleChange('padding', `${value[0]}px`)}
                        className="flex-1"
                      />
                      <span className="text-sm w-8 text-right">
                        {parseInt(selectedElement.style.padding as string || '0')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {!showTextStyles && !showBackgroundColor && !showBorderRadius && !showPadding && (
                <p className="text-sm text-muted-foreground">
                  This element type doesn't have editable styles.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="layout" className="mt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="positionX">Position X</Label>
                    <Input
                      id="positionX"
                      type="number"
                      value={selectedElement.position.x}
                      onChange={(e) => handlePositionChange('x', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="positionY">Position Y</Label>
                    <Input
                      id="positionY"
                      type="number"
                      value={selectedElement.position.y}
                      onChange={(e) => handlePositionChange('y', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width</Label>
                    <div className="flex gap-2">
                      <Input
                        id="width"
                        value={
                          selectedElement.size.width === 'auto' || selectedElement.size.width === '100%'
                            ? selectedElement.size.width
                            : selectedElement.size.width
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'auto' || val === '100%') {
                            handleSizeChange('width', val);
                          } else {
                            const numVal = parseInt(val);
                            if (!isNaN(numVal)) {
                              handleSizeChange('width', numVal);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <div className="flex gap-2">
                      <Input
                        id="height"
                        value={
                          selectedElement.size.height === 'auto' || selectedElement.size.height === '100%'
                            ? selectedElement.size.height
                            : selectedElement.size.height
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'auto' || val === '100%') {
                            handleSizeChange('height', val);
                          } else {
                            const numVal = parseInt(val);
                            if (!isNaN(numVal)) {
                              handleSizeChange('height', numVal);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    Tip: Use "auto" or "100%" for responsive sizing
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </ScrollArea>
      
      <div className="p-4 border-t border-border">
        <Button variant="destructive" className="w-full" onClick={handleDelete}>
          Delete Element
        </Button>
      </div>
    </div>
  );
};

export default PropertyPanel;
