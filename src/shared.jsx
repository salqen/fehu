import { useState, useEffect, useRef, useCallback } from "react";


/* ---- Statické assety (public/) ---- */
const P1 = "/poster-rfa34.webp";
const P2 = "/poster-rfa33.webp";
const P3 = "/poster-rfa32.webp";
const P4 = "/poster-gfn-rfa.webp";
export const LOGO_EMBLEM = "/logo-emblem.webp";
export const LOGO_FULL = "/logo-full.webp";


/* ---- PLAGÁTY (RFA eventy) — carousel/coverflow ---- */
export const POSTERS = [
  { src: P1, title: "RFA 34 — Žilina", date: "17.10.2026", venue: "Zimný štadión" },
  { src: P2, title: "RFA 33 — All Stars", date: "25.09.2026", venue: "Gopass Arena, Bratislava" },
  { src: P3, title: "RFA 32 — Boj o hrad", date: "15.08.2026", venue: "Bratislavský hrad" },
  { src: P4, title: "Gladiator Fight Night × RFA", date: "13.06.2026", venue: "Saturn Arena, Ingolstadt" },
];

/* ---- FEHU runa logo (base64) ---- */

/* ============================================================
   FEHU — Orbitálny hero s 3D paralaxou
   Spája:
   • 3D parallax tilt scény podľa pohybu myši
   • SVG orbitálne prstence + spojnice (spokes) prepojené s kruhmi
   • Sekvenčnú intro animáciu (spokes → prstence → centrum → satelity)
   • Orbitujúce svetelné body + rotujúci žiariaci oblúk
   • Hover-highlight spojníc ku každému satelitu
   Ohnivá zlato-amber paleta.
   ============================================================ */

const FO_ANGLES = [270, 315, 0, 45, 90, 135, 180, 225];

