import { useEffect, useState, useRef, Component, ErrorInfo, ReactNode } from "react";
import "./App.css";

// ErrorBoundary 组件
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#1a1a1c' }}>
          {this.props.children}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px',
            boxSizing: 'border-box'
          }}>
            <div style={{
              background: '#1a1a1c',
              border: '1px solid #ff4d4f',
              borderRadius: '8px',
              padding: '16px',
              maxWidth: '90%',
              width: '400px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              <Text color="red" weight="bold" mb="2" style={{ display: 'block' }}>程序发生错误</Text>
              <ScrollArea scrollbars="vertical" style={{ height: '150px', marginBottom: '16px' }}>
                <Text size="1" color="gray" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {this.state.error?.stack || this.state.error?.message}
                </Text>
              </ScrollArea>
              <Flex justify="end">
                <IconButton 
                  size="1" 
                  variant="soft" 
                  color="gray" 
                  onClick={() => window.location.reload()}
                  style={{ cursor: 'pointer' }}
                >
                  <Text size="1">重启应用</Text>
                </IconButton>
              </Flex>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { HZEngineCore, System } from "hzengine-core";
import HZEnginePlatformWeb from "./hzengine/hzengine-platform-web";
import { EletronViewPlugin } from "./hzengine/view/index";
import { useLocation, useNavigate } from "react-router-dom";
import { Flex, Text, IconButton, ScrollArea, Box as RadixBox } from "@radix-ui/themes";

declare const path: {
  dirname: (p: string) => string;
  join: (...args: string[]) => string;
  basename: (p: string) => string;
};

const RollingText = ({ text, style }: { text: string; style?: React.CSSProperties }) => {
  const [items, setItems] = useState<{ id: number; val: string }[]>([]);
  const [animating, setAnimating] = useState(false);
  const counter = useRef(0);
  const prevText = useRef("");

  useEffect(() => {
    if (text === prevText.current) return;
    
    counter.current++;
    const newItem = { id: counter.current, val: text };
    
    setItems(prev => {
      if (prev.length === 0) return [newItem];
      return [prev[prev.length - 1], newItem];
    });
    setAnimating(true);
    
    prevText.current = text;
  }, [text]);

  // 动画结束后重置状态
  useEffect(() => {
    if (animating) {
      const timer = setTimeout(() => {
        setItems(prev => prev.slice(-1));
        setAnimating(false);
      }, 250); // 与 transition 时间一致
      return () => clearTimeout(timer);
    }
  }, [animating]);

  return (
    <div style={{ 
      height: "14px", 
      overflow: "hidden", 
      position: "relative",
      ...style 
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        transition: animating ? "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        transform: animating ? "translateY(-14px)" : "translateY(0)",
        textAlign: style?.textAlign
      }}>
        {items.map(item => (
          <div key={item.id} style={{ height: "14px", lineHeight: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.val}
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const packagePath = location.state?.packagePath;

  const [scriptInfo, setScriptInfo] = useState({ name: "-", line: 0 });
  const [commandInfo, setCommandInfo] = useState("-");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (!packagePath) {
      navigate("/");
      return;
    }

    // 读取项目名称
    try {
      // @ts-ignore
      const packageContent = window.fs.readFileSync(packagePath, "utf-8");
      const packageConfig = JSON.parse(packageContent);
      setProjectName(packageConfig.name || packageConfig.title || "");
    } catch (e) {
      console.error("Failed to read package config:", e);
    }

    const projectDir = path.dirname(packagePath); // e.g. .../project
    const gameRoot = path.dirname(projectDir); // e.g. .../
    const preloadedPath = path.join(gameRoot, "preload", "preloaded.json");

    // 加载项目前，如果存在 preloaded.json 则删除它
    try {
      // @ts-ignore
      if (window.fs.existsSync(preloadedPath)) {
        // @ts-ignore
        window.fs.unlinkSync(preloadedPath);
        console.log("Deleted preloaded.json before project load");
      }
    } catch (e) {
      console.error("Failed to delete preloaded.json:", e);
    }

    const hzengine = new HZEngineCore(HZEnginePlatformWeb);
    Object.assign(window, { hz: hzengine });

    hzengine.loadPlugin("views", EletronViewPlugin);

    hzengine.loadProject({
      projectPath: projectDir,
      cachePath: path.join(gameRoot, "preload"),
      savePath: path.join(gameRoot, "save"),
    });

    (hzengine.storage.gd as Record<string, boolean>).realEnv = false;

    hzengine.system.start();

    // 状态同步循环
    let syncTimer: any;
    const syncStatus = () => {
      try {
        // @ts-ignore
        const script = hzengine.script;
        if (script && script.nextRunPosition) {
          setScriptInfo({
            name: path.basename(script.nextRunPosition[0] || "-"),
            line: script.nextRunPosition[1] + 1 // 1-based index
          });
          setCommandInfo(script.currentRawCommand || "-");
        }
      } catch (e) {}
      syncTimer = requestAnimationFrame(syncStatus);
    };
    syncStatus();

    // 强制刷新一下 UI 层级
    setTimeout(() => {
      const root = document.getElementById("hzengine-root");
      if (root) {
        console.log("HZEngine Root children count:", root.children.length);
        // 确保 root 及其子元素可见
        root.style.display = "block";
        root.style.visibility = "visible";
      }
    }, 100);

    function tryOpenQuickMenu() {
      if (hzengine.system.condition !== System.Condition.Free) {
        let router = hzengine.ui.getRouter("page");
        if (router && router.length) {
          // 已经打开了其它页面
          router.pop();
        } else {
          // 没有打开任何页面，直接打开快捷菜单
          if (!router) router = hzengine.ui.addRouter("page", "overlay");
          router.push("quick_menu", {});
        }
        return true;
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if (hzengine.system.condition === System.Condition.Pause) {
          hzengine.system.continue();
        }
      }
      if (e.key === "Escape" || e.key === "m") {
        tryOpenQuickMenu();
      }
      if (e.key === "r" || e.key === "R") {
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const handleGlobalClick = () => {
      if (hzengine.system.condition === System.Condition.Pause) {
        hzengine.system.continue();
      }
    };

    const gameRootDiv = document.getElementById("hzengine-game-content");
    if (gameRootDiv) {
      gameRootDiv.addEventListener("click", handleGlobalClick);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (gameRootDiv) {
        gameRootDiv.removeEventListener("click", handleGlobalClick);
      }
      cancelAnimationFrame(syncTimer);
      // TODO: destroy hzengine if needed
    };
  }, [packagePath, navigate]);

  const handleBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate("/");
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // @ts-ignore
    window.ipcRenderer.send("window-close");
  };

  const handleMinimize = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // @ts-ignore
    window.ipcRenderer.send("window-minimize");
  };

  return (
    <ErrorBoundary>
    <div style={{ 
      width: "100%", 
      height: "100%", 
      boxSizing: "border-box",
      display: "flex",
      background: "transparent",
      padding: "1px",
      pointerEvents: "none"
    }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1a1a1c",
          border: "1px solid #2d2d30",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          pointerEvents: "auto"
        }}
      >
        {/* Title Bar */}
        <Flex
          justify="between"
          align="center"
          px="3"
          className="drag-region unselectable"
          style={{ height: "32px", background: "rgba(0,0,0,0.1)", flexShrink: 0, position: "relative", zIndex: 10 }}
        >
          <Flex align="center" gap="2" className="no-drag" style={{ position: "relative", zIndex: 12 }}>
            <IconButton
              variant="ghost"
              color="gray"
              size="1"
              onClick={handleBack}
              style={{ cursor: "pointer", height: "24px", width: "24px", pointerEvents: "auto" }}
            >
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </IconButton>
            <Flex align="center" gap="2" style={{ pointerEvents: "none" }}>
              <Text size="1" color="gray" style={{ fontWeight: "bold", opacity: 0.5, letterSpacing: "1px" }}>HZ-Engine Desktop</Text>
              {projectName && (
                <>
                  <div style={{ width: "1px", height: "10px", background: "gray", opacity: 0.2 }} />
                  <Text size="1" color="gray" style={{ fontWeight: "bold", opacity: 0.5 }}>{projectName}</Text>
                </>
              )}
            </Flex>
          </Flex>
          <Flex gap="2" className="no-drag" style={{ position: "relative", zIndex: 11 }}>
            <IconButton
              variant="ghost"
              color="gray"
              size="1"
              onClick={handleMinimize}
              style={{ cursor: "pointer", height: "24px", width: "24px", pointerEvents: "auto" }}
            >
              <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor"></path></svg>
            </IconButton>
            <IconButton
              variant="ghost"
              color="gray"
              size="1"
              onClick={handleClose}
              style={{ cursor: "pointer", height: "24px", width: "24px", pointerEvents: "auto" }}
            >
              <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"></path></svg>
            </IconButton>
          </Flex>
        </Flex>

        {/* Game Content */}
        <Flex
          id="hzengine-game-content"
          flexGrow="1"
          justify="center"
          align="center"
          className="unselectable"
          style={{
            position: "relative",
            width: "100%",
            background: "black",
            overflow: "hidden"
          }}
        >
          <div
            id="hzengine-root"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: "100%",
              maxHeight: "100%",
              aspectRatio: "1/1",
              backgroundColor: "#1a1a1c",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0
            }}
          />
        </Flex>

        {/* Footer */}
        <Flex 
          p="2" 
          px="3"
          justify="between" 
          align="center"
          className="unselectable"
          style={{ 
            borderTop: "1px solid rgba(255,255,255,0.03)", 
            flexShrink: 0,
            background: "rgba(0,0,0,0.1)",
            height: "28px"
          }}
        >
          <Flex gap="3" align="center">
            <div style={{ 
              color: "gray", 
              opacity: 0.4, 
              fontSize: "10px", 
              fontFamily: "monospace", 
              minWidth: "120px",
              height: "14px",
              lineHeight: "14px"
            }}>
              {scriptInfo.name}:{scriptInfo.line}
            </div>
          </Flex>
          <RollingText 
            text={commandInfo}
            style={{ color: "gray", opacity: 0.4, fontSize: "10px", fontFamily: "monospace", textAlign: "right", flexGrow: 1 }}
          />
        </Flex>
      </div>
    </div>
    </ErrorBoundary>
  );
}

export default App;
