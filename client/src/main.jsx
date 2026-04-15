import React from "react";
import ReactDOM from "react-dom/client";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App.jsx";
import "./index.css";

const kindeConfig = {
  clientId: import.meta.env.VITE_KINDE_CLIENT_ID,
  domain: import.meta.env.VITE_KINDE_DOMAIN,
  redirectUri: import.meta.env.VITE_KINDE_REDIRECT_URI,
  logoutUri: import.meta.env.VITE_KINDE_LOGOUT_URI,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <KindeProvider {...kindeConfig}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </KindeProvider>
  </React.StrictMode>
);