const NODES = [
  { id: "onas",      label: "O nás",    icon: <><circle cx="12" cy="8" r="4"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/></> },
  { id: "kontakt",   label: "Kontakt",  icon: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></> },
  { id: "video",     label: "Video & Dokumenty", icon: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></> },
  { id: "prieskum",  label: "Prieskum", icon: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></> },
  { id: "projekty",  label: "Projekty", icon: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></> },
  { id: "eventy",    label: "Eventy",   icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
  { id: "media",     label: "Médiá",    icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></> },
  { id: "broadcast", label: "Broadcast & Podcast", icon: <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/></> },
];

/* poradie sekcií pre mobilné menu / footer */
export const MENU = [
  { id: "onas",      label: "O nás" },
  { id: "video",     label: "Video & Dokumenty" },
  { id: "prieskum",  label: "Prieskum trhu" },
  { id: "projekty",  label: "Projekty" },
  { id: "eventy",    label: "Eventy" },
  { id: "media",     label: "Médiá" },
  { id: "broadcast", label: "Broadcast & Podcast" },
  { id: "kontakt",   label: "Kontakt" },
];

/* ---- Navigácia okolo loga ----
   Klasické poradie čítania: O nás vľavo, Kontakt na konci vpravo.
   Logo sedí v strede, MENU sa rozdelí na dve rovnaké polovice.   */
const NAV_HALF = Math.ceil(MENU.length / 2);
export const NAV_LEFT = MENU.slice(0, NAV_HALF);
export const NAV_RIGHT = MENU.slice(NAV_HALF);

/* SVG geometria */
const SIZE = 760;
const CX = SIZE / 2, CY = SIZE / 2;
const RADII = [102, 184, 264];
const SPOKE_R = 258;
const GOLD = "rgba(232,196,106,";

export function FehuOrbital({ onNavigate }) {
  const wrapRef = useRef(null);
  const sceneRef = useRef(null);
  const svgRef = useRef(null);
  const ringRefs = useRef([]);
  const dot1Ref = useRef(null);
  const dot3Ref = useRef(null);
  const arcRef = useRef(null);
  const blobRefs = useRef([]);
  const connRefs = useRef([]);
  const spokeRefs = useRef([]);
  const fireCanvasRef = useRef(null);
  const hoverRef = useRef(-1); // -1 none, -2 center, 0..7 satellites
  const revealedRef = useRef(false);

  const [revealed, setRevealed] = useState(false);
  const [satShown, setSatShown] = useState(new Set());
  const [hover, setHover] = useState(-1);

  /* ── intro sekvencia (centrum + satelity) ── */
  useEffect(() => {
    const t1 = setTimeout(() => {
      setRevealed(true);
      revealedRef.current = true;
      NODES.forEach((_, i) => {
        setTimeout(() => setSatShown((prev) => new Set([...prev, i])), 150 + i * 90);
      });
    }, 300);
    return () => clearTimeout(t1);
  }, []);

  /* ── 3D parallax tilt ── */
  useEffect(() => {
    let mx = 0, my = 0, tx = 0, ty = 0, raf;
    const wrap = wrapRef.current;
    if (!wrap) return;

    function onMove(e) {
      const rect = wrap.getBoundingClientRect();
      mx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      my = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    }
    function onLeave() { mx = 0; my = 0; }
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);

    const lerp = (a, b, t) => a + (b - a) * t;
    function loop() {
      tx = lerp(tx, mx, 0.06); ty = lerp(ty, my, 0.06);
      const rotX = -ty * 14, rotY = tx * 14;
      if (sceneRef.current) sceneRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

      const sy = [0.12, 0.18, 0.22];
      [ [ringRefs.current[0], dot1Ref.current],
        [ringRefs.current[1], arcRef.current],
        [ringRefs.current[2], dot3Ref.current] ].forEach((pair, i) => {
        const f = 0.4 + i * 0.2;
        const scaleY = 1 - Math.abs(ty) * sy[i];
        pair.forEach((el) => { if (el) el.style.transform = `rotateX(${rotX*f}deg) rotateY(${rotY*f}deg) scaleY(${scaleY})`; });
      });

      const bf = [-18, -12, -8];
      blobRefs.current.forEach((b, i) => { if (b) b.style.transform = `translate(${tx*bf[i]}px,${ty*bf[i]}px)`; });

      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => { cancelAnimationFrame(raf); wrap.removeEventListener("mousemove", onMove); wrap.removeEventListener("mouseleave", onLeave); };
  }, []);

  /* ── OHNIVÉ OBRUČE — žiaria iba pri hover na kruh ── */
  useEffect(() => {
    const cv = fireCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    const parts = [];

    // pozície kruhov v SVG súradniciach (CX/CY priestor)
    function targetFor(h) {
      if (h === -2) return { x: CX, y: CY, r: 117 };      // centrum (+50%)
      if (h >= 0) {
        const rad = FO_ANGLES[h] * Math.PI / 180;
        // satelit pri hover zväčšený o 5% -> obruč na r 78*1.05 ≈ 82
        return { x: CX + SPOKE_R * Math.cos(rad), y: CY + SPOKE_R * Math.sin(rad), r: 82 };
      }
      return null;
    }

    function spawnRing(cx, cy, radius, count, scale) {
      for (let n = 0; n < count; n++) {
        const a = (n / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const rr = radius + (Math.random() - 0.5) * 3 * scale;
        parts.push({
          x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr,
          vx: Math.cos(a) * (0.15 + Math.random() * 0.25) * scale + (Math.random() - .5) * .15 * scale,
          vy: Math.sin(a) * (0.15 + Math.random() * 0.25) * scale - (0.35 + Math.random() * 0.6) * scale,
          life: 1, decay: 0.03 + Math.random() * 0.035,
          size: (1.3 + Math.random() * 2.6) * scale,
        });
      }
    }

    function spawnStream(sx, sy) {
      // ohnivý prúd: častice po čiare satelit -> centrum
      const steps = 5;
      for (let s = 0; s < steps; s++) {
        const tt = Math.random();
        const x = sx + (CX - sx) * tt;
        const y = sy + (CY - sy) * tt;
        parts.push({
          x: x + (Math.random()-.5)*7, y: y + (Math.random()-.5)*7,
          vx: (CX - sx) / 380 + (Math.random()-.5)*.5,
          vy: (CY - sy) / 380 - (0.2 + Math.random()*0.7),
          life: 1, decay: 0.035 + Math.random()*0.04,
          size: 1.6 + Math.random()*3,
        });
      }
    }

    function loop() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const h = hoverRef.current;

      // CENTRUM — zapáli sa po intro animácii a horí stále
      if (revealedRef.current) spawnRing(CX, CY, 117, 16, 1.5);

      const t = targetFor(h);
      if (t && h >= 0) {
        // hover na satelit: obruč okolo satelitu + prúd k centru + zosilnené centrum
        const pts = Math.max(10, Math.round(24 * t.r / 82));
        spawnRing(t.x, t.y, t.r, pts, t.r / 82);
        spawnStream(t.x, t.y);
        spawnRing(CX, CY, 117, 30, 2.2); // zosilnenie centra
      } else if (h === -2) {
        // hover priamo na centrum: silný oheň
        spawnRing(CX, CY, 117, 34, 2.5);
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vx += (Math.random() - .5) * .12;
        p.life -= p.decay; p.size *= .975;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        const al = p.life * p.life;
        const g = Math.min(220, Math.floor(120 + p.life * 110));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${g},20,${al * 0.1})`; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${g},30,${al * 0.9})`; ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const onHover = useCallback((i) => { setHover(i); hoverRef.current = i; }, []);
  const onLeaveSat = useCallback(() => { setHover(-1); hoverRef.current = -1; }, []);

  return (
    <div className="fo-wrap" ref={wrapRef}>
      <style>{FO_CSS}</style>

      {/* parallax blobs */}
      <div className="fo-blob" ref={(el)=>blobRefs.current[0]=el} style={{ width:320, height:320, top:"10%", left:"5%", background:"rgba(216,172,60,0.06)" }} />
      <div className="fo-blob" ref={(el)=>blobRefs.current[1]=el} style={{ width:220, height:220, top:"60%", right:"8%", background:"rgba(176,128,30,0.05)" }} />
      <div className="fo-blob" ref={(el)=>blobRefs.current[2]=el} style={{ width:160, height:160, top:"20%", right:"22%", background:"rgba(230,184,76,0.04)" }} />

      <div className="fo-scene" ref={sceneRef}>
        {/* ohnivý canvas — obruče sa rozžiaria pri hover */}
        <canvas ref={fireCanvasRef} className="fo-fire" width={SIZE} height={SIZE} />

        {/* center */}
        <button className="fo-center"
          onClick={()=>onNavigate && onNavigate("onas")}
          onMouseEnter={()=>{ setHover(-2); hoverRef.current=-2; }}
          onMouseLeave={onLeaveSat}
          style={{ opacity: revealed?1:0, transform: revealed?"scale(1)":"scale(.4)" }}>
          <img className={`fo-rune ${hover!==-1 ? "lit" : ""}`} src="/logo-original.webp" alt="FEHU Prosperity" />
        </button>

        {/* satellites */}
        {NODES.map((n, i) => {
          const rad = FO_ANGLES[i] * Math.PI / 180;
          const x = CX + SPOKE_R * Math.cos(rad), y = CY + SPOKE_R * Math.sin(rad);
          const show = satShown.has(i);
          const pct = (v) => `${(v / SIZE) * 100}%`;
          return (
            <button key={n.label} className="fo-sat"
              onClick={()=>onNavigate && onNavigate(n.id)}
              onMouseEnter={()=>onHover(i)} onMouseLeave={onLeaveSat}
              style={{
                left:`calc(${pct(x)} - 10.25%)`, top:`calc(${pct(y)} - 10.25%)`,
                opacity: show?1:0, transform: show?"scale(1)":"scale(.2)",
              }}>
              <svg viewBox="0 0 24 24" className="fo-sat-icon">{n.icon}</svg>
              <span className="fo-sat-label">{n.label}</span>
            </button>
          );
        })}
      </div>

      <div className="fo-bottom">FEHU — Marketingová agentúra</div>
    </div>
  );
}

const FO_CSS = `

.fo-wrap{
  width:100%; min-height:100vh; position:relative; overflow:hidden;
  display:flex; align-items:center; justify-content:center;
  perspective:1000px;
  font-family:'Space Mono',monospace;
  background:radial-gradient(ellipse 85% 75% at 50% 52%, #1a0d05 0%, #0a0503 68%);
}
.fo-blob{ position:absolute; border-radius:50%; pointer-events:none; will-change:transform; filter:blur(72px); }

.fo-scene{
  position:relative; width:760px; height:760px; max-width:96vw; max-height:96vw;
  display:flex; align-items:center; justify-content:center;
  transform-style:preserve-3d; will-change:transform; transition:transform .08s ease-out;
}
.fo-fire{ position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:1; }

/* center */
.fo-center{
  position:relative; z-index:10; width:30.75%; height:30.75%; border-radius:50%;
  background:radial-gradient(circle at 35% 32%, #2a1608, #140a03);
  border:1.5px solid rgba(255,170,50,.55);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0;
  cursor:pointer; text-align:center;
  box-shadow:0 0 0 6px rgba(255,140,20,.05), 0 0 50px rgba(255,120,0,.18), 0 0 90px rgba(255,80,0,.08),
             0 24px 64px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,180,60,.18);
  transition:opacity .12s, transform .7s cubic-bezier(.34,1.56,.64,1), box-shadow .4s;
}
.fo-center:hover{
  box-shadow:0 0 0 10px rgba(255,140,20,.08), 0 0 70px rgba(255,120,0,.32), 0 0 120px rgba(255,80,0,.12),
             0 24px 64px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,180,60,.25);
}
.fo-rune{ width:190px; height:auto; filter:drop-shadow(0 0 12px rgba(255,150,0,.6)); display:block; transition:filter .35s; }
.fo-rune.lit{ filter:drop-shadow(0 0 18px rgba(255,180,40,1)) drop-shadow(0 0 38px rgba(255,120,0,.7)) brightness(1.25); }
.fo-rune-text{
  font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:600;
  letter-spacing:1.5px;
}
/* pulse rings removed — center only glows on hover */

/* satellites */
.fo-sat{
  position:absolute; width:20.5%; height:20.5%; border-radius:50%;
  background:radial-gradient(circle at 35% 30%, #261607, #140a03);
  border:1px solid rgba(255,160,40,.22);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
  cursor:pointer; z-index:6;
  box-shadow:0 8px 32px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,180,60,.08);
  transition:opacity .12s, transform .5s cubic-bezier(.34,1.56,.64,1), border-color .35s, box-shadow .35s, background .35s;
}
.fo-sat:hover{
  background:radial-gradient(circle at 35% 30%, #3a2410, #1c1004);
  border-color:rgba(255,170,50,.7);
  box-shadow:0 16px 48px rgba(0,0,0,.8), 0 0 26px rgba(255,130,0,.25), inset 0 1px 0 rgba(255,180,60,.2);
  transform:scale(1.05) translateZ(20px) !important; z-index:20;
}
.fo-sat-icon{
  width:42px; height:42px; stroke:#ffaa32; stroke-width:1.4; fill:none;
  stroke-linecap:round; stroke-linejoin:round; transition:all .3s;
  filter:drop-shadow(0 0 4px rgba(255,150,0,.35));
}
.fo-sat:hover .fo-sat-icon{ stroke:#ffe0a0; filter:drop-shadow(0 0 9px rgba(255,160,0,.7)); }
.fo-sat-label{
  font-size:.62rem; letter-spacing:.18em; text-transform:uppercase;
  color:rgba(226,196,120,.55); transition:color .3s;
  /* dlhé názvy (Broadcast & Podcast, Video & Dokumenty) sa zalomia na dva riadky */
  white-space:normal; text-align:center; line-height:1.3;
  max-width:92%; text-wrap:balance;
}
.fo-sat:hover .fo-sat-label{ color:rgba(244,222,160,.95); }

.fo-bottom{
  position:absolute; bottom:22px; left:50%; transform:translateX(-50%);
  font-size:.52rem; letter-spacing:.5em; text-transform:uppercase; white-space:nowrap;
  color:rgba(226,196,120,.3);
}

@media (max-width:560px){
  .fo-rune{ width:118px; }
  .fo-sat-icon{ width:26px; height:26px; }
  .fo-sat-label{ font-size:.42rem; }
}
@media (prefers-reduced-motion:reduce){ .fo-scene{ transition:none; } }

/* ── FehuOrbital hero override — orbit v normálnom toku, text POD ním ── */
.hero .fo-wrap{
  position:relative; inset:auto; min-height:unset; height:auto;
  background:none; overflow:visible; flex:0 0 auto; width:auto;
}
.hero .fo-scene{
  width:min(640px,92vw,56vh); height:min(640px,92vw,56vh); max-width:none; max-height:none;
}
.hero .fo-bottom{ display:none; }
`;


/* ============================================================
   CSS
   ============================================================ */
export const CSS = `

.fehu{
  /* DARK GOLD (default) — zlatá podľa FEHU loga */
  --bg:#0a0804;
  --bg2:#161006;
  --fg:#f9f3e2;
  --fg-dim:#b3a177;
  --accent:#e0b84f;
  --accent-2:#b8860b;
  --accent-ink:#171003;
  --line:rgba(224,184,79,.14);
  --card-light-bg:#1a1408;
  --card-light-fg:#f9f3e2;
  --card-light-dim:#c2af80;

  background:var(--bg);
  color:var(--fg);
  font-family:'Inter',system-ui,sans-serif;
  width:100%;
  min-height:100%;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}
.fehu.light{
  --bg:#fbf6ea;
  --bg2:#f4ecd8;
  --fg:#2a2108;
  --fg-dim:#8a7a4e;
  --accent:#b8860b;
  --accent-2:#96700a;
  --accent-ink:#fff;
  --line:rgba(160,120,20,.18);
  --card-light-bg:#1a1408;
  --card-light-fg:#f9f3e2;
  --card-light-dim:#c2af80;
}

.serif-it{ font-family:'Instrument Serif',serif; font-style:italic; font-weight:400; }
::selection{ background:var(--accent); color:var(--accent-ink); }
html{ scroll-behavior:smooth; }

/* ---- NAV ---- */
.nav{
  position:fixed; top:0; left:0; right:0; z-index:50;
  display:flex; align-items:center; justify-content:space-between;
  padding:1rem 1.6rem;
  backdrop-filter:blur(14px);
  background:color-mix(in srgb, var(--bg) 70%, transparent);
  border-bottom:1px solid var(--line);
}
.logo{
  cursor:pointer; display:inline-flex; align-items:center; line-height:1;
}
.logo-rune-img{ height:42px; width:auto; display:block;
  filter:drop-shadow(0 0 6px color-mix(in srgb,var(--accent) 45%, transparent)); }
.logo-wide-img{ height:34px; }
.nav-links{ display:flex; gap:1.6rem; }
.nav-link{
  background:none; border:none; color:var(--fg); cursor:pointer;
  font-size:.72rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
  opacity:.75; transition:opacity .2s;
}
.nav-link:hover{ opacity:1; }
.nav-right{ display:flex; align-items:center; gap:.8rem; }
.theme-toggle{
  width:36px; height:36px; border-radius:50%;
  border:1px solid var(--line); background:transparent; color:var(--fg);
  cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center;
  transition:all .2s;
}
.theme-toggle:hover{ border-color:var(--accent); color:var(--accent); }
.nav-cta{
  background:var(--accent); color:var(--accent-ink); border:none;
  padding:.55rem 1.2rem; border-radius:40px; font-weight:700; font-size:.78rem;
  cursor:pointer; transition:transform .2s;
}
.nav-cta:hover{ transform:translateY(-1px); }

/* ---- HERO ---- */
.hero{
  position:relative; width:100%; min-height:100vh; box-sizing:border-box;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:.5rem; padding:5.5rem 1.6rem 2.5rem;
  overflow:hidden;
  background:
    radial-gradient(ellipse 80% 60% at 50% 62%, color-mix(in srgb,var(--accent-2) 22%, transparent) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 50% 78%, color-mix(in srgb,var(--accent) 20%, transparent) 0%, transparent 60%),
    radial-gradient(circle at 50% 120%, color-mix(in srgb,var(--accent-2) 30%, transparent), transparent 50%),
    linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%);
}
.hero-canvas{ position:absolute; inset:0; z-index:2; pointer-events:none; }
.hero-glow{
  position:absolute; left:50%; top:54%; transform:translate(-50%,-50%);
  width:60vmin; height:60vmin; z-index:1; pointer-events:none;
  background:radial-gradient(circle, color-mix(in srgb,var(--accent) 30%, transparent) 0%, color-mix(in srgb,var(--accent-2) 12%, transparent) 45%, transparent 70%);
  filter:blur(26px);
}

.orbit-center{
  position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  z-index:4; text-align:center; pointer-events:none;
  transition:opacity .35s ease; width:200px;
}
.fehu-rune{
  width:88px; height:auto; display:block; margin:0 auto;
  filter:drop-shadow(0 0 16px color-mix(in srgb,var(--accent) 55%, transparent))
         drop-shadow(0 0 40px color-mix(in srgb,var(--accent-2) 32%, transparent));
  animation:medGlow 3.4s ease-in-out infinite;
}
@keyframes medGlow{
  0%,100%{ filter:drop-shadow(0 0 14px color-mix(in srgb,var(--accent) 45%, transparent)) drop-shadow(0 0 34px color-mix(in srgb,var(--accent-2) 26%, transparent)); }
  50%{ filter:drop-shadow(0 0 24px color-mix(in srgb,var(--accent) 70%, transparent)) drop-shadow(0 0 58px color-mix(in srgb,var(--accent-2) 44%, transparent)); }
}
.center-name{
  margin-top:.25rem; font-weight:900; font-size:1.25rem; letter-spacing:.3em;
  text-indent:.3em; color:var(--fg);
  font-family:'Instrument Serif',serif; font-style:normal;
}
.center-sub{
  margin-top:.2rem; font-size:.46rem; letter-spacing:.34em; text-transform:uppercase;
  color:var(--fg-dim);
}

.orbit-node{
  position:absolute; width:156px; height:156px; border-radius:50%;
  z-index:4; cursor:pointer;
  background:color-mix(in srgb,var(--bg2) 78%, transparent);
  border:1px solid color-mix(in srgb,var(--accent) 35%, transparent);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.5rem;
  transition:opacity .18s ease, transform .25s ease, border-color .25s, box-shadow .25s;
  backdrop-filter:blur(3px);
}
.orbit-node:hover{
  transform:scale(1.06);
  border-color:var(--accent);
  box-shadow:0 0 26px color-mix(in srgb,var(--accent) 40%, transparent);
}
.node-icon{
  width:38px; height:38px; fill:none;
  stroke:var(--accent); stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;
}
.node-label{
  font-size:.7rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase;
  color:var(--fg);
}

.hero-copy{
  position:relative; z-index:12; width:100%; max-width:820px;
  margin:0 auto; padding:0; text-align:center;
}
.hero-title{
  font-size:clamp(2.4rem,6vw,4.6rem); font-weight:800; line-height:.95;
  letter-spacing:-.03em; margin:0 0 1rem;
}
.hero-title .serif-it{ font-size:1.05em; }
.hero-lead{
  max-width:640px; margin:0 auto 1.4rem; font-size:clamp(.9rem,1.6vw,1.1rem);
  line-height:1.5; color:var(--fg-dim);
}
.hero-lead .serif-it{ color:var(--fg); font-size:1.15em; }
.hero-btn{
  background:var(--accent); color:var(--accent-ink); border:none;
  padding:.85rem 1.8rem; border-radius:44px; font-weight:700; font-size:.95rem;
  cursor:pointer; display:inline-flex; align-items:center; gap:.5rem;
  box-shadow:0 0 30px color-mix(in srgb,var(--accent) 45%, transparent);
  transition:transform .2s;
}
.hero-btn:hover{ transform:translateY(-2px); }
.scroll-hint{
  margin-top:1.4rem; display:flex; flex-direction:column; align-items:center; gap:.3rem;
  font-size:.6rem; letter-spacing:.3em; text-transform:uppercase; color:var(--fg-dim);
  cursor:pointer;
}
.arr-down{ animation:bob 1.8s ease-in-out infinite; font-size:1rem; }
@keyframes bob{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }

/* ---- SEKCIE ---- */
.sec{ position:relative; padding:6rem 1.6rem; }
.wrap{ max-width:1100px; margin:0 auto; }
.center-wrap{ text-align:center; }
.big-head{
  font-size:clamp(2rem,5vw,3.6rem); font-weight:800; line-height:1.02;
  letter-spacing:-.03em; margin:0 0 1rem;
}
.big-head.center{ text-align:center; }
.big-head .serif-it{ font-size:1.08em; }
.sub-lead{
  max-width:560px; font-size:1rem; line-height:1.6; color:var(--fg-dim); margin:0 0 2.5rem;
}
.eyebrow,.cta-eyebrow{
  font-size:.65rem; letter-spacing:.4em; text-transform:uppercase;
  color:var(--fg-dim); text-align:center; margin:0 0 1rem;
}

/* O NÁS */
.sec-about .sub-lead{ max-width:680px; }
.about-quote{
  max-width:640px; margin:2rem 0 2.5rem; padding-left:1.2rem;
  border-left:3px solid var(--accent);
  font-family:'Instrument Serif',serif; font-style:italic;
  font-size:1.35rem; line-height:1.4; color:var(--fg);
}
.about-body{ display:flex; flex-direction:column; gap:1.1rem; max-width:720px; }
.about-body p{ margin:0; font-size:.95rem; line-height:1.75; color:var(--fg-dim); }
.about-body b{ color:var(--fg); font-weight:700; }

/* STRATÉGIA radar */
.sec-strategy{ text-align:center; }
.sec-strategy .big-head,.sec-strategy .sub-lead{ margin-left:auto; margin-right:auto; }
.pillars{ display:flex; justify-content:center; }
.pillar-ring{
  position:relative; width:min(560px,90vw); aspect-ratio:1;
  background:radial-gradient(circle, color-mix(in srgb,var(--accent) 16%, transparent) 0%, transparent 62%);
  border-radius:50%;
}
.radar{ width:100%; height:100%; }
.radar-c{ fill:none; stroke:color-mix(in srgb,var(--accent) 30%, transparent); stroke-dasharray:3 5; }
.radar-l{ stroke:color-mix(in srgb,var(--accent) 30%, transparent); stroke-width:1; }
.radar-node{ fill:none; stroke:var(--accent); stroke-width:2; }
.ring-center-label{
  position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  font-size:.95rem; line-height:1.3; color:var(--fg);
}
.pillar-label{
  position:absolute;
  font-size:.7rem; font-weight:600; color:var(--accent); white-space:nowrap;
  background:color-mix(in srgb,var(--bg) 88%, transparent);
  border:1px solid color-mix(in srgb,var(--accent) 32%, transparent);
  padding:.32rem .75rem; border-radius:30px; backdrop-filter:blur(4px);
  box-shadow:0 4px 18px rgba(0,0,0,.35);
}
.pillar-label i{ font-style:normal; font-size:.55rem; opacity:.7; margin-right:.35rem; vertical-align:super; }
/* kotvenie mimo kruhu — žiadne prekrytie s radarom */
.pl-top{   transform:translate(-50%,-150%); }
.pl-right{ transform:translate(10px,-50%); }
.pl-br{    transform:translate(4px,20%); }
.pl-bl{    transform:translate(calc(-100% - 4px),20%); }
.pl-left{  transform:translate(calc(-100% - 10px),-50%); }
@media (max-width:860px){
  .pillar-ring{ width:min(420px,80vw); }
}
@media (max-width:640px){
  .pillar-label{ display:none; } /* na mobile info nesú karty nižšie */
}

/* SLUŽBY light card */
.sec-services{ padding:3rem 1.6rem; }
.card-light{
  max-width:1100px; margin:0 auto; border-radius:26px;
  background:var(--card-light-bg); color:var(--card-light-fg);
  padding:3.5rem clamp(1.5rem,5vw,4rem);
  box-shadow:0 0 60px color-mix(in srgb,var(--accent) 18%, transparent);
}
.serv-head{
  text-align:center; font-size:clamp(1.8rem,4vw,2.8rem); font-weight:800;
  letter-spacing:-.03em; margin:0 0 2.5rem;
}
.serv-row{
  display:grid; grid-template-columns:50px 1fr 1.1fr; gap:1.5rem; align-items:start;
  padding:1.6rem 0; border-top:1px solid color-mix(in srgb,var(--card-light-fg) 16%, transparent);
}
.serv-row:last-child{ border-bottom:1px solid color-mix(in srgb,var(--card-light-fg) 16%, transparent); }
.serv-num{ font-size:.8rem; font-weight:600; color:var(--card-light-dim); padding-top:.35rem; }
.serv-title{ font-size:clamp(1.1rem,2.5vw,1.5rem); font-weight:700; letter-spacing:-.02em; }
.serv-desc{ font-size:.85rem; line-height:1.6; color:var(--card-light-dim); }
.serv-row:nth-child(4) .serv-title{ color:var(--accent); }

/* PRÍPADY */
.sec-cases{ background:var(--bg2); text-align:center; }
.sec-cases .car-meta{ text-align:left; }
.case-grid{
  display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.2rem; margin-top:2.5rem;
}
.case-card{
  border-radius:20px; padding:1.6rem; background:var(--bg);
  border:1px solid var(--line);
}
.case-card.highlight{ border-color:var(--accent); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 40%,transparent); }
.case-logo{ font-weight:800; font-size:1.1rem; margin-bottom:1rem; }
.case-logo span{ color:var(--accent); }
.case-desc{ font-size:.8rem; line-height:1.55; color:var(--fg-dim); margin:0 0 1.3rem; }
.case-stats{ display:grid; grid-template-columns:1fr 1fr; gap:1rem 1.2rem; margin-bottom:1.3rem; }
.case-stats b{ display:block; font-size:1.6rem; font-weight:800; letter-spacing:-.02em; }
.case-stats span{ font-size:.62rem; line-height:1.3; color:var(--fg-dim); }
.case-link{ background:none; border:none; color:var(--fg); font-weight:600; font-size:.85rem; cursor:pointer; padding:0; }
.case-link:hover{ color:var(--accent); }
.case-tile{
  border-radius:20px; position:relative; min-height:280px;
  display:flex; align-items:flex-end; padding:1.2rem; overflow:hidden;
}
.tile-name{ font-weight:600; font-size:.95rem; color:#0a0a0a; }

/* DÁTA */
.sec-data{ text-align:center; }
.sec-data .big-head,.sec-data .sub-lead{ margin-left:auto; margin-right:auto; }
.data-strip{
  display:grid; grid-template-columns:repeat(4,1fr); gap:1px; margin-top:3rem;
  background:var(--line); border:1px solid var(--line); border-radius:18px; overflow:hidden;
}
.data-cell{ background:var(--bg); padding:2.2rem 1rem; }
.data-cell b{ display:block; font-size:clamp(1.8rem,4vw,2.8rem); font-weight:800; color:var(--accent); letter-spacing:-.03em; }
.data-cell span{ font-size:.68rem; letter-spacing:.16em; text-transform:uppercase; color:var(--fg-dim); }

/* KLIENTI quote */
.sec-quote{ background:var(--bg2); }
.quote-logo{ font-weight:800; letter-spacing:.2em; font-size:.9rem; margin:2.5rem 0 1.5rem; }
.quote{
  max-width:760px; margin:0 auto 2rem; font-family:'Instrument Serif',serif;
  font-size:clamp(1.2rem,3vw,1.9rem); line-height:1.5; font-style:italic;
}
.quote-author{ display:inline-flex; align-items:center; gap:.8rem; }
.qa-avatar{
  width:46px; height:46px; border-radius:50%; background:var(--accent); color:var(--accent-ink);
  display:flex; align-items:center; justify-content:center; font-weight:800; font-size:.9rem;
}
.quote-author b{ display:block; font-size:.85rem; }
.quote-author span{ font-size:.72rem; color:var(--fg-dim); }
.quote-author > div{ text-align:left; }

/* CTA limetka */
.sec-cta{
  background:linear-gradient(135deg, var(--accent-2) 0%, var(--accent) 100%);
  color:var(--accent-ink); text-align:center; padding-top:5rem;
}
.orbit-badge{ position:relative; width:120px; height:120px; margin:0 auto 2.5rem; }
.badge-ring{ width:100%; height:100%; animation:spin 14s linear infinite; }
.badge-text{ fill:var(--accent-ink); font-size:9px; font-weight:700; letter-spacing:1px; }
@keyframes spin{ to{ transform:rotate(360deg); } }
.badge-core{
  position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  width:54px; height:54px; border-radius:50%; background:var(--accent-ink);
  display:flex; align-items:center; justify-content:center;
}
.globe{ width:30px; height:30px; fill:none; stroke:var(--accent); stroke-width:1.4; }
.cta-eyebrow{ color:color-mix(in srgb,var(--accent-ink) 60%, transparent); }
.cta-head{
  font-size:clamp(1.8rem,5vw,3.4rem); font-weight:800; letter-spacing:-.03em;
  max-width:760px; margin:0 auto 2rem; line-height:1.05;
}
.cta-btn{
  background:var(--accent-ink); color:var(--accent); border:none;
  padding:.95rem 2.4rem; border-radius:44px; font-weight:700; font-size:1rem; cursor:pointer;
  transition:transform .2s;
}
.cta-btn:hover{ transform:translateY(-2px); }

/* FOOTER */
.footer{ background:var(--bg); padding:4rem 1.6rem 2rem; border-top:1px solid var(--line); }
.foot-top{ max-width:1100px; margin:0 auto; display:flex; justify-content:space-between; gap:3rem; flex-wrap:wrap; }
.foot-brand{ max-width:360px; }
.foot-sign{ font-size:1.4rem; font-weight:700; line-height:1.3; margin:1.4rem 0 1.2rem; letter-spacing:-.02em; }
.foot-form{ display:flex; gap:.6rem; }
.foot-input{
  flex:1; background:transparent; border:1px solid var(--line); border-radius:8px;
  padding:.7rem .9rem; color:var(--fg); font-size:.85rem;
}
.foot-input::placeholder{ color:var(--fg-dim); }
.foot-submit{
  width:46px; border:1px solid var(--line); border-radius:8px; background:transparent;
  color:var(--fg); font-size:1.1rem; cursor:pointer; transition:all .2s;
}
.foot-submit:hover{ background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
.foot-cols{ display:flex; gap:3.5rem; }
.foot-col h4{ font-size:.7rem; letter-spacing:.2em; text-transform:uppercase; margin:0 0 1rem; }
.foot-col button{
  display:block; background:none; border:none; color:var(--fg-dim); cursor:pointer;
  font-size:.85rem; padding:.3rem 0; text-align:left; transition:color .2s;
}
.foot-col button:hover{ color:var(--accent); }
.foot-bottom{
  max-width:1100px; margin:3rem auto 0; padding-top:1.5rem; border-top:1px solid var(--line);
  display:flex; justify-content:space-between; font-size:.7rem; color:var(--fg-dim); flex-wrap:wrap; gap:.5rem;
}

/* ---- PLAGÁTY PRI OKRAJOCH (hero pozadie) ---- */
.edge-posters{ position:absolute; inset:0; z-index:1; pointer-events:none; overflow:hidden; }
.edge-poster{
  position:absolute; top:50%; transform:translateY(-50%);
  width:min(34vw,460px); aspect-ratio:16/9; border-radius:14px; overflow:hidden;
  opacity:.16; filter:saturate(1.1) contrast(1.05);
  transition:opacity 1.2s ease;
  -webkit-mask-image:linear-gradient(to right, transparent, #000 40%, #000 60%, transparent);
}
.edge-poster img{ width:100%; height:100%; object-fit:cover; display:block; }
.edge-left{ left:-9vw; -webkit-mask-image:linear-gradient(to right, transparent, #000 80%); mask-image:linear-gradient(to right, transparent, #000 80%); }
.edge-right{ right:-9vw; -webkit-mask-image:linear-gradient(to left, transparent, #000 80%); mask-image:linear-gradient(to left, transparent, #000 80%); }

/* ---- CAROUSEL plagátov ---- */
.center-lead{ margin-left:auto; margin-right:auto; text-align:center; }
.carousel{
  position:relative; margin-top:3rem;
  display:flex; align-items:center; justify-content:center; gap:1rem;
}
.car-stage{
  position:relative; width:min(820px,82vw); height:min(462px,46vw); min-height:280px;
  perspective:1400px;
}
.car-slide{
  position:absolute; top:0; left:50%; width:78%; aspect-ratio:16/9;
  border-radius:16px; overflow:hidden; transform:translateX(-50%);
  transition:all .6s cubic-bezier(.4,0,.2,1); opacity:0;
  border:1px solid var(--line);
  box-shadow:0 20px 60px rgba(0,0,0,.6);
}
.car-slide img{ width:100%; height:100%; object-fit:cover; display:block; }
.car-slide.active{
  opacity:1; transform:translateX(-50%) scale(1); z-index:3;
  box-shadow:0 24px 70px color-mix(in srgb,var(--accent-2) 35%, transparent), 0 0 0 1px color-mix(in srgb,var(--accent) 40%, transparent);
}
.car-slide.next{ opacity:.4; transform:translateX(-12%) scale(.82) rotateY(-14deg); z-index:2; }
.car-slide.prev{ opacity:.4; transform:translateX(-88%) scale(.82) rotateY(14deg); z-index:2; }
.car-slide.hidden{ opacity:0; transform:translateX(-50%) scale(.7); z-index:1; }
.car-meta{
  position:absolute; left:0; right:0; bottom:0; padding:1.4rem 1.4rem 1.1rem;
  background:linear-gradient(to top, rgba(10,5,3,.92) 0%, rgba(10,5,3,.5) 60%, transparent 100%);
  text-align:left;
}
.car-date{ font-size:.66rem; letter-spacing:.24em; text-transform:uppercase; color:var(--accent); font-weight:700; }
.car-title{ font-size:1.25rem; font-weight:800; margin:.25rem 0 .15rem; color:#fff; letter-spacing:-.02em; }
.car-venue{ font-size:.78rem; color:rgba(255,235,220,.7); }
.car-arrow{
  width:48px; height:48px; flex-shrink:0; border-radius:50%; z-index:5;
  border:1px solid var(--line); background:color-mix(in srgb,var(--bg2) 70%, transparent);
  color:var(--fg); font-size:1.6rem; line-height:1; cursor:pointer;
  display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px);
  transition:all .2s;
}
.car-arrow:hover{ border-color:var(--accent); color:var(--accent); box-shadow:0 0 18px color-mix(in srgb,var(--accent) 35%, transparent); }
.car-dots{ display:flex; justify-content:center; gap:.6rem; margin-top:1.6rem; }
.car-dot{
  width:9px; height:9px; border-radius:50%; padding:0; cursor:pointer;
  border:1px solid var(--accent); background:transparent; transition:all .25s;
}
.car-dot.on{ background:var(--accent); box-shadow:0 0 10px color-mix(in srgb,var(--accent) 60%, transparent); transform:scale(1.25); }

/* ---- KLIENTI logá ---- */
.sec-clients{ text-align:center; }
.sec-clients .big-head{ margin-left:auto; margin-right:auto; }
.client-grid{
  display:grid; grid-template-columns:repeat(4,1fr); gap:1px; margin-top:3rem;
  background:var(--line); border:1px solid var(--line); border-radius:18px; overflow:hidden;
}
.client-logo{
  background:var(--bg); padding:1.8rem 1rem; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:.55rem; min-height:120px;
  transition:background .3s;
}
.client-logo:hover{ background:var(--bg2); }
.cl-rune-img{ height:28px; width:auto; display:block; opacity:.92;
  filter:drop-shadow(0 0 8px color-mix(in srgb,var(--accent) 50%, transparent)); }
.cl-name{ font-size:.72rem; font-weight:700; letter-spacing:.14em; color:var(--fg-dim); }
.client-logo:hover .cl-name{ color:var(--fg); }

/* ---- RESPONSÍVNE ---- */
@media (max-width:860px){
  .nav-links{ display:none; }
  .client-grid{ grid-template-columns:1fr 1fr; }
  .car-slide.next,.car-slide.prev{ opacity:0; }
  .car-slide.active{ width:92%; }
  .edge-poster{ display:none; }
  .case-grid{ grid-template-columns:1fr; }
  .data-strip{ grid-template-columns:1fr 1fr; }
  .serv-row{ grid-template-columns:40px 1fr; }
  .serv-desc{ grid-column:2; }
  .foot-top{ flex-direction:column; }
}
@media (max-width:560px){
  .orbit-node{ width:108px; height:108px; }
  .node-icon{ width:26px; height:26px; }
  .node-label{ font-size:.55rem; }
  .center-mark{ font-size:2.2rem; }
  .data-strip{ grid-template-columns:1fr 1fr; }
}

@media (prefers-reduced-motion:reduce){
  .badge-ring,.arr-down{ animation:none; }
  *{ scroll-behavior:auto !important; }
}
/* ── scroll reveal ── */
.rv,.rv-l,.rv-r,.rv-scale,.rv-s{opacity:0;transition:opacity .7s ease,transform .7s ease;}
.rv{transform:translateY(28px);}
.rv-l{transform:translateX(-36px);}
.rv-r{transform:translateX(36px);}
.rv-scale{transform:scale(.88);}
.rv-s{transform:translateY(16px);}
.rv.in-view,.rv-l.in-view,.rv-r.in-view,.rv-scale.in-view,.rv-s.in-view{opacity:1;transform:none;}

/* ── service tags ── */
.serv-body{display:flex;flex-direction:column;gap:.35rem;flex:1;}
.serv-tags{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.2rem;}
.stag{
  font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;
  padding:.22rem .55rem;border-radius:20px;
  border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);
  color:color-mix(in srgb,var(--accent) 70%,transparent);
  transition:border-color .25s,color .25s;
}
.serv-row:hover .stag{border-color:var(--accent);color:var(--accent);}

/* ── pillar cards ── */
.pillar-cards{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.2rem;
  margin-top:3rem;
}
.pillar-card{
  background:color-mix(in srgb,var(--bg2) 90%,transparent);
  border:1px solid color-mix(in srgb,var(--accent) 18%,transparent);
  border-radius:14px;padding:1.4rem 1.2rem;
  transition:border-color .3s,box-shadow .3s,transform .25s;
}
.pillar-card:hover{
  border-color:color-mix(in srgb,var(--accent) 55%,transparent);
  box-shadow:0 8px 32px color-mix(in srgb,var(--accent) 12%,transparent);
  transform:translateY(-3px);
}
.pc-num{font-size:.6rem;letter-spacing:.25em;color:var(--accent);opacity:.7;display:block;margin-bottom:.5rem;}
.pc-title{font-size:.95rem;font-weight:700;margin:0 0 .5rem;}
.pc-desc{font-size:.78rem;color:var(--fg-dim);line-height:1.55;margin:0;}

/* ── data section expanded ── */
.data-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;margin-top:2rem;}
.data-cell{
  background:color-mix(in srgb,var(--bg2) 85%,transparent);
  border:1px solid color-mix(in srgb,var(--accent) 15%,transparent);
  border-radius:14px;padding:1.5rem 1rem;text-align:center;
  transition:border-color .3s,box-shadow .3s,transform .25s;
}
.data-cell:hover{
  border-color:color-mix(in srgb,var(--accent) 50%,transparent);
  box-shadow:0 0 28px color-mix(in srgb,var(--accent) 14%,transparent);
  transform:translateY(-3px);
}
.data-cell b{display:block;font-size:2.4rem;font-weight:900;color:var(--accent);letter-spacing:-.02em;line-height:1;}
.data-cell span{font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-dim);margin-top:.3rem;display:block;}

/* ── process steps ── */
.process-steps{margin:4.5rem auto 0;max-width:840px;text-align:left;}
.proc-head{font-size:clamp(1.3rem,2.5vw,1.8rem);font-weight:700;margin:0 0 2rem;letter-spacing:-.02em;text-align:center;}
.proc-step{
  display:flex;align-items:flex-start;gap:1.2rem;padding:1.4rem;
  border-left:2px solid color-mix(in srgb,var(--accent) 20%,transparent);
  margin-bottom:1rem;position:relative;
  transition:border-color .3s;
}
.proc-step:hover{border-color:var(--accent);}
.proc-num{
  min-width:44px;height:44px;border-radius:50%;
  background:color-mix(in srgb,var(--accent) 15%,transparent);
  border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);
  display:flex;align-items:center;justify-content:center;
  font-size:.6rem;font-weight:700;letter-spacing:.1em;color:var(--accent);
}
.proc-body h4{font-size:.95rem;font-weight:700;margin:0 0 .3rem;}
.proc-body p{font-size:.8rem;color:var(--fg-dim);margin:0;line-height:1.55;}
.proc-arrow{ display:none; }

/* ── testimonials grid ── */
.testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.6rem;margin-top:2.5rem;}
.testi-card{
  background:color-mix(in srgb,var(--bg2) 90%,transparent);
  border:1px solid color-mix(in srgb,var(--accent) 18%,transparent);
  border-radius:18px;padding:1.8rem 1.6rem;
  transition:border-color .3s,box-shadow .3s,transform .25s;
}
.testi-card:hover{
  border-color:color-mix(in srgb,var(--accent) 50%,transparent);
  box-shadow:0 12px 40px color-mix(in srgb,var(--accent) 12%,transparent);
  transform:translateY(-4px);
}
.testi-stars{font-size:1rem;letter-spacing:.1em;color:var(--accent);margin-bottom:.7rem;}
.quote-logo.small{font-size:.5rem;margin-bottom:.8rem;}
.testi-card .quote{font-size:.82rem;line-height:1.6;margin:0 0 1.2rem;color:var(--fg-dim);font-style:italic;}
.testi-card .quote::before{content:'"';color:var(--accent);font-size:1.4rem;vertical-align:-.2em;margin-right:.15em;}
.testi-card .quote::after{content:'"';color:var(--accent);font-size:1.4rem;vertical-align:-.2em;margin-left:.15em;}

/* ── CTA form ── */
.cta-sub{font-size:.88rem;color:color-mix(in srgb,var(--accent-ink) 78%, transparent);margin:.5rem 0 2rem;letter-spacing:.02em;font-weight:600;}
.cta-form{width:100%;max-width:520px;margin:0 auto;}
.cta-fields{display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.2rem;}
.cta-input{
  width:100%;padding:.85rem 1.1rem;border-radius:10px;font-size:.88rem;
  background:color-mix(in srgb,var(--bg2) 90%,transparent);
  border:1px solid color-mix(in srgb,var(--accent) 22%,transparent);
  color:var(--fg);outline:none;transition:border-color .25s,box-shadow .25s;
  box-sizing:border-box;
}
.cta-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent);}
.cta-select{appearance:none;cursor:pointer;}
.cta-trust{
  display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;
  font-size:.65rem;letter-spacing:.08em;font-weight:600;
  color:color-mix(in srgb,var(--accent-ink) 72%, transparent);margin-top:1.2rem;
}
.cta-email{ margin-top:1.4rem; font-size:.9rem; }
.cta-email a{ color:var(--accent-ink); font-weight:700; text-decoration:none; letter-spacing:.02em; }
.cta-email a:hover{ text-decoration:underline; }

/* ── animated gradient heading shimmer (hero title) ── */
@keyframes titleShimmer{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}
.hero-title{
  background:linear-gradient(135deg,var(--fg) 0%,var(--accent) 45%,var(--fg) 80%);
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:titleShimmer 5s ease infinite;
}

/* ── radar sweep animation ── */
@keyframes radarPulse{0%,100%{opacity:.3;}50%{opacity:1;}}
.radar-node{animation:radarPulse 2.4s ease-in-out infinite;}
.radar-node:nth-child(1){animation-delay:0s;}
.radar-node:nth-child(2){animation-delay:.48s;}
.radar-node:nth-child(3){animation-delay:.96s;}
.radar-node:nth-child(4){animation-delay:1.44s;}
.radar-node:nth-child(5){animation-delay:1.92s;}

/* ── float for orbit badge ── */
@keyframes floatBadge{0%,100%{transform:translateY(0)rotate(0deg);}50%{transform:translateY(-10px)rotate(3deg);}}
.orbit-badge{animation:floatBadge 5s ease-in-out infinite;}

/* ── section eyebrow shimmer line ── */
.eyebrow{
  position:relative;display:inline-block;
}
.eyebrow::after{
  content:"";position:absolute;bottom:-4px;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--accent),transparent);
  background-size:200% 100%;
  animation:shimmerLine 2.5s linear infinite;
}
@keyframes shimmerLine{from{background-position:-200% 0}to{background-position:200% 0}}

@media(max-width:640px){
  .pillar-cards{grid-template-columns:1fr;}
  .testimonials{grid-template-columns:1fr;}
  .proc-arrow{display:none;}
  .data-strip{grid-template-columns:repeat(2,1fr);}
  .cta-trust{gap:.8rem;}
}

/* ── visual section ── */
.sec-visual{ padding:6rem 1.6rem; }
.vis-wrap{
  display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center;
}
.vis-text{ display:flex; flex-direction:column; gap:1.2rem; }
.vis-list{
  list-style:none; padding:0; margin:.5rem 0 0; display:flex; flex-direction:column; gap:.6rem;
}
.vis-list li{
  font-size:.82rem; color:var(--fg-dim); padding-left:1.2rem; position:relative;
  line-height:1.5;
}
.vis-list li::before{
  content:"◆"; position:absolute; left:0; top:.15em; color:var(--accent); font-size:.55rem;
}
.vis-img{ position:relative; }
.vis-photo{
  width:100%; border-radius:20px; display:block;
  box-shadow:0 24px 80px rgba(0,0,0,.5), 0 0 0 1px color-mix(in srgb,var(--accent) 20%,transparent);
  transition:transform .4s ease, box-shadow .4s ease;
}
.vis-photo:hover{ transform:scale(1.02); box-shadow:0 32px 100px rgba(0,0,0,.6), 0 0 40px color-mix(in srgb,var(--accent) 18%,transparent); }
.vis-badge{
  position:absolute; bottom:1.5rem; left:-1.5rem;
  background:var(--accent); color:#1a0900;
  border-radius:14px; padding:.8rem 1.2rem;
  display:flex; flex-direction:column; align-items:center;
  box-shadow:0 8px 32px rgba(0,0,0,.4);
  animation:floatBadge 4s ease-in-out infinite;
}
.vis-badge-num{ font-size:1.6rem; font-weight:900; line-height:1; }
.vis-badge-lbl{ font-size:.55rem; letter-spacing:.12em; text-transform:uppercase; opacity:.8; }

/* ── showcase section ── */
.sec-showcase{ padding:5rem 1.6rem; }
.showcase-wrap{ display:flex; flex-direction:column; align-items:center; gap:2.5rem; }
.showcase-img{ position:relative; width:100%; max-width:760px; margin:0 auto; }
.laptop-photo{
  width:100%; border-radius:16px; display:block;
  box-shadow:0 32px 100px rgba(0,0,0,.6), 0 0 60px color-mix(in srgb,var(--accent) 14%,transparent);
  transition:transform .5s ease;
}
.laptop-photo:hover{ transform:scale(1.015); }
.showcase-chips{
  display:flex; justify-content:center; gap:.8rem; flex-wrap:wrap; margin-top:1.4rem;
}
.schip{
  font-size:.65rem; letter-spacing:.14em; text-transform:uppercase;
  padding:.4rem 1rem; border-radius:20px;
  border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);
  color:var(--accent);
  background:color-mix(in srgb,var(--accent) 8%,transparent);
  transition:background .25s, border-color .25s;
}
.schip:hover{ background:color-mix(in srgb,var(--accent) 18%,transparent); border-color:var(--accent); }

@media(max-width:760px){
  .vis-wrap{ grid-template-columns:1fr; gap:2.5rem; }
  .vis-badge{ left:.5rem; bottom:.5rem; }
}

/* ════════════════════════════════════════════════════════════
   HERO RESPONZIVNOST — text sa neprekryva s orbitalnym menu.
   Na mensich / nizsich displejoch sa hero prepne z prekrytia na
   vertikalne usporiadanie: menu hore, text pod nim (ziadny prekryv).
   ════════════════════════════════════════════════════════════ */
@media (max-width:900px), (max-height:760px){
  .hero{ padding-top:4.8rem; }
  .hero .fo-scene{ width:min(520px,88vw,52vh); height:min(520px,88vw,52vh); }
}

@media (max-width:560px){
  .hero .fo-scene{ width:min(440px,90vw,48vh); height:min(440px,90vw,48vh); }
  .hero-title{ font-size:clamp(1.9rem,9vw,2.8rem); }
  .hero-lead{ font-size:.88rem; }
}

/* ---- mobilné menu (hamburger) + doladenie okrajov ---- */
.nav-burger{ display:none; background:none; border:1px solid var(--line); color:var(--fg);
  width:40px; height:40px; border-radius:10px; font-size:1.15rem; cursor:pointer;
  align-items:center; justify-content:center; }
.nav-burger:hover{ border-color:var(--accent); color:var(--accent); }
.nav-mobile{ position:absolute; top:100%; left:0; right:0; z-index:60; background:var(--bg2);
  border-top:1px solid var(--line); border-bottom:1px solid var(--line);
  display:flex; flex-direction:column; padding:.4rem 1.6rem .9rem; box-shadow:0 24px 50px rgba(0,0,0,.5); }
.nav-mobile button{ background:none; border:0; border-bottom:1px solid color-mix(in srgb,var(--line) 70%, transparent);
  color:var(--fg); text-align:left; padding:.85rem .2rem; font-size:1rem; letter-spacing:.02em; cursor:pointer; }
.nav-mobile button:last-child{ border-bottom:0; }
.nav-mobile button:hover{ color:var(--accent); }
@media (max-width:860px){ .nav-burger{ display:inline-flex; } }
@media (max-width:560px){ .nav-cta{ display:none; } }
@media (max-width:760px){ .sec-visual, .sec-showcase{ padding-left:1.4rem; padding-right:1.4rem; } }

/* ── O nás: zakladateľ ── */
.about-grid{ display:grid; grid-template-columns:minmax(0,1fr) 360px; gap:2.6rem; align-items:start; }
.founder-card{
  margin:0; position:sticky; top:96px; border-radius:20px; overflow:hidden;
  border:1px solid var(--line); background:var(--bg2);
  box-shadow:0 24px 60px rgba(0,0,0,.5), 0 0 46px color-mix(in srgb,var(--accent) 9%, transparent);
  transition:transform .35s ease, box-shadow .35s ease;
}
.founder-card:hover{
  transform:translateY(-5px);
  box-shadow:0 32px 70px rgba(0,0,0,.55), 0 0 60px color-mix(in srgb,var(--accent) 18%, transparent);
}
.founder-card img{ width:100%; display:block; }
.founder-card figcaption{ padding:.95rem 1.15rem 1.05rem; display:flex; flex-direction:column; gap:.18rem; }
.founder-card b{ font-size:1rem; letter-spacing:-.01em; }
.founder-card span{ font-size:.68rem; letter-spacing:.16em; text-transform:uppercase; color:var(--fg-dim); }
@media (max-width:900px){
  .about-grid{ grid-template-columns:1fr; }
  .founder-card{ position:static; max-width:440px; }
}

`;
