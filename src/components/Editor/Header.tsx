
import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Header: React.FC = () => {
  const {
    pages,
    activePage,
    addPage,
    duplicatePage,
    deletePage,
    setActivePage,
    saveProject,
    exportHTML,
    undo,
    redo,
    setResponsiveMode,
    responsiveMode,
  } = useEditor();
  
  const [newPageName, setNewPageName] = React.useState('');
  
  const handleAddPage = () => {
    if (!newPageName.trim()) {
      toast.error("Please enter a page name");
      return;
    }
    
    addPage(newPageName);
    setNewPageName('');
  };
  
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-white">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">WebBuilder</h1>
        
        <Separator orientation="vertical" className="h-8" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {activePage?.name || 'Select Page'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Pages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {pages.map((page) => (
              <DropdownMenuItem
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className="flex justify-between items-center"
              >
                <span>{page.name}</span>
                {page.id === activePage?.id && (
                  <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                    Current
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            <div className="p-2">
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="New page name"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  size={1}
                />
                <Button size="sm" onClick={handleAddPage}>
                  Add
                </Button>
              </div>
              
              {activePage && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => duplicatePage(activePage.id)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => deletePage(activePage.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
          <Button
            size="sm"
            variant={responsiveMode === 'desktop' ? 'default' : 'ghost'}
            className="h-8 px-3"
            onClick={() => setResponsiveMode('desktop')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </Button>
          
          <Button
            size="sm"
            variant={responsiveMode === 'tablet' ? 'default' : 'ghost'}
            className="h-8 px-3"
            onClick={() => setResponsiveMode('tablet')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
            </svg>
          </Button>
          
          <Button
            size="sm"
            variant={responsiveMode === 'mobile' ? 'default' : 'ghost'}
            className="h-8 px-3"
            onClick={() => setResponsiveMode('mobile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="3" width="12" height="18" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
            </svg>
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-8" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={undo}
          title="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={redo}
          title="Redo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </Button>
        
        <Separator orientation="vertical" className="h-8" />
        
        <Button size="sm" variant="outline" onClick={saveProject}>
          Save
        </Button>
        
        <Button size="sm" onClick={exportHTML}>
          Export
        </Button>
      </div>
    </header>
  );
};

export default Header;
