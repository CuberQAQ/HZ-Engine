import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Text, Flex, Card, Heading, IconButton } from "@radix-ui/themes";

const Start: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleOpenProject = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("handleOpenProject clicked");
    setLoading(true);
    try {
      // @ts-ignore
      const filePath = await window.ipcRenderer.invoke("select-project");
      if (filePath) {
        console.log("Selected project:", filePath);
        navigate("/game", { state: { packagePath: filePath } });
      }
    } catch (e) {
      console.error("Select project error:", e);
    } finally {
      setLoading(false);
    }
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
    <div style={{ 
      width: "100%", 
      height: "100%", 
      boxSizing: "border-box",
      display: "flex",
      background: "transparent",
      padding: "0.0625rem",
      pointerEvents: "none" // 穿透最外层
    }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1a1a1c",
          border: "0.0625rem solid #2d2d30",
          borderRadius: "0.75rem",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          pointerEvents: "auto" // 恢复主体层的交互
        }}
      >
        {/* Title Bar */}
        <Flex
          justify="between"
          align="center"
          style={{ height: "2rem", background: "rgba(0,0,0,0.1)", flexShrink: 0, position: "relative", zIndex: 10, paddingLeft: "0.75rem", paddingRight: "0.75rem" }}
          className="drag-region unselectable"
        >
          <Text size="1" color="gray" style={{ fontWeight: "bold", opacity: 0.5, letterSpacing: "0.0625rem", pointerEvents: "none" }}>HZ-Engine Desktop</Text>
          <Flex gap="2" className="no-drag" style={{ position: "relative", zIndex: 11 }}>
            <IconButton
              variant="ghost"
              color="gray"
              size="1"
              onClick={handleMinimize}
              style={{ cursor: "pointer", height: "1.5rem", width: "1.5rem", pointerEvents: "auto" }}
            >
              <svg style={{ width: "0.625rem", height: "0.625rem" }} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor"></path></svg>
            </IconButton>
            <IconButton
              variant="ghost"
              color="gray"
              size="1"
              onClick={handleClose}
              style={{ cursor: "pointer", height: "1.5rem", width: "1.5rem", pointerEvents: "auto" }}
            >
              <svg style={{ width: "0.625rem", height: "0.625rem" }} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"></path></svg>
            </IconButton>
          </Flex>
        </Flex>

        {/* Main Content */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          flexGrow="1"
          style={{ gap: "2rem", padding: "1.5rem" }}
        >
          <Flex direction="column" align="center" style={{ gap: "0.25rem" }}>
            <Heading size="7" style={{
              letterSpacing: "0.25rem",
              color: "#d1d1d6",
              fontWeight: 500
            }}>
              HZ-Engine
            </Heading>
          </Flex>

          <Flex direction="column" style={{ gap: "1rem", width: "100%", maxWidth: "20rem", position: "relative", zIndex: 5 }}>
            <Button
              size="3"
              variant="soft"
              color="gray"
              highContrast
              onClick={handleOpenProject}
              loading={loading}
              style={{
                cursor: "pointer",
                height: "2.75rem",
                fontSize: "0.875rem",
                borderRadius: "0.5rem",
                background: "rgba(255,255,255,0.05)",
                pointerEvents: "auto"
              }}
            >
              打开项目 (hz_package.json)
            </Button>
            
            <Flex direction="column" style={{ gap: "0.5rem", marginTop: "0.5rem" }}>
              <Text size="1" weight="medium" color="gray" style={{ opacity: 0.5, fontSize: "0.6875rem" }}>
                最近使用的项目
              </Text>
              <Box style={{
                height: "7.5rem",
                border: "0.0625rem solid rgba(255,255,255,0.04)",
                background: "rgba(0,0,0,0.1)",
                borderRadius: "0.375rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Text size="1" color="gray" style={{ opacity: 0.2 }}>暂无记录</Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>

        {/* Footer */}
        <Flex justify="center" style={{ padding: "0.5rem", borderTop: "0.0625rem solid rgba(255,255,255,0.03)" }}>
          <Text size="1" color="gray" style={{ opacity: 0.2, fontSize: "0.625rem" }}>
            v1.0.0-stable | 稳定版
          </Text>
        </Flex>
      </div>
    </div>
  );
};

export default Start;