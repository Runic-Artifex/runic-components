import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource/cormorant/400.css";
import "./styles.css";
import { NativeApp } from "./NativeApp";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NativeApp />
  </React.StrictMode>,
);
