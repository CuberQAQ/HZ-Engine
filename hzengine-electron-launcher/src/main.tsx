import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createHashRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import Start from "./Start.tsx";
import "@radix-ui/themes/styles.css";
import { ErrorBoundary } from "./App.tsx";

const router = createHashRouter([
  {
    path: "/",
    element: <Start />,
  },
  {
    path: "/game",
    element: <App />,
  },
]);

import { Theme } from "@radix-ui/themes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Theme appearance="dark" accentColor="gray" grayColor="slate" panelBackground="translucent">
      <RouterProvider router={router} />
    </Theme>
  </ErrorBoundary>
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
