  import { createRoot } from "react-dom/client";
  import App from "@/App.tsx";
  import "@/index.css";
  import "@/styles/globals.css";
  import "@/styles/capacitor.css";
  import { initCapacitor } from "@/lib/capacitor";

  // Initialize Capacitor plugins
  initCapacitor().catch(console.error);

  createRoot(document.getElementById("root")!).render(<App />);
