import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const queryClient = new QueryClient();
const app = (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {app}
  </React.StrictMode>
);
