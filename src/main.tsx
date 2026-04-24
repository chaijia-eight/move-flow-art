import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSessionTracking } from "./lib/analytics";

initSessionTracking();

createRoot(document.getElementById("root")!).render(<App />);
