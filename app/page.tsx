"use client"
import { useState, useRef, useEffect } from "react";
import { LuRefreshCcw, LuDownload, LuSettings, LuCode, LuSparkles } from "react-icons/lu";
import { FaReact, FaSpinner } from "react-icons/fa";

export default function Home() {
  const [htmlCode, setHtmlCode] = useState<string>(
    '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>Hello World</h1>\n    <p>Edit this code to see changes in real-time!</p>\n  </div>\n</body>\n</html>'
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);

  // Handle divider drag functionality
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

  // Handle AI code generation
  const generateCodeWithAI = async () => {
    if (!aiPrompt.trim()) return;
    if (!apiKey) {
      alert("Please enter your OpenRouter API key in settings first");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "YOUR_SITE_URL", // Optional but recommended
          "X-Title": "Your App Name" // Optional but recommended
        },
        body: JSON.stringify({
          model: "agentica-org/deepcoder-14b-preview:free", // Using a free model
          messages: [
            {
              role: "system",
              content: "You are an expert web developer. Return ONLY the FULL HTML/CSS/JS code IN ONE FILE needed to fulfill the request. Do not include any explanations or markdown formatting. Only return the complete code that can be directly rendered in a browser. Never include ```html or ``` tags."
            },
            {
              role: "user",
              content: `Current code:\n${htmlCode}\n\nRequest: ${aiPrompt}`
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        // Clean the response to remove any markdown code blocks
        let cleanCode = data.choices[0].message.content;
        cleanCode = cleanCode.replace(/```(html|javascript|css)?/g, '');
        setHtmlCode(cleanCode.trim());
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      alert(`Failed to generate code: ${error} `);
    } finally {
      setIsLoading(false);
      setAiPrompt("");
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCodeWithAI();
  };

  // Update preview when code changes
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

  // Set up event listeners for divider
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <main className="w-full h-screen bg-[#eee] dark:bg-[#000] text-black dark:text-white relative">
      <header className="w-full flex items-center justify-between px-4 h-[60px] border-b border-[#111] absolute top-0">
        <div className="flex items-center">
          <img src="/logo.png" alt="" className="w-[32px] h-auto" />
          <h1 className="text-xl font-semibold ml-1 pr-3 border-r border-[#111]">openCode</h1>
          <div className="flex items-center pl-3">
            <button 
              className="px-2 py-1 bg-gray-500 text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff]"
              onClick={() => {
                const key = prompt("Enter your OpenRouter API key:");
                if (key) setApiKey(key);
              }}
            >
              <LuSettings className="mr-1"/>Settings
            </button>
            <button 
              className="px-2 py-1 bg-gray-500 text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff]"
              onClick={() => setHtmlCode('<!DOCTYPE html>\n<html>\n<head>\n  <title>New Project</title>\n</head>\n<body>\n\n</body>\n</html>')}
            >
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
          className="h-full w-1/2 relative flex flex-col"
        >
          <div className="px-2 py-1 bg-[#111] absolute top-2 left-8 text-sm rounded-sm flex items-center font-bold">
            <LuCode className="mr-2"/>index.html
          </div>
          
          <div className="relative flex-grow">
            <textarea
              className="w-full h-full text-white resize-none outline-none font-mono text-sm p-4 pt-10"
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              spellCheck="false"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <FaSpinner className="animate-spin text-3xl text-blue-500 mb-5" />
                <p className="text-sm">Writing code...</p>
              </div>
            )}
          </div>
          
          {/* AI Prompt Input */}
          <form onSubmit={handlePromptSubmit} className="border-t border-[#333] p-2 flex">
            <input
              ref={promptInputRef}
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Tell the AI what to build..."
              className="flex-grow bg-[#2d2d2d] text-white px-3 py-2 rounded-l-sm outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-sm flex items-center disabled:opacity-50"
              disabled={isLoading || !aiPrompt.trim()}
            >
              {isLoading ? (
                "Generating..."
              ) : (
                <>
                  <LuSparkles className="mr-2" />
                  Generate
                </>
              )}
            </button>
          </form>
        </div>
        
        <div
          ref={dividerRef}
          className="absolute w-2 h-full bg-[#333] cursor-col-resize z-10 hover:bg-blue-500 active:bg-blue-600"
          style={{ left: '50%' }}
          onMouseDown={handleMouseDown}
        />
        
        <div className="h-full flex-1 bg-white overflow-hidden relative border-l border-[#111]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="flex flex-col items-center">
                <FaSpinner className="animate-spin text-2xl text-blue-500 mb-2" />
              </div>
            </div>
          ) : null}
          <iframe
            ref={iframeRef}
            title="Preview"
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      <footer className="w-full flex items-center absolute bottom-0 px-4 py-1 border-t border-[#111] justify-between">
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