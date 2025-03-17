
import React, { useEffect, useState, useRef } from 'react';
import Header from '@/components/Editor/Header';
import ComponentPanel from '@/components/Editor/ComponentPanel';
import PropertyPanel from '@/components/Editor/PropertyPanel';
import Canvas from '@/components/Editor/Canvas';
import { EditorProvider } from '@/context/EditorContext';
import { toast } from "sonner";

const Editor = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast.success("Welcome to WebBuilder", {
        description: "Drag and drop components to start building",
      });
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
          </div>
          <h1 className="text-xl font-medium animate-pulse">Loading WebBuilder</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex">
        <div className="w-64 h-full">
          <ComponentPanel />
        </div>
        <div className="flex-1 h-full">
          <Canvas />
        </div>
        <div className="w-80 h-full">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <EditorProvider>
      <div className="h-screen overflow-hidden">
        <Editor />
      </div>
    </EditorProvider>
  );
};

export default Index;
