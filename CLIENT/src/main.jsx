import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import Routers from "./Router/Routers";
import { UserProvider } from "../src/Context/UserContext.jsx"; // ✅ import provider

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserProvider>
      <Routers />
    </UserProvider>
  </BrowserRouter>
);
