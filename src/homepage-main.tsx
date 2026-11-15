
import React from "react";
import ReactDOM from "react-dom/client";
import HomePage from "./components/HomePage";
import BackgroundMusic from "./components/BackgroundMusic";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <HomePage />
    <BackgroundMusic />
  </React.StrictMode>
);
