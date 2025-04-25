"use client"
import { useState, useRef, useEffect } from "react";
import { LuRefreshCcw, LuDownload, LuSettings, LuCode, LuSparkles } from "react-icons/lu";
import { FaReact, FaSpinner, FaGithub } from "react-icons/fa";
import JSZip from "jszip";

// Default configuration
const DEFAULT_CONFIG = {
  useCustomKey: false,
  customApiKey: "",
  endpoint: "https://openrouter.ai/api/v1/chat/completions",
  model: "agentica-org/deepcoder-14b-preview:free",
  githubToken: "",
  githubRepo: "",
  netlifyToken: "",
  netlifySiteId: ""
};

const DEFAULT_HTML_CODE = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
      margin-bottom: 30px;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .feature-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .feature-card h3 {
      margin-top: 0;
      color: #2c3e50;
    }
    .try-section {
      background: #f0f8ff;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    code {
      background: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
    .button {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      text-decoration: none;
      margin-top: 10px;
    }
    .button:hover {
      background: #2980b9;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to OpenCode!</h1>
    <p>An experimental and open-source real-time HTML/CSS/JS editor with AI-powered assistance.</p>
  </div>

  <div class="features">
    <div class="feature-card">
      <h3>🤖 AI Generation</h3>
      <p>Use natural language to describe what you want and let AI generate the code for you.</p>
    </div>
    <div class="feature-card">
      <h3>🚀 Export & Deploy</h3>
      <p>Download your code or deploy directly to GitHub and Netlify with one click.</p>
    </div>
  </div>

  <div class="try-section">
    <h2>Try it out!</h2>
    <p>Edit this starter code or clear the editor to begin your project.</p>
    <p>Try changing the text below or adding new elements:</p>
    
    <div style="margin: 20px 0; padding: 15px; background: #e8f4f8; border-left: 4px solid #3498db;">
      <h3 style="margin-top: 0;">Hello World!</h3>
      <p>This is your live preview. Edit the code on the left to see changes here.</p>
      <button onclick="alert('It works!')" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Click Me
      </button>
    </div>

    <p>For AI assistance, type your request in the prompt box at the bottom of the editor.</p>
    <p>Example prompts:</p>
    <ul>
      <li>"Create a responsive navigation bar"</li>
      <li>"Add a dark mode toggle button"</li>
      <li>"Make a contact form with validation"</li>
    </ul>
  </div>

  <div style="margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 0.9em;">
    <p>Built with ❤️ using React by @emjjkk</p>
  </div>
</body>
</html>`;

export default function Home() {
  const [htmlCode, setHtmlCode] = useState<string>(DEFAULT_HTML_CODE);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isSavingToGithub, setIsSavingToGithub] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);

  // Load config from localStorage on initial render
  useEffect(() => {
    const savedConfig = localStorage.getItem("openCodeConfig");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsedConfig
        });
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
  }, []);

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
    
    // Use fallback API key if custom key is not enabled or not provided
    const effectiveApiKey = config.useCustomKey ? config.customApiKey : process.env.NEXT_PUBLIC_FALLBACK_API_KEY;
    if (!effectiveApiKey) {
      alert("No API key available. Please provide one in settings.");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(config.endpoint || DEFAULT_CONFIG.endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${effectiveApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "OpenCode"
        },
        body: JSON.stringify({
          model: config.model || DEFAULT_CONFIG.model,
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
      alert(`Failed to generate code: ${error}`);
    } finally {
      setIsLoading(false);
      setAiPrompt("");
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCodeWithAI();
  };

  // Handle file download
  const handleDownload = () => {
    setIsDownloading(true);
    
    // Create a Blob with the HTML content
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    
    // Append to body, click and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up and reset loading state after a small delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setIsDownloading(false);
    }, 200);
  };

  // Save to GitHub
  const saveToGithub = async () => {
    if (!config.githubToken || !config.githubRepo) {
      alert("Please configure GitHub settings first");
      return;
    }

    setIsSavingToGithub(true);
    
    try {
      // Extract owner and repo name from the full repo URL
      const repoPath = config.githubRepo.replace(/^https:\/\/github.com\//, '').replace(/\.git$/, '');
      const [owner, repo] = repoPath.split('/');
      
      // Get current date for commit message
      const date = new Date().toISOString();
      
      // Check if file exists to get SHA
      let sha = null;
      try {
        const checkResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/index.html`, {
          headers: {
            'Authorization': `token ${config.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          sha = checkData.sha;
        }
      } catch (error) {
        console.log('File does not exist yet, will create new');
      }
      
      // Create or update file
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/index.html`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${config.githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: `Update index.html - ${date}`,
          content: btoa(htmlCode),
          sha: sha
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      alert('Successfully saved to GitHub!');
    } catch (error) {
      console.error('GitHub save error:', error);
      alert(`Failed to save to GitHub: ${error}`);
    } finally {
      setIsSavingToGithub(false);
    }
  };

  // Deploy to Netlify
  const deployToNetlify = async () => {
    if (!config.netlifyToken || !config.netlifySiteId) {
      alert("Please configure Netlify settings first");
      return;
    }

    setIsDeploying(true);
    
    try {
      // Create a zip file with our HTML content
      const zip = new JSZip();
      zip.file("index.html", htmlCode);
      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      // Deploy to Netlify
      const formData = new FormData();
      formData.append('file', zipContent, 'deploy.zip');
      
      const response = await fetch(
        `https://api.netlify.com/api/v1/sites/${config.netlifySiteId}/deploys`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.netlifyToken}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Netlify API error: ${response.status}`);
      }

      const data = await response.json();
      alert(`Deployment started! View at: ${data.url}`);
    } catch (error) {
      console.error('Netlify deploy error:', error);
      alert(`Failed to deploy: ${error}`);
    } finally {
      setIsDeploying(false);
    }
  };

  // Save config to localStorage
  const saveConfig = (newConfig: typeof DEFAULT_CONFIG) => {
    setConfig(newConfig);
    localStorage.setItem("openCodeConfig", JSON.stringify(newConfig));
    setShowSettings(false);
  };

  // Reset to default config
  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem("openCodeConfig");
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
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-[0.5] flex items-center justify-center z-50">
          <div className="bg-[#222] p-6 rounded-lg max-w-[80vw] w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            
            <div className="space-x-4 flex justify-between">
              {/* AI Settings Section */}
              <div className="border-b border-gray-700 pb-4 w-[33%]">
                <h3 className="font-semibold mb-2">AI Configuration</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Use your own API key</label><br/>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.useCustomKey}
                      onChange={(e) => setConfig({...config, useCustomKey: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {config.useCustomKey && (
                  <>
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1">Custom API Key</label>
                      <input
                        type="password"
                        value={config.customApiKey}
                        onChange={(e) => setConfig({...config, customApiKey: e.target.value})}
                        placeholder="sk-or-xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-[#333] text-white px-3 py-2 rounded-sm outline-none"
                      />
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1">API Endpoint</label>
                      <input
                        type="text"
                        value={config.endpoint}
                        onChange={(e) => setConfig({...config, endpoint: e.target.value})}
                        className="w-full bg-[#333] text-white px-3 py-2 rounded-sm outline-none"
                      />
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1">Model</label>
                      <input
                        type="text"
                        value={config.model}
                        onChange={(e) => setConfig({...config, model: e.target.value})}
                        className="w-full bg-[#333] text-white px-3 py-2 rounded-sm outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* GitHub Settings Section */}
              <div className="border-b border-gray-700 pb-4 w-[33%]">
                <h3 className="font-semibold mb-2">GitHub Configuration</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">GitHub Personal Access Token</label>
                  <input
                    type="password"
                    value={config.githubToken}
                    onChange={(e) => setConfig({...config, githubToken: e.target.value})}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#333] text-white px-3 py-2 rounded-sm outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Create one with repo permissions at GitHub Settings &gt; Developer Settings
                  </p>
                </div>
                
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">GitHub Repository URL</label>
                  <input
                    type="text"
                    value={config.githubRepo}
                    onChange={(e) => setConfig({...config, githubRepo: e.target.value})}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-[#333] text-white px-3 py-2 rounded-sm outline-none"
                  />
                </div>
              </div>

              {/* Netlify Settings Section */}
              <div className="border-b border-gray-700 pb-4 w-[33%]">
                <h3 className="font-semibold mb-2">Netlify Configuration</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Netlify Personal Access Token</label>
                  <input
                    type="password"
                    value={config.netlifyToken}
                    onChange={(e) => setConfig({...config, netlifyToken: e.target.value})}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#333] text-white px-3 py-2 rounded-sm outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Create one at Netlify User Settings &gt; Applications
                  </p>
                </div>
                
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">Netlify Site ID</label>
                  <input
                    type="text"
                    value={config.netlifySiteId}
                    onChange={(e) => setConfig({...config, netlifySiteId: e.target.value})}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full bg-[#333] text-white px-3 py-2 rounded-sm outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Find this in Site Settings &gt; General
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={resetConfig}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-sm"
              >
                Reset to Defaults
              </button>
              <p className="text-sm max-w-sm text-center">Information provided here will be stored locally on your browser and will not be sent to any servers.</p>
              <div className="space-x-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveConfig(config)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="w-full flex items-center justify-between px-4 h-[60px] border-b border-[#111] absolute top-0">
        <div className="flex items-center">
          <img src="/logo.png" alt="" className="w-[32px] h-auto" />
          <h1 className="text-xl font-semibold ml-1 pr-3 border-r border-[#111]">openCode</h1>
          <div className="flex items-center pl-3">
            <button 
              className="px-2 py-1 bg-gray-500 text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff]"
              onClick={() => setShowSettings(true)}
            >
              <LuSettings className="mr-1"/>Settings
            </button>
            <button 
              className="px-2 py-1 bg-gray-500 text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff]"
              onClick={() => setHtmlCode('<!DOCTYPE html>\n<html>\n<head>\n  <title>New Project</title>\n</head>\n<body>\n\n</body>\n</html>')}
            >
              <LuRefreshCcw className="mr-1"/> Reset
            </button>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-2 py-1 bg-gray-500 text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff] disabled:opacity-50"
            >
              {isDownloading ? (
                <FaSpinner className="animate-spin mr-1" />
              ) : (
                <LuDownload className="mr-1" />
              )}
              Download
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <button 
            onClick={saveToGithub}
            disabled={isSavingToGithub}
            className="px-2 py-1 bg-[#333] text-white text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff] disabled:opacity-50"
          >
            {isSavingToGithub ? (
              <FaSpinner className="animate-spin mr-1" />
            ) : (
              <FaGithub className="mr-1" />
            )}
            Save to GitHub
          </button>
          <button 
            onClick={deployToNetlify}
            disabled={isDeploying}
            className="px-2 py-1 bg-[#20c6b7] text-white text-sm rounded-sm font-bold mr-2 flex items-center hover:cursor-pointer hover:bg-[#0000ff] disabled:opacity-50"
          >
            {isDeploying ? (
              <FaSpinner className="animate-spin mr-1" />
            ) : (
              <FaSpinner className="mr-1" />
            )}
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
          <div className="px-2 py-1 bg-[#111] absolute top-2 left-4 text-sm rounded-sm flex items-center font-bold">
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
          <a href="https://github.com/emjjkk/openCode" className="ml-1 text-sm">Contribute on Github</a>
        </div>
      </footer>
    </main>
  );
}