import React from "react";
import ReactDOM from "react-dom/client";
// import { RouterProvider } from "react-router-dom";
// import { router } from "@/app/router"; // Import router đã cấu hình
import "./globals.css";
import { Toaster } from "sonner";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { queryClient } from "./lib/api/queryClient";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { QueryProvider } from "@/app/providers/QueryProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </QueryProvider>
  </React.StrictMode>,
);
