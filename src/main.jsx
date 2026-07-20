import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import FehuFire from "./FehuFire.jsx";
import FehuFireV2 from "./FehuFireV2.jsx";
import "./index.css";

/* Prepínač verzií:
   V1 = pôvodné komponenty · V2 = komponenty z COMPONENT SITE
   Otvoriť priamo: ?v=2  ·  Prepínač vpravo dole. */
function Root() {
  const [ver, setVer] = useState(() =>
    new URLSearchParams(window.location.search).get("v") === "2" ? 2 : 1
  );
  return (
    <>
      {ver === 2 ? <FehuFireV2 /> : <FehuFire />}
      <button
        onClick={() => setVer(v => (v === 1 ? 2 : 1))}
        title="Prepnúť verziu dizajnu"
        style={{
          position: "fixed", bottom: 14, right: 14, zIndex: 999,
          padding: "9px 15px", borderRadius: 40,
          border: "1px solid rgba(255,140,26,.45)",
          background: "rgba(20,10,5,.88)", color: "#ffaa32",
          fontSize: 12, fontWeight: 700, letterSpacing: ".04em",
          cursor: "pointer", backdropFilter: "blur(8px)",
          boxShadow: "0 8px 24px rgba(0,0,0,.5)",
        }}>
        {ver === 1 ? "V1 · klasik" : "V2 · komponenty"} ⇄
      </button>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
