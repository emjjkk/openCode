"use client"
import { useState, useRef, useEffect } from "react";
import { LuRefreshCcw, LuDownload, LuSettings, LuCode, LuEye } from "react-icons/lu";
import { FaReact } from "react-icons/fa6";

export default function Home() {
  const [htmlCode, setHtmlCode] = useState<string>(
    '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>Hello World</h1>\n    <p>Edit this code to see changes in real-time!</p>\n  </div>\n</body>\n</html>'
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !leftPanelRef.current || !dividerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerWidth = containerRect.width;
    
    let newLeftWidth = e.clientX - containerLeft;
    newLeftWidth = Math.max(100, newLeftWidth);
    newLeftWidth = Math.min(containerWidth - 100, newLeftWidth);
    
    const leftWidthPercent = (newLeftWidth / containerWidth) * 100;
    
    leftPanelRef.current.style.width = `${leftWidthPercent}%`;
    dividerRef.current.style.left = `${leftWidthPercent}%`;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlCode);
        iframeDoc.close();
      }
    }
  }, [htmlCode]);

  return (
    <main className="w-full h-screen bg-[#eee] dark:bg-[#000] text-black dark:text-white relative">
      <header className="w-full flex items-center justify-between px-8 h-[60px] border-b border-[#111] absolute top-0">
        <div className="flex items-center">
          <img src="/logo.png" alt="" className="w-[32px] h-auto" />
          <h1 className="text-xl font-semibold ml-1 pr-3 border-r border-[#111]">openCode</h1>
          <div className="flex items-center pl-3">
            <button className="px-2 py-1 bg-gray-500 text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff]">
              <LuSettings className="mr-1"/>Settings
            </button>
            <button className="px-2 py-1 bg-gray-500 text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff]">
              <LuRefreshCcw className="mr-1"/> Reset
            </button>
            <button className="px-2 py-1 bg-gray-500 text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff]">
              <LuDownload className="mr-1"/> Download
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <button className="px-2 py-1 bg-white text-black text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff]">
            Save to Github
          </button>
          <button className="px-2 py-1 bg-blue-400 text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff]">
            Deploy to Netlify
          </button>
        </div>
      </header>

      <div 
        ref={containerRef}
        className="flex w-full h-[calc(100vh-90px)] absolute top-[60px] overflow-hidden"
      >
        <div 
          ref={leftPanelRef}
          className="h-full w-1/2 relative p-8"
        >
          <div className="p-1 bg-[#111] absolute top-4 left-8 text-sm rounded-sm flex items-center font-bold"><LuCode className="mr-2"/>index.html</div>
          <textarea
            className="w-full h-full text-white resize-none outline-none font-mono text-sm pt-8"
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            spellCheck="false"
          />
        </div>
        
        <div
          ref={dividerRef}
          className="absolute w-2 h-full bg-[#333] cursor-col-resize z-10 hover:bg-blue-500 active:bg-blue-600"
          style={{ left: '50%' }}
          onMouseDown={handleMouseDown}
        />
        
        <div className="h-full flex-1 bg-white overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Preview"
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      <footer className="w-full flex items-center absolute bottom-0 px-8 py-1 border-t border-[#111] justify-between">
        <p className="text-sm flex items-center">
          Built open-source with <FaReact className="mx-1"/> by @emjjkk
        </p>
        <div className="flex items-center">
          <a href="" className="ml-1 text-sm">Contribute on Github</a>
        </div>
      </footer>
    </main>
  );
}