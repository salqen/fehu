import { useState, useEffect, useRef, useCallback } from "react";
import { POSTERS, LOGO_EMBLEM, LOGO_FULL, MENU, NAV_LEFT, NAV_RIGHT, FehuOrbital, CSS } from "./shared.jsx";
import { CookieConsent, LegalModal, LEGAL_CSS } from "./legal.jsx";

/* ============================================================
   FEHU — VERZIA 2 · komponenty z COMPONENT SITE
   • Hero s orbitálnymi kruhmi (bez spotlight komponentu)
   • Cursor Trail · Scroll Progress · Magnetic Button
   • Split-Text Reveal (nadpisy sa odhaľujú po slovách)
   • Parallax bloby naprieč sekciami
   • Interaktívny radar 5 pilierov · Card 3D Tilt
   • Flip Cards (Projekty) · Coverflow 3D (Eventy)
   • Animated Tabs (Médiá) · Accordion (Broadcast)
   • Timeline so scroll-progresom (Ako pracujeme)
   • Footer-mega (reveal, hover-slide, giant logo, scroll-top)
   ============================================================ */

/* ---- Cursor Trail (component site: cursor-trail, preset „Brand") ---- */
function CursorTrail() {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(pointer:coarse)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let parts = [], raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const onMove = (e) => {
      parts.push({
        x: e.clientX + (Math.random() - .5) * 6,
        y: e.clientY + (Math.random() - .5) * 6,
        vx: (Math.random() - .5) * .7,
        vy: (Math.random() - .5) * .7 - .35,
        size: Math.random() * 1.8 + .9,
        hue: 26 + Math.random() * 18,
      });
      if (parts.length > 50) parts.splice(0, parts.length - 50);
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        ctx.fillStyle = `hsla(${p.hue},95%,${48 + Math.random() * 16}%,${Math.min(1, p.size / 3) * .22})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        p.x += p.vx; p.y += p.vy; p.size -= .09;
        if (p.size <= 0) parts.splice(i, 1);
      }
      raf = requestAnimationFrame(draw);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="mv-trail" aria-hidden="true" />;
}

/* ---- Scroll Progress (component site: scroll-progress) ---- */
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="mv-progress" ref={ref} aria-hidden="true" />;
}

/* ---- Plávajúci Scroll-Top s kruhovým progresom ---- */
function ScrollTopFab({ onClick }) {
  const [show, setShow] = useState(false);
  const circleRef = useRef(null);
  const C = 2 * Math.PI * 21;
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      setShow(h.scrollTop > 40);
      if (circleRef.current) circleRef.current.style.strokeDashoffset = `${C * (1 - p)}`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [C]);
  return (
    <button className={`stf ${show ? "on" : ""}`} onClick={onClick} aria-label="Späť hore" title="Späť hore">
      <svg viewBox="0 0 48 48" className="stf-ring" aria-hidden="true">
        <circle cx="24" cy="24" r="21" className="stf-track" />
        <circle cx="24" cy="24" r="21" className="stf-bar" ref={circleRef}
          style={{ strokeDasharray: C, strokeDashoffset: C }} />
      </svg>
      <span className="stf-arrow">↑</span>
    </button>
  );
}

/* ---- Magnetic Button (component site: magnetic-button) ---- */
function Magnetic({ children, strength = 16, className = "" }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${(dx / r.width) * strength}px, ${(dy / r.height) * strength}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return (
    <span ref={ref} className={`mv-magnet ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </span>
  );
}

/* ---- Card 3D Tilt (component site: card-3d-tilt) ---- */
function Tilt({ children, className = "", style, max = 10, scale = 1.03 }) {
  const ref = useRef(null);
  const glare = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    const rx = (py - .5) * -2 * max, ry = (px - .5) * 2 * max;
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
    if (glare.current) glare.current.style.background =
      `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(242,214,126,.20), transparent 55%)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale(1)";
    if (glare.current) glare.current.style.background = "none";
  };
  return (
    <div ref={ref} className={`mv-tilt ${className}`} style={style}
      onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
      <div className="mv-tilt__glare" ref={glare} aria-hidden="true" />
    </div>
  );
}

/* ---- Split-Text Reveal (component site: split-text-reveal) ---- */
function SplitHead({ segments, className = "big-head" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { el.classList.add("st-in"); io.disconnect(); }
    }), { threshold: .3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  let idx = 0;
  return (
    <h2 className={`${className} st-head`} ref={ref}>
      {segments.map((s, si) =>
        s.br
          ? <br key={si} />
          : s.t.split(" ").filter(Boolean).map((w, wi) => (
              <span className={`st-w ${/^[.,!?;:]+$/.test(w) ? "st-p" : ""}`} key={`${si}-${wi}`}>
                <span className={`st-wi ${s.serif ? "serif-it" : ""}`}
                  style={{ transitionDelay: `${(idx++) * 55}ms` }}>{w}</span>
              </span>
            ))
      )}
    </h2>
  );
}

/* ---- Parallax (component site: parallax-layers) ---- */
function useParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const vh = window.innerHeight;
        document.querySelectorAll("[data-plx]").forEach(el => {
          const speed = parseFloat(el.dataset.plx || "0.1");
          const r = el.getBoundingClientRect();
          const mid = r.top + r.height / 2 - vh / 2;
          el.style.setProperty("--plx", `${(-mid * speed).toFixed(1)}px`);
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
const Blob = ({ style, speed = "0.12" }) => (
  <div className="plx-blob" data-plx={speed} style={style} aria-hidden="true" />
);

/* ---- Interaktívny radar 5 pilierov ----
   lit = vrcholy, ktoré už zapálila ohnivá čiara v timeline vľavo ---- */
function InteractiveRadar({ items, active, setActive, lit }) {
  const locked = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      if (!locked.current) setActive(a => (a + 1) % items.length);
    }, 2600);
    return () => clearInterval(t);
  }, [items.length, setActive]);
  const isLit = i => lit?.has(i);

  return (
    <div className="pillars">
      <div className="pillar-ring ir-ring"
        onPointerEnter={() => { locked.current = true; }}
        onPointerLeave={() => { locked.current = false; }}>
        <svg viewBox="0 0 400 400" className="radar">
          <circle cx="200" cy="200" r="160" className="radar-c"/>
          <circle cx="200" cy="200" r="110" className="radar-c"/>
          <circle cx="200" cy="200" r="60" className="radar-c"/>
          {/* pentagon — dva obvody cez 5 pilierov (bez vnútornej hviezdy) */}
          {[160, 110].map((r, ri) => (
            <polygon key={`pg${ri}`} className="radar-pent"
              points={items.map((_, i) => {
                const a = (-90 + i * (360 / items.length)) * Math.PI / 180;
                return `${200 + Math.cos(a) * r},${200 + Math.sin(a) * r}`;
              }).join(" ")} />
          ))}
          {items.map((_, i) => {
            const a = (-90 + i * 72) * Math.PI / 180;
            return <line key={i} x1="200" y1="200"
              x2={200 + Math.cos(a) * 160} y2={200 + Math.sin(a) * 160}
              className={`radar-l ${active === i ? "on" : ""} ${isLit(i) ? "lit" : ""}`}/>;
          })}
          {items.map((_, i) => {
            const a = (-90 + i * 72) * Math.PI / 180;
            const cx = 200 + Math.cos(a) * 160, cy = 200 + Math.sin(a) * 160;
            return (
              <g key={i} className="ir-node-g" style={{ cursor: "pointer" }}
                onPointerEnter={() => setActive(i)} onClick={() => setActive(i)}>
                <circle cx={cx} cy={cy} r="26" fill="transparent" />
                {/* ohnivá aura po zapálení čiarou */}
                {isLit(i) && <circle cx={cx} cy={cy} r="17" className="radar-ember" />}
                <circle cx={cx} cy={cy} r={active === i ? 13 : 9}
                  className={`radar-node ${active === i ? "on" : ""} ${isLit(i) ? "lit" : ""}`}/>
              </g>
            );
          })}
        </svg>
        <div className="ring-center-label ir-center" key={active}>
          <i className="ir-num">{items[active].n}</i>
          {items[active].t}
        </div>
        {items.map((p, i) => {
          const a = (-90 + i * 72) * Math.PI / 180;
          const x = 50 + Math.cos(a) * 46, y = 50 + Math.sin(a) * 46;
          const anchor = ["pl-top", "pl-right", "pl-br", "pl-bl", "pl-left"][i];
          return (
            <button key={i} className={`pillar-label ${anchor} ${active === i ? "on" : ""}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onPointerEnter={() => setActive(i)} onClick={() => setActive(i)}>
              <i>{p.n}</i>{p.t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Coverflow 3D slider (component site: slider-3-coverflow) ---- */
function Coverflow({ items }) {
  const [active, setActive] = useState(0);
  const timer = useRef(null);
  const total = items.length;
  const restart = useCallback(() => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setActive(a => (a + 1) % total), 4000);
  }, [total]);
  useEffect(() => { restart(); return () => clearInterval(timer.current); }, [restart]);
  const go = (n) => { setActive((n + total) % total); restart(); };

  return (
    <div className="cf-outer">
      <div className="cf-stage">
        {items.map((p, n) => {
          let off = n - active;
          if (off > total / 2) off -= total;
          if (off < -total / 2) off += total;
          const abs = Math.abs(off);
          const style = {
            transform: `translateX(${off * 52}%) rotateY(${off * -35}deg) scale(${off === 0 ? 1 : .82 - abs * .05})`,
            zIndex: 100 - abs,
            opacity: abs > 2 ? 0 : 1 - abs * .14,
            filter: off === 0 ? "none" : "brightness(.45)",
          };
          return (
            <div key={n} className="cf-card" style={style} onClick={() => go(n)}>
              <img src={p.src} alt={p.title} />
              <div className="cf-meta">
                <span className="cf-date">{p.date}</span>
                <h3 className="cf-title">{p.title}</h3>
                <span className="cf-venue">{p.venue}</span>
              </div>
            </div>
          );
        })}
        <Magnetic strength={10}><button className="cf-arrow" onClick={() => go(active - 1)} aria-label="Predošlý">‹</button></Magnetic>
        <Magnetic strength={10} className="mv-magnet-right"><button className="cf-arrow" onClick={() => go(active + 1)} aria-label="Ďalší">›</button></Magnetic>
      </div>
      <div className="car-dots">
        {items.map((_, i) => (
          <button key={i} className={`car-dot ${i === active ? "on" : ""}`} onClick={() => go(i)} aria-label={`Plagát ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

/* ---- Flip Cards — Projekty (component site: flip-card) ---- */
function FlipCard({ p, delay }) {
  const [logoOk, setLogoOk] = useState(Boolean(p.logo));
  return (
    <div className="flip rv-scale" style={{ transitionDelay: `${delay}ms` }}>
      <div className="flip-inner">
        <div className="flip-front">
          {p.bg && <span className="flip-bg" aria-hidden="true"
            style={{ backgroundImage: `url(${p.bg})` }} />}
          {logoOk ? (
            <img className="flip-logo" src={p.logo} alt={`${p.t} logo`}
              loading="lazy" decoding="async" onError={() => setLogoOk(false)} />
          ) : (
            <img className="flip-emblem" src={LOGO_EMBLEM} alt="" aria-hidden="true" />
          )}
          <h3>{p.t}</h3>
          <span className="flip-cat">{p.cat}</span>
          <span className="flip-hint">viac →</span>
        </div>
        <div className="flip-back">
          <h3>{p.t}</h3>
          <p>{p.d}</p>
          {p.url && <a href={p.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>{p.url.replace("https://", "")} →</a>}
        </div>
      </div>
    </div>
  );
}

/* ---- Animated Tabs (component site: animated-tabs) ---- */
function MediaTabs({ items }) {
  const [active, setActive] = useState(0);
  const barRef = useRef(null);
  const [ind, setInd] = useState({ x: 0, w: 0 });
  useEffect(() => {
    const measure = () => {
      const btn = barRef.current?.querySelectorAll(".mv-tab")[active];
      if (btn) setInd({ x: btn.offsetLeft, w: btn.offsetWidth });
    };
    measure();
    const t = setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
  }, [active]);
  const it = items[active];
  return (
    <div className="mv-tabs">
      <div className="mv-tabs__bar" ref={barRef} role="tablist">
        <span className="mv-tabs__indicator" style={{ width: ind.w, transform: `translateX(${ind.x}px)` }} />
        {items.map((t, i) => (
          <button key={i} role="tab" aria-selected={i === active}
            className={`mv-tab ${i === active ? "is-active" : ""}`}
            onClick={() => setActive(i)}>
            {t.tab}
          </button>
        ))}
      </div>
      <div className="mv-panel" key={active}>
        <h3 className="mv-panel-title"><span className="mv-panel-num">{it.n}</span>{it.t}</h3>
        <p className="mv-panel-desc">{it.d}</p>
        <div className="mv-tags">{it.tags.map(tag => <span className="mv-tag" key={tag}>{tag}</span>)}</div>
      </div>
    </div>
  );
}

/* ---- Accordion (component site: accordion-faq) ---- */
function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  const bodies = useRef([]);
  const toggle = (i) => setOpen(o => (o === i ? -1 : i));
  return (
    <div className="mv-acc">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`acc-item ${isOpen ? "is-open" : ""}`}>
            <div className="acc-head" role="button" tabIndex={0} aria-expanded={isOpen}
              onClick={() => toggle(i)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(i); } }}>
              <span><span className="acc-num">{it.n}</span>{it.t}</span>
            </div>
            <div className="acc-body" ref={el => bodies.current[i] = el}
              style={{ maxHeight: isOpen ? `${bodies.current[i]?.scrollHeight ?? 400}px` : "0px" }}>
              <p>{it.d}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Plamienok na bode timeline (štýl fo-fire) ----
   Pred prerolovaním tlie iba minimálna iskra (IDLE), po zasvietení
   sa plynulo rozhorí do plného ohnivého efektu. ---- */
const FLAME_IDLE = 0.14;   // minimálna viditeľnosť pred zasvietením
const FLAME_RAMP = 0.035;  // rýchlosť rozhorenia

function FlameDot({ active, size = 72 }) {
  const ref = useRef(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let parts = [], raf, spark = 0;
    let heat = FLAME_IDLE; // 0..1 — aktuálna intenzita plameňa
    const C = size / 2;
    function loop() {
      ctx.clearRect(0, 0, size, size);
      // plynulý nábeh z tlejúceho stavu do plného ohňa
      const target = activeRef.current ? 1 : FLAME_IDLE;
      heat += (target - heat) * FLAME_RAMP;

      // počet iskier rastie s intenzitou; v pokoji len občasná iskra
      spark += heat * 2.2;
      while (spark >= 1) {
        spark -= 1;
        const a = Math.random() * Math.PI * 2;
        parts.push({
          x: C + Math.cos(a) * 9, y: C + Math.sin(a) * 9,
          vx: Math.cos(a) * .18 + (Math.random() - .5) * .15,
          vy: Math.sin(a) * .18 - (.3 + Math.random() * .5) * (.55 + heat * .45),
          life: 1, decay: .03 + Math.random() * .035,
          size: (.9 + Math.random() * 1.8) * (.6 + heat * .4),
        });
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vx += (Math.random() - .5) * .1;
        p.life -= p.decay; p.size *= .975;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        const al = p.life * p.life * heat;
        const g = Math.min(220, Math.floor(120 + p.life * 110));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${g},20,${al * .08})`; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${g},30,${al * .8})`; ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(raf);
  }, [size]);
  return <canvas ref={ref} width={size} height={size} />;
}

/* ---- Rozkliknuteľný text (prvý odstavec vidno, zvyšok sa rozbalí) ---- */
function ReadMore({ children, className = "", style, more = "Čítať viac", less = "Zbaliť" }) {
  const [open, setOpen] = useState(false);
  const innerRef = useRef(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setH(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);
  return (
    <div className={`rm ${className}`} style={style}>
      <div className="rm-body" style={{ maxHeight: open ? h : 0 }} aria-hidden={!open}>
        <div ref={innerRef} className="rm-inner">{children}</div>
      </div>
      <button type="button" className={`rm-btn ${open ? "is-open" : ""}`}
        onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {open ? less : more}<span className="rm-chev" aria-hidden="true">↓</span>
      </button>
    </div>
  );
}

/* ---- Timeline (component site: timeline) ----
   Gulička sa zapáli presne vo chvíli, keď k nej dorastie ohnivá čiara.
   Cez onLit sa tá istá udalosť prenáša aj na pentagon.
   Pozor: obe triedy (is-visible aj is-lit) drží React v stave —
   pridávať ich imperatívne cez classList sa nesmie, prekreslenie ich zmaže. ---- */
function Timeline({ items, fire = false, onItemEnter, onLit }) {
  const ref = useRef(null);
  const fillRef = useRef(null);
  const [seen, setSeen] = useState(() => new Set());
  const [lit, setLit] = useState(() => new Set());
  const litRef = useRef(lit);
  const onLitRef = useRef(onLit);
  useEffect(() => { onLitRef.current = onLit; }, [onLit]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* reveal (opacity/posun) zostáva naviazaný na viditeľnosť */
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        const idx = Number(e.target.dataset.idx);
        setSeen(p => (p.has(idx) ? p : new Set(p).add(idx)));
        io.unobserve(e.target);
      }
    }), { threshold: .3 });
    const nodes = Array.from(el.querySelectorAll(".tl-item"));
    nodes.forEach(n => io.observe(n));

    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * .7 - r.top) / r.height));
        if (fillRef.current) fillRef.current.style.height = `${p * 100}%`;

        /* dokiaľ čiara siaha v pixeloch od vrchu timeline */
        const fillPx = p * el.offsetHeight;
        const add = [];
        nodes.forEach((n, i) => {
          /* stred guličky: .tl-item::before má top .25rem a výšku 14px */
          if (!litRef.current.has(i) && fillPx >= n.offsetTop + 11) add.push(i);
        });
        if (add.length) {
          const next = new Set(litRef.current);
          add.forEach(i => next.add(i));
          litRef.current = next;
          setLit(next);
          add.forEach(i => onLitRef.current?.(i));
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="mv-timeline" ref={ref}>
      <div className="mv-timeline__line"><div className="mv-timeline__fill" ref={fillRef} /></div>
      {items.map((it, i) => (
        <div data-idx={i} key={i}
          className={`tl-item${seen.has(i) ? " is-visible" : ""}${lit.has(i) ? " is-lit" : ""}`}
          onPointerEnter={onItemEnter ? () => onItemEnter(i) : undefined}>
          {fire && <span className="tl-flame" aria-hidden="true"><FlameDot active={lit.has(i)} /></span>}
          <span className="tl-num">{it.n}</span>
          <h3>{it.t}</h3>
          <p>{it.d}</p>
        </div>
      ))}
    </div>
  );
}

/* ---- dáta ---- */
const DOC_CARDS = [
  { n: "01", t: "Tvrdá cesta Kubou", d: "Trojdielny dokumentárny seriál pre TV Markíza a platformu VOYO — autentický pohľad na tréningový camp, profesionálnych športovcov a život domácich Kubáncov." },
  { n: "02", t: "10 rokov Hip Hop Žije", d: "Jubilejný dokument mapujúci desaťročnú históriu najväčšieho hip-hopového festivalu na Slovensku — jeho vývoj, atmosféru a ľudí, ktorí stáli za jeho úspechom." },
  { n: "03", t: "Portréty bojovníkov", d: "Profilové príbehy osobností zo sveta bojových športov — Sebastian Fapšo, Leo Brichta a ďalší profesionálni bojovníci. Kariéra, životná cesta, úspechy aj hodnoty, ktoré reprezentujú." },
];

const PILLARS = [
  { n: "01", t: "Business Strategy", d: "Analyzujeme váš biznis, trh a konkurenciu. Nastavujeme obchodné a rastové stratégie s jasnou víziou a merateľnými cieľmi." },
  { n: "02", t: "Brand Experience", d: "Budujeme silné značky — identitu, dizajn a komunikáciu, ktorá vytvára dôveru, zaujme na prvý pohľad a zostane v pamäti." },
  { n: "03", t: "Growth Marketing", d: "Multi-channel kampane nastavené na výkon. Platená reklama, mediálna komunikácia a obsah, ktorý prináša merateľný rast." },
  { n: "04", t: "Media Production", d: "Video dokumenty, live prenosy, podcasty a eventy s vysokou produkčnou kvalitou — od konceptu po finálnu realizáciu." },
  { n: "05", t: "AI & Data Intelligence", d: "Rozhodnutia podložené dátami. Prieskumy trhu, analytika a moderné AI nástroje premieňajú čísla na stratégiu." },
];

const PROJECTS = [
  { t: "RFA – Real Fight Arena", cat: "Šport · Eventy · Broadcast", d: "Kompletná vizuálna identita, promo kampane, event branding, video produkcia a broadcast pre najväčšiu MMA organizáciu na Slovensku.", bg: "/clients/rfa-bg.webp" },
  { t: "Hip Hop Žije Festival", cat: "Hudba · Festival", d: "Najväčší hip-hopový festival na Slovensku — marketing, médiá a jubilejný dokument 10 rokov Hip Hop Žije.", bg: "/clients/hhz-bg.webp" },
  { t: "XBIO", cat: "E-commerce · Brand", d: "Budovanie značky a výkonnostný marketing pre e-shop so zdravou výživou, CBD olejmi a doplnkami.", url: "https://www.xbio.sk", bg: "/clients/xbio-bg.webp" },
  { t: "ThaiSpot", cat: "Wellness · Marketing", d: "Marketing a budovanie značky pre tradičné thajské masáže a wellness v centre Bratislavy.", url: "https://www.thaispot.sk", bg: "/clients/thaispot-bg.webp" },
  { t: "Alchymista Bar", cat: "Gastro · Eventy", d: "Branding, eventy a profesionálny bar catering v spolupráci so skúseným tímom.", url: "https://www.alchymista.pub", bg: "/clients/alchymista-bg.webp" },
  { t: "GS Group Company", cat: "Distribúcia · B2B", d: "Veľkoobchod a distribúcia nápojov pre reštaurácie, hotely, bary a gastro prevádzky.", url: "https://www.gsgc.eu", bg: "/clients/gsgc-bg.webp" },
];

const MEDIA_ITEMS = [
  { tab: "Partnerstvá", n: "01", t: "Mediálne partnerstvá", d: "Spolupracujeme s poprednými slovenskými mediálnymi domami a titulmi — TV Markíza, Startitup, Nový Čas, Topky, Športky, Denník Šport a mnohé ďalšie.", tags: ["TV Markíza", "Startitup", "Denník Šport"] },
  { tab: "Mediálny plán", n: "02", t: "Mediálny plán na mieru", d: "Na základe cieľov klienta pripravíme individuálny mediálny plán, navrhneme najvhodnejšie komunikačné kanály a zabezpečíme profesionálnu realizáciu mediálnej kampane.", tags: ["Stratégia", "Kanály", "Realizácia"] },
  { tab: "Podmienky", n: "03", t: "Výhodnejšie podmienky", d: "Vďaka dlhodobým partnerstvám dokážeme klientom sprostredkovať výrazne výhodnejšie podmienky a zľavy oproti štandardným cenníkovým cenám. Každé investované euro prinesie čo najväčší mediálny zásah.", tags: ["Zľavy", "Zásah", "Prínos"] },
  { tab: "Publikum", n: "04", t: "Správne publikum", d: "Pomôžeme vám dostať vašu značku, produkt alebo službu pred správne publikum — efektívne, profesionálne a s maximálnym dopadom.", tags: ["Publikum", "Dopad", "Značka"] },
];

const BROADCAST_ITEMS = [
  { n: "01", t: "Live prenosy", d: "Prenosy do televízneho vysielania, online streamy na sociálne siete aj vlastné vysielacie platformy." },
  { n: "02", t: "Pay-Per-View", d: "Bezpečný predaj prístupov k športovým podujatiam, konferenciám, koncertom či exkluzívnemu obsahu cez profesionálnu PPV platformu." },
  { n: "03", t: "Podcasty", d: "Od konceptu, scenára a vizuálnej identity cez štúdio, techniku, moderovanie a natáčanie až po postprodukciu a distribúciu na najvýznamnejšie podcastové a video platformy." },
  { n: "04", t: "Video formáty", d: "Profesionálne video formáty pre vašu značku — kompletné riešenie od prvotného nápadu až po finálnu realizáciu." },
];

const TIMELINE_ITEMS = [
  { n: "01", t: "Discovery", d: "Spoznáme váš biznis, ciele, zákazníkov a konkurenciu. Audit existujúcich aktivít a dát." },
  { n: "02", t: "Stratégia", d: "Na základe dát navrhneme biznis a growth stratégiu s jasnými KPI a harmonogramom." },
  { n: "03", t: "Realizácia", d: "Kampane, video produkcia, eventy aj mediálna komunikácia — všetko v dohodnutom čase a kvalite." },
  { n: "04", t: "Meranie & optimalizácia", d: "Nepretržité testovanie, meranie a zlepšovanie výsledkov. Prehľadné reporty každý mesiac." },
  { n: "05", t: "Dlhodobé partnerstvo", d: "Rastieme spolu s vami — stratégiu priebežne rozvíjame podľa výsledkov a nových príležitostí." },
];

const CONTACT_EMAIL = "office@fehuprosperity.eu";

/* ============================================================ */
export default function FehuFireV2() {
  const [dark, setDark] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  /* navigácia po odscrollovaní zmatnie */
  const [navScrolled, setNavScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  /* cookies + právne dokumenty */
  const [legal, setLegal] = useState({ open: false, tab: "cookies" });
  const [ckSignal, setCkSignal] = useState(0);
  const openLegal = useCallback(tab => setLegal({ open: true, tab }), []);
  const [activePillar, setActivePillar] = useState(0);
  /* vrcholy pentagonu zapálené ohnivou čiarou v timeline */
  const [litPillars, setLitPillars] = useState(() => new Set());
  const sectionRefs = useRef({});

  const scrollTo = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const setRef = (id) => (el) => { sectionRefs.current[id] = el; };

  /* kontaktný formulár — odoslanie cez mailto */
  const submitContact = useCallback((e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const subject = `Dopyt z webu — ${fd.get("typ") || "spolupráca"}`;
    const body = [
      `Meno: ${fd.get("meno") || ""}`,
      `Kontakt: ${fd.get("kontakt") || ""}`,
      `Typ spolupráce: ${fd.get("typ") || ""}`,
      "",
      fd.get("sprava") || "",
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, []);

  /* newsletter vo footeri — mailto */
  const submitNewsletter = useCallback((e) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") || "";
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Prihlásenie k odberu noviniek")}&body=${encodeURIComponent(`Prosím o zaradenie do odberu noviniek: ${email}`)}`;
  }, []);

  useParallax();

  /* scroll reveal */
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } });
    }, { threshold: 0.10, rootMargin: "0px 0px -50px 0px" });
    const t = setTimeout(() => {
      document.querySelectorAll(".rv,.rv-l,.rv-r,.rv-scale,.rv-s").forEach(el => io.observe(el));
    }, 400);
    return () => { clearTimeout(t); io.disconnect(); };
  }, []);

  return (
    <div className={`fehu ${dark ? "dark" : "light"}`}>
      <style>{CSS}{V2_CSS}{LEGAL_CSS}</style>
      <ScrollProgress />
      <CursorTrail />

      {/* NAV — logo v strede, sekcie okolo neho podľa kruhu */}
      <nav className={`nav nav-orbit${navScrolled ? " is-scrolled" : ""}`}>
        <div className="nav-arc nav-arc-l">
          {NAV_LEFT.map(n => (
            <button key={n.id} className="nav-sec" onClick={() => scrollTo(n.id)}>{n.label}</button>
          ))}
        </div>
        <div className="logo" onClick={() => scrollTo("top")}><img className="logo-rune-img logo-wide-img" src="/logo-wide.webp" alt="FEHU Prosperity" /></div>
        <div className="nav-arc nav-arc-r">
          {NAV_RIGHT.map(n => (
            <button key={n.id} className="nav-sec" onClick={() => scrollTo(n.id)}>{n.label}</button>
          ))}
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={() => setDark(d => !d)} aria-label="Prepnúť tému">
            {dark ? "☀" : "☾"}
          </button>
          <Magnetic strength={10}><button className="nav-cta" onClick={() => scrollTo("kontakt")}>Mám záujem o Vaše služby</button></Magnetic>
          <button className="nav-burger" onClick={() => setNavOpen(o => !o)} aria-label="Menu" aria-expanded={navOpen}>{navOpen ? "✕" : "☰"}</button>
        </div>
        {navOpen && (
          <div className="nav-mobile">
            {MENU.map(m => (
              <button key={m.id} onClick={() => { scrollTo(m.id); setNavOpen(false); }}>
                {m.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* HERO — orbitálne kruhy */}
      <header className="hero" ref={setRef("top")}>
        <FehuOrbital onNavigate={scrollTo} />
        <div className="hero-copy">
          <h1 className="hero-title">
            Nechajte váš biznis <span className="serif-it">prosperovať</span>
          </h1>
          <p className="hero-lead">
            FEHU je full-service agentúra pre <span className="serif-it">stratégiu</span>, dizajn
            a digitálny marketing, ktorá pomáha značkám rásť <span className="serif-it">rýchlejšie</span>.
          </p>
          <Magnetic>
            <button className="hero-btn" onClick={() => scrollTo("kontakt")}>
              Mám záujem o Vaše služby <span className="arr">→</span>
            </button>
          </Magnetic>
          <div className="scroll-hint" onClick={() => scrollTo("strategia")}>
            <span>Posunúť nadol</span><span className="arr-down">↓</span>
          </div>
        </div>
      </header>

      {/* O NÁS */}
      <section className="sec sec-about" ref={setRef("onas")}>
        <Blob speed="0.10" style={{ width: 340, height: 340, top: "8%", right: "-90px", background: "rgba(216,172,60,.07)" }} />
        <div className="wrap onas-grid">
          <div className="onas-main">
            <p className="eyebrow rv" style={{textAlign:"left"}}>O nás</p>
            <SplitHead segments={[{ t: "Budujeme " }, { t: "úspešné", serif: true }, { t: " firmy a silné značky." }]} />
            <p className="sub-lead rv" style={{transitionDelay:"140ms", maxWidth:"none"}}>
              <b>Fehu Prosperity</b> je spoločnosť zameraná na budovanie úspešných firiem, silných značiek
              a dlhodobo udržateľného rastu. Poskytujeme komplexné služby v oblasti biznis stratégie,
              marketingu, manažmentu, budovania značiek, prieskumu trhu, tvorby video obsahu
              a profesionálnej prípravy dokumentov.
            </p>
            {/* prvý odstavec zostáva viditeľný — text tak siaha po koniec fotky */}
            <div className="about-body rv" style={{transitionDelay:"200ms", maxWidth:"none"}}>
              <p>Veríme, že úspešná značka nevzniká náhodou. Je výsledkom jasnej vízie, premyslenej stratégie,
              kvalitnej komunikácie a dôslednej realizácie. Preto ku každému projektu pristupujeme individuálne
              a navrhujeme riešenia, ktoré prinášajú reálne výsledky a dlhodobú hodnotu.</p>
            </div>
            <ReadMore className="rv" style={{transitionDelay:"260ms"}}>
            <div className="about-body" style={{maxWidth:"none"}}>
              <p>Za spoločnosťou stojí podnikateľ <b>Boris Marhanský</b>, ktorý počas svojej podnikateľskej kariéry
              vybudoval a rozvíjal viaceré úspešné projekty. Jeho skúsenosti z oblasti podnikania, marketingu,
              manažmentu a budovania značiek tvoria základ filozofie Fehu Prosperity – byť partnerom, ktorý
              nielen radí, ale aktívne pomáha meniť vízie na úspešné projekty.</p>
              <p>Našim klientom pomáhame vytvárať silnú identitu značky, nastavovať efektívne obchodné
              a marketingové stratégie, analyzovať trh a identifikovať nové príležitosti na rast. Zároveň
              zabezpečujeme tvorbu profesionálnych videí, reklamných kampaní, prezentačných materiálov
              a obchodných dokumentov, ktoré podporujú dôveryhodnosť značky a zvyšujú jej hodnotu.</p>
              <p><b>Fehu Prosperity</b> je partner pre podnikateľov, startupy aj etablované spoločnosti,
              ktoré chcú rásť, budovať silnú značku a uspieť v dynamickom podnikateľskom prostredí.</p>
            </div>
            </ReadMore>
          </div>
          <aside className="onas-side rv-r" style={{transitionDelay:"180ms"}}>
            <Tilt className="founder-card" max={6} scale={1.02}>
              <img src="/boris-marhansky.webp" alt="Boris Marhanský — zakladateľ Fehu Prosperity" loading="lazy" />
              <figcaption><b>Boris Marhanský</b><span>Zakladateľ · Fehu Prosperity</span></figcaption>
            </Tilt>
            <blockquote className="side-quote">
              „Od nápadu cez stratégiu až po finálnu realizáciu – všetko pod jednou strechou.“
            </blockquote>
            <div className="side-tags">
              <span>Stratégia</span><span>Brand</span><span>Produkcia</span><span>Médiá</span><span>Eventy</span>
            </div>
          </aside>
        </div>
      </section>

      {/* STRATÉGIA — interaktívny radar + tilt karty */}
      <section className="sec sec-strategy" ref={setRef("strategia")}>
        <Blob speed="0.14" style={{ width: 300, height: 300, top: "12%", left: "-70px", background: "rgba(180,132,30,.06)" }} />
        <div className="wrap">
          <SplitHead segments={[
            { t: "Dátami riadené, na výkon zamerané" }, { br: true },
            { t: "rastové", serif: true }, { t: " biznisové riešenia." },
          ]} />
          <div className="rv" style={{transitionDelay:"100ms"}}><p className="sub-lead">
            Naše riešenia pomohli firmám každej veľkosti rásť rýchlejšie — bez ohľadu
            na odvetvie či model príjmov.
          </p></div>

          <div className="strat-grid">
            <Timeline items={PILLARS} fire onItemEnter={setActivePillar}
              onLit={i => setLitPillars(s => (s.has(i) ? s : new Set([...s, i])))} />
            <div className="strat-radar">
              <InteractiveRadar items={PILLARS} active={activePillar}
                setActive={setActivePillar} lit={litPillars} />
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO / DOKUMENTY — sticky text + karty */}
      <section className="sec sec-about" ref={setRef("video")}>
        <Blob speed="0.11" style={{ width: 320, height: 320, top: "30%", right: "-80px", background: "rgba(230,186,80,.06)" }} />
        <div className="wrap video-split">
          <div className="video-side">
            <p className="eyebrow rv" style={{textAlign:"left"}}>Video / Dokumenty</p>
            <SplitHead segments={[{ t: "Skutočné príbehy so " }, { t: "silným", serif: true }, { t: " spracovaním." }]} />
            <p className="sub-lead rv" style={{transitionDelay:"140ms", margin:0}}>
              <b>Fehu Prosperity</b> sa venuje tvorbe dokumentárnych filmov a video dokumentov, ktoré zachytávajú
              skutočné príbehy, významné osobnosti a jedinečné udalosti. Každý projekt realizujeme od prvotného
              konceptu cez scenár, produkciu a natáčanie až po finálnu postprodukciu.
            </p>
            <p className="video-note rv" style={{transitionDelay:"200ms"}}>
              Naším cieľom je dokumentárny obsah s vysokou produkčnou kvalitou, silným príbehom
              a vizuálnym spracovaním, ktoré zanechá trvalý dojem.
            </p>
          </div>
          <div className="video-cards">
            {DOC_CARDS.map((p,i)=>(
              <div className="rv-scale tilt-holder vc-item" style={{transitionDelay:`${i*120}ms`}} key={i}>
                <Tilt className="pillar-card video-card">
                  <span className="pc-num">{p.n}</span>
                  <h4 className="pc-title">{p.t}</h4>
                  <p className="pc-desc">{p.d}</p>
                </Tilt>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIESKUM TRHU */}
      <section className="sec sec-visual" ref={setRef("prieskum")}>
        <div className="wrap vis-wrap">
          <div className="vis-text rv-l">
            <p className="eyebrow" style={{textAlign:"left", margin:0}}>Prieskum trhu</p>
            <SplitHead className="big-head head-md" segments={[
              { t: "Rozhodnutia postavené na " }, { t: "dátach", serif: true },
              { t: ", nie na domnienkach." },
            ]} />
            <p className="sub-lead" style={{margin:0}}>
              Pre našich klientov realizujeme profesionálne prieskumy trhu, ktoré poskytujú
              reálny pohľad na názory, správanie a potreby cieľovej skupiny.
            </p>
            <ReadMore>
            <div className="about-body" style={{maxWidth:"none"}}>
              <p>Na základe výsledkov prieskumu pomáhame klientom efektívnejšie nastavovať marketingové kampane,
              budovať značku, uvádzať nové produkty na trh, lepšie porozumieť svojim zákazníkom a vytvárať
              biznis stratégie založené na reálnych dátach.</p>
              <p>Naším cieľom nie je len zbierať informácie, ale poskytovať <b>kvalitné analýzy</b>, ktoré klientom
              pomáhajú prijímať správne rozhodnutia, minimalizovať riziká a dosahovať lepšie obchodné výsledky.</p>
            </div>
            </ReadMore>
          </div>
          <div className="vis-text rv-r research-side" style={{transitionDelay:"150ms"}}>
            <div className="research-tiles">
              {[
                { t: "Call centrum", d: "Telefonické prieskumy s vyškoleným tímom.",
                  ic: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.27a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2z"/></> },
                { t: "Terén", d: "Osobné rozhovory priamo u respondentov.",
                  ic: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></> },
                { t: "Anketári", d: "V uliciach a na vybraných miestach.",
                  ic: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M15 20v-1a5 5 0 0 1 6-4.9"/></> },
                { t: "Analýzy", d: "Vyhodnotenie a praktické odporúčania.",
                  ic: <><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/></> },
              ].map((r, i) => (
                <div className="rt" key={i} style={{transitionDelay:`${i*70}ms`}}>
                  <svg viewBox="0 0 24 24">{r.ic}</svg>
                  <b>{r.t}</b>
                  <span>{r.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJEKTY — flip karty */}
      <section className="sec sec-clients" ref={setRef("projekty")}>
        <Blob speed="0.13" style={{ width: 360, height: 360, top: "20%", left: "-100px", background: "rgba(216,172,60,.06)" }} />
        <div className="wrap center-wrap">
          <p className="eyebrow rv">Projekty</p>
          <SplitHead className="big-head center-split" segments={[{ t: "Projekty, na ktorých " }, { t: "spolupracujeme", serif: true }, { t: "." }]} />
          <div className="rv" style={{transitionDelay:"160ms"}}><p className="sub-lead center-lead">
            Naše skúsenosti sme získavali pri spolupráci na úspešných projektoch z oblasti športu, médií,
            e-commerce, distribúcie, gastronómie a podnikania. Prejdite kurzorom po karte a spoznajte detail.
          </p></div>

          <div className="flip-grid">
            {PROJECTS.map((p, i) => <FlipCard p={p} delay={i * 80} key={i} />)}
          </div>

          <ReadMore className="rv rm-center" style={{marginTop:"2.8rem"}}>
          <div className="about-body grid-aligned">
            <p>Tieto spolupráce predstavujú spojenie stratégie, marketingu, brandingu, video produkcie,
            prieskumu trhu a projektového manažmentu. Každý projekt vnímame ako dlhodobé partnerstvo,
            ktorého cieľom je vytvárať merateľné výsledky, posilňovať značku a podporovať rast našich klientov.</p>
            <p>Vo <b>Fehu Prosperity</b> veríme, že úspech vzniká spojením kvalitnej stratégie, kreativity
            a precíznej realizácie. Práve preto sa usilujeme byť partnerom, ktorý svojim klientom prináša
            skutočnú hodnotu a pomáha im dosahovať ich dlhodobé ciele.</p>
          </div>
          </ReadMore>
        </div>
      </section>

      {/* EVENTY — coverflow 3D slider */}
      <section className="sec sec-cases" ref={setRef("eventy")}>
        <Blob speed="0.10" style={{ width: 300, height: 300, top: "35%", right: "-80px", background: "rgba(176,128,30,.06)" }} />
        <div className="wrap">
          <p className="eyebrow rv">Eventy</p>
          <SplitHead className="big-head center center-split head-one" segments={[
            { t: "Podujatia " }, { t: "na kľúč", serif: true }, { t: " — od konceptu po deň D" },
          ]} />
          <div className="rv" style={{transitionDelay:"160ms"}}><p className="sub-lead center-lead">
            Zabezpečujeme kompletnú organizáciu podujatí na kľúč. Špecializujeme sa na športové podujatia,
            hudobné festivaly a koncerty, firemné eventy, konferencie, galavečery, VIP podujatia aj promo akcie.
          </p></div>

          <Coverflow items={POSTERS} />

          <ReadMore className="rv rm-center" style={{margin:"2.6rem auto 0"}}>
          <div className="about-body">
            <p>Postaráme sa o <b>kompletný produkčný servis</b> vrátane plánovania, koordinácie, technického
            zabezpečenia, personálu, logistiky a komunikácie s partnermi.</p>
            <p>Súčasťou našich služieb je aj profesionálny <b>bar catering</b> — kompletné nápojové riešenia,
            mobilné bary, profesionálni barmani a individuálna ponuka prispôsobená charakteru podujatia.</p>
            <p>Naším cieľom je vytvárať podujatia, ktoré sú dokonale zorganizované, reprezentujú značku klienta
            na najvyššej úrovni a zanechávajú nezabudnuteľný zážitok u každého účastníka.</p>
          </div>
          </ReadMore>
        </div>
      </section>

      {/* MÉDIÁ — animated tabs */}
      <section className="sec sec-services" ref={setRef("media")}>
        <div className="card-light media-tabs-card">
          <div className="rv"><h2 className="serv-head">Médiá, ktoré <span className="serif-it">budujú</span> dôveru.</h2></div>
          <div className="rv" style={{transitionDelay:"100ms"}}>
            <MediaTabs items={MEDIA_ITEMS} />
          </div>
        </div>
      </section>

      {/* BROADCAST & PODCAST — split s akordeónom */}
      <section className="sec sec-data" ref={setRef("broadcast")}>
        <Blob speed="0.12" style={{ width: 300, height: 300, top: "15%", left: "-70px", background: "rgba(214,170,56,.05)" }} />
        <div className="wrap bc-split">
          <div className="bc-side">
            <p className="eyebrow rv" style={{textAlign:"left"}}>Broadcast & Podcast</p>
            <SplitHead segments={[{ t: "Naživo aj " }, { t: "na mieru", serif: true }, { t: "." }]} />
            <p className="sub-lead rv" style={{transitionDelay:"160ms", margin:0}}>
              Zabezpečujeme profesionálnu produkciu živých vysielaní, online prenosov a podcastov na mieru.
              Vďaka moderným technológiám a skúsenému produkčnému tímu vytvoríme riešenie prispôsobené
              potrebám každého klienta.
            </p>
          </div>
          <div className="rv bc-acc" style={{transitionDelay:"220ms"}}>
            <Accordion items={BROADCAST_ITEMS} />
          </div>
        </div>
      </section>

      {/* AKO PRACUJEME — timeline s ohnivými bodmi */}
      <section className="sec sec-timeline">
        <Blob speed="0.14" style={{ width: 340, height: 340, top: "25%", right: "-90px", background: "rgba(200,156,48,.06)" }} />
        <div className="wrap tl-wrap">
          <div className="tl-side">
            <p className="eyebrow rv" style={{textAlign:"left"}}>Ako pracujeme</p>
            <SplitHead segments={[{ t: "Od nápadu po " }, { t: "výsledky", serif: true }, { t: "." }]} />
            <p className="sub-lead rv" style={{transitionDelay:"140ms", margin:0}}>
              Jasný a overený proces, v ktorom vždy viete, čo sa deje a čo bude nasledovať.
              Scrollujte a pozrite si našu cestu k výsledkom.
            </p>
          </div>
          <Timeline items={TIMELINE_ITEMS} fire />
        </div>
      </section>

      {/* CTA — kontakt (glass formulár) */}
      <section className="sec sec-cta" ref={setRef("kontakt")}>
        <div className="orbit-badge">
          <svg viewBox="0 0 120 120" className="badge-ring">
            <defs><path id="cir2" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
            <text className="badge-text"><textPath href="#cir2" startOffset="0">RÁSŤ · STRATÉGIA · OPTIMALIZÁCIA · KONVERTOVAŤ · </textPath></text>
          </svg>
          <div className="badge-core badge-fire">
            <span className="badge-flame" aria-hidden="true" />
            <img src={LOGO_EMBLEM} alt="FEHU" className="badge-rune" />
          </div>
        </div>
        <p className="cta-eyebrow rv" style={{transitionDelay:"0ms"}}>Poďme na obežnú dráhu</p>
        <h2 className="cta-head rv" style={{transitionDelay:"100ms"}}>
          Posuňme vašu firmu <span className="serif-it">roky dopredu</span>.
        </h2>
        <p className="cta-sub rv" style={{transitionDelay:"180ms"}}>Bezplatná konzultácia do 48 hodín. Žiadne záväzky.</p>

        <form className="v2-form rv" style={{transitionDelay:"260ms"}} onSubmit={submitContact}>
          <div className="v2-form-grid">
            <label className="v2-field">
              <span>Meno a priezvisko</span>
              <input name="meno" required placeholder="Ján Novák" />
            </label>
            <label className="v2-field">
              <span>E-mail / telefón</span>
              <input name="kontakt" required placeholder="jan@firma.sk" />
            </label>
            <label className="v2-field full">
              <span>Typ spolupráce</span>
              <select name="typ" defaultValue="">
                <option value="" disabled>Vyberte oblasť…</option>
                <option>Video / Dokumenty</option>
                <option>Prieskum trhu</option>
                <option>Eventy</option>
                <option>Médiá</option>
                <option>Broadcast & Podcast</option>
                <option>Komplexná spolupráca</option>
              </select>
            </label>
            <label className="v2-field full">
              <span>Správa</span>
              <textarea name="sprava" rows={4} placeholder="Povedzte nám o vašom projekte…" />
            </label>
          </div>
          <Magnetic>
            <button type="submit" className="cta-btn v2-submit">Odoslať dopyt <span className="arr">→</span></button>
          </Magnetic>
        </form>

        <div className="cta-trust rv" style={{transitionDelay:"340ms"}}>
          <span>🔒 Vaše dáta sú v bezpečí</span>
          <span>⚡ Odpoveď do 24h</span>
          <span>✓ Bez záväzkov</span>
        </div>
        <p className="cta-email rv" style={{transitionDelay:"400ms"}}>
          <a href="mailto:office@fehuprosperity.eu">office@fehuprosperity.eu</a>
        </p>
      </section>

      {/* FOOTER — footer-mega štýl */}
      <footer className="footer v2-footer">
        <div className="foot-hero rv">
          <h2 className="foot-hero-head">Poďme <span className="serif-it">tvoriť</span> spolu.</h2>
          <Magnetic>
            <button className="hero-btn" onClick={() => scrollTo("kontakt")}>Napíšte nám <span className="arr">→</span></button>
          </Magnetic>
        </div>
        <div className="foot-top">
          <div className="foot-brand rv" style={{transitionDelay:"60ms"}}>
            <div className="logo"><img className="logo-rune-img" src={LOGO_FULL} alt="FEHU Prosperity" /></div>
            <p className="foot-sign"><span className="serif-it">Prihláste sa</span> a využite silu FEHU.</p>
            <form className="foot-form" onSubmit={submitNewsletter}>
              <input className="foot-input" name="email" type="email" required placeholder="Váš e-mail" aria-label="E-mail" />
              <button type="submit" className="foot-submit" aria-label="Odoslať">→</button>
            </form>
          </div>
          <div className="foot-cols">
            <div className="foot-col rv" style={{transitionDelay:"140ms"}}>
              <h4>Služby</h4>
              <button onClick={()=>scrollTo("video")}>Video / Dokumenty</button>
              <button onClick={()=>scrollTo("prieskum")}>Prieskum trhu</button>
              <button onClick={()=>scrollTo("eventy")}>Eventy</button>
              <button onClick={()=>scrollTo("media")}>Médiá</button>
              <button onClick={()=>scrollTo("broadcast")}>Broadcast & Podcast</button>
            </div>
            <div className="foot-col rv" style={{transitionDelay:"220ms"}}>
              <h4>Spoločnosť</h4>
              <button onClick={()=>scrollTo("onas")}>O nás</button>
              <button onClick={()=>scrollTo("projekty")}>Projekty</button>
              <button onClick={()=>scrollTo("kontakt")}>Kontakt</button>
              <button onClick={()=>{ window.location.href = `mailto:${CONTACT_EMAIL}`; }}>office@fehuprosperity.eu</button>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} FEHU. Všetky práva vyhradené.</span>
          <nav className="foot-legal" aria-label="Právne informácie">
            <button onClick={() => openLegal("cookies")}>Zásady cookies</button>
            <button onClick={() => openLegal("gdpr")}>Ochrana osobných údajov</button>
            <button onClick={() => setCkSignal(n => n + 1)}>Nastavenia cookies</button>
          </nav>
          <span>Bratislava · Praha · Viedeň</span>
        </div>
      </footer>

      <ScrollTopFab onClick={() => scrollTo("top")} />

      <CookieConsent openSettingsSignal={ckSignal} onOpenPolicy={openLegal} />
      <LegalModal open={legal.open} tab={legal.tab}
        onTab={t => setLegal(l => ({ ...l, tab: t }))}
        onClose={() => setLegal(l => ({ ...l, open: false }))} />
    </div>
  );
}

/* ============================================================
   V2 CSS — komponenty z COMPONENT SITE vo FEHU palete
   ============================================================ */
const V2_CSS = `
/* ── Cursor Trail ── */
.mv-trail{position:fixed;inset:0;pointer-events:none;z-index:996;mix-blend-mode:screen;}

/* ── Scroll Progress ── */
.mv-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:200;
  background:linear-gradient(90deg,var(--accent-2),var(--accent),#ffd27a);
  transform-origin:0 50%;transform:scaleX(0);
  box-shadow:0 0 12px color-mix(in srgb,var(--accent) 60%, transparent);}

/* ── Magnetic ── */
.mv-magnet{display:inline-block;transition:transform .3s cubic-bezier(.22,1,.36,1);will-change:transform;}

/* ── Hero ── */
.hero .fo-wrap,.hero .hero-copy{position:relative;z-index:2;}

/* ── Split-Text Reveal ── */
.st-head .st-w{display:inline-block;overflow:hidden;vertical-align:top;margin-right:.26em;padding-bottom:.08em;}
.st-head .st-wi{display:inline-block;transform:translateY(115%);
  transition:transform .7s cubic-bezier(.22,1,.36,1);will-change:transform;}
.st-head.st-in .st-wi{transform:translateY(0);}
.center-split{text-align:center;}
/* interpunkcia sa nelepí s medzerou za predošlé slovo */
.st-head .st-p{margin-left:-.26em;margin-right:.2em;}

/* ── Parallax bloby ── */
.plx-blob{position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none;z-index:0;
  transform:translateY(var(--plx,0));will-change:transform;}
.sec>.wrap,.sec>.card-light{position:relative;z-index:1;}

/* ── Card 3D Tilt ── */
.mv-tilt{position:relative;transform-style:preserve-3d;will-change:transform;
  transition:transform .25s ease-out;overflow:hidden;height:100%;}
.mv-tilt__glare{position:absolute;inset:0;pointer-events:none;border-radius:inherit;}
.tilt-holder{display:flex;}
.tilt-holder .pillar-card{flex:1;}

/* ── Stratégia: timeline vľavo + pentagon vpravo ──
   pentagon je vodorovne vycentrovaný voči textu vľavo ── */
.strat-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,480px);
  gap:3.4rem;align-items:center;margin-top:3rem;text-align:left;}
.strat-grid .mv-timeline{margin-left:.4rem;}
.strat-radar{position:sticky;top:110px;padding:0;
  display:flex;align-items:center;justify-content:center;}
.strat-radar .pillar-ring{width:min(400px,100%);margin:0 auto;}
@media(max-width:960px){
  .strat-grid{grid-template-columns:1fr;gap:2.4rem;}
  .strat-radar{position:static;order:-1;padding:0;display:flex;justify-content:center;}
}

/* ── NAV: logo v strede, sekcie v dvoch oblúkoch okolo neho ── */
.nav-orbit{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;
  column-gap:1.1rem;position:fixed;top:0;left:0;right:0;z-index:50;
  transition:background .45s ease, backdrop-filter .45s ease,
    border-color .45s ease, padding .35s ease;}
/* po odscrollovaní stmavne a zpriehľadnie */
.nav-orbit.is-scrolled{
  background:color-mix(in srgb, var(--bg) 42%, transparent);
  backdrop-filter:blur(18px) saturate(1.3);
  -webkit-backdrop-filter:blur(18px) saturate(1.3);
  border-bottom-color:color-mix(in srgb,var(--accent) 16%, transparent);
  padding-top:.62rem;padding-bottom:.62rem;
  box-shadow:0 10px 34px rgba(0,0,0,.28);}
.nav-orbit.is-scrolled .logo-wide-img{height:28px;transition:height .35s ease;}
.nav-arc{display:flex;align-items:center;gap:.15rem;min-width:0;}
.nav-arc-l{justify-content:flex-end;}
.nav-arc-r{justify-content:flex-start;}
.nav-orbit .logo{justify-self:center;}
.nav-sec{background:none;border:none;cursor:pointer;font-family:inherit;white-space:nowrap;
  font-size:.68rem;font-weight:700;letter-spacing:.07em;padding:.42rem .5rem;border-radius:8px;
  color:var(--fg-dim);transition:color .22s, background .22s, transform .22s cubic-bezier(.22,1,.36,1);}
.nav-sec:hover{color:var(--accent);background:color-mix(in srgb,var(--accent) 10%, transparent);
  transform:translateY(-1px);}
/* utility (téma + CTA) sedia úplne vpravo, mimo mriežky, aby logo zostalo na strede */
.nav-orbit .nav-right{position:absolute;right:0;top:50%;transform:translateY(-50%);}
.nav-cta{white-space:nowrap;}

/* postupné zjednodušovanie pri užších obrazovkách */
@media(max-width:1560px){.nav-orbit .nav-cta{display:none;}}
@media(max-width:1200px){
  .nav-sec{font-size:.63rem;padding:.4rem .34rem;letter-spacing:.03em;}
}
@media(max-width:1040px){
  .nav-orbit{grid-template-columns:auto 1fr auto;}
  .nav-arc{display:none;}
  .nav-orbit .logo{justify-self:start;}
  .nav-orbit .nav-right{position:static;transform:none;justify-self:end;}
  .nav-orbit .nav-cta{display:inline-block;}
}
@media(max-width:900px){.nav-cta{font-size:0;padding:.55rem 1.1rem;}
  .nav-cta::after{content:"Mám záujem";font-size:.72rem;}}

/* ── Rozkliknuteľný text (Čítať viac) ── */
.rm{width:100%;}
.rm-body{overflow:hidden;max-height:0;
  transition:max-height .55s cubic-bezier(.22,1,.36,1), opacity .45s ease;opacity:0;}
.rm-body[aria-hidden="false"]{opacity:1;}
.rm-inner{padding-top:.2rem;}
.rm-btn{display:inline-flex;align-items:center;gap:.5rem;margin-top:1rem;
  padding:.62rem 1.3rem;border-radius:999px;cursor:pointer;font-family:inherit;
  font-size:.74rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;
  color:var(--accent);background:color-mix(in srgb,var(--accent) 12%, transparent);
  border:1px solid color-mix(in srgb,var(--accent) 55%, transparent);
  box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 30%, transparent);
  transition:background .25s, border-color .25s, color .25s, box-shadow .3s,
    transform .25s cubic-bezier(.22,1,.36,1);}
.rm-btn:hover{color:var(--accent-ink);border-color:transparent;
  background:linear-gradient(120deg,var(--accent-2),var(--accent) 55%,#ffd27a);
  box-shadow:0 8px 22px color-mix(in srgb,var(--accent) 34%, transparent);
  transform:translateY(-2px);}
.rm-btn:focus-visible{outline:2px solid var(--accent);outline-offset:3px;}
.rm-chev{display:inline-block;transition:transform .35s cubic-bezier(.22,1,.36,1);}
.rm-btn.is-open .rm-chev{transform:rotate(180deg);}
.rm-center{text-align:center;}
.rm-center .about-body{margin-left:auto;margin-right:auto;}

/* ── plamienok na bode timeline ──
   pred prerolovaním minimálna viditeľnosť, po zasvietení plný oheň ── */
.tl-item{overflow:visible;}
.tl-flame{position:absolute;left:calc(-2.6rem + 11px);top:calc(.25rem + 7px);
  width:72px;height:72px;transform:translate(-50%,-50%);pointer-events:none;z-index:1;
  opacity:.18;transition:opacity 1.1s cubic-bezier(.22,1,.36,1);}
.tl-item.is-lit .tl-flame{opacity:1;}
.tl-flame canvas{width:100%;height:100%;display:block;}

/* ── Interaktívny radar + pentagon ── */
.ir-ring .radar-pent{fill:none;stroke:color-mix(in srgb,var(--accent) 26%, transparent);
  stroke-width:1;stroke-linejoin:round;}
/* ── zapálenie vrcholu, keď k nemu dorastie čiara v timeline ── */
.ir-ring .radar-l.lit{stroke:color-mix(in srgb,var(--accent) 75%, transparent);opacity:.9;}
.ir-ring .radar-node.lit{fill:var(--accent);
  filter:drop-shadow(0 0 8px rgba(255,180,60,.9)) drop-shadow(0 0 18px rgba(255,120,10,.6));}
.ir-ring .radar-ember{fill:rgba(255,150,40,.16);stroke:rgba(255,190,90,.5);stroke-width:.8;
  transform-box:fill-box;transform-origin:center;
  animation:emberIgnite .75s cubic-bezier(.22,1,.36,1) both, emberPulse 2.4s ease-in-out .75s infinite;}
@keyframes emberIgnite{
  0%{opacity:0;transform:scale(.25);}
  55%{opacity:1;transform:scale(1.35);}
  100%{opacity:.85;transform:scale(1);}
}
@keyframes emberPulse{
  0%,100%{opacity:.6;transform:scale(1);filter:drop-shadow(0 0 6px rgba(255,150,40,.5));}
  50%{opacity:1;transform:scale(1.12);filter:drop-shadow(0 0 14px rgba(255,170,50,.85));}
}
@media(prefers-reduced-motion:reduce){
  .ir-ring .radar-ember{animation:none;opacity:.8;}
}
.ir-ring .radar-l{transition:stroke .3s, opacity .3s;}
.ir-ring .radar-l.on{stroke:var(--accent);opacity:1;
  filter:drop-shadow(0 0 6px color-mix(in srgb,var(--accent) 70%, transparent));}
.ir-ring .radar-node{transition:fill .3s;}
.ir-ring .radar-node.on{fill:var(--accent);animation:none;
  filter:drop-shadow(0 0 10px color-mix(in srgb,var(--accent) 85%, transparent));}
/* pozor: scale cez samostatnú vlastnosť, aby sa nezrušil anchor transform (.pl-top/.pl-br/…) */
.pillar-label{cursor:pointer;font-family:inherit;transform-origin:center;
  transition:background .3s,color .3s,border-color .3s,box-shadow .3s,scale .3s;}
.pillar-label.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);
  box-shadow:0 0 26px color-mix(in srgb,var(--accent) 55%, transparent);scale:1.08;}
.pillar-label.on i{color:var(--accent-ink);}
.ir-center{animation:irFade .45s ease;max-width:150px;font-weight:700;font-size:.9rem;line-height:1.25;text-align:center;}
.ir-num{display:block;font-style:normal;color:var(--accent);font-size:.7rem;letter-spacing:.28em;margin-bottom:.3rem;}
@keyframes irFade{from{opacity:0;transform:translate(-50%,-46%);}to{opacity:1;transform:translate(-50%,-50%);}}
.pillar-card{transition:border-color .35s, box-shadow .35s;}
.pillar-card.pc-on{border-color:var(--accent);
  box-shadow:0 0 34px color-mix(in srgb,var(--accent) 26%, transparent), 0 18px 44px rgba(0,0,0,.45);}

/* ── O nás: zakladateľ (tilt) ── */
.mv-tilt.founder-card{border-radius:20px;border:1px solid var(--line);background:var(--bg2);
  box-shadow:0 24px 60px rgba(0,0,0,.5), 0 0 46px color-mix(in srgb,var(--accent) 9%, transparent);height:auto;}
.mv-tilt.founder-card img{width:100%;display:block;}
.mv-tilt.founder-card figcaption{padding:.95rem 1.15rem 1.05rem;display:flex;flex-direction:column;gap:.18rem;}
.mv-tilt.founder-card b{font-size:1rem;}
.mv-tilt.founder-card span{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-dim);}

/* ── Video / Dokumenty: sticky split ── */
.video-split{display:grid;grid-template-columns:minmax(0,1fr) 460px;gap:3.2rem;align-items:start;}
.video-side{position:sticky;top:110px;display:flex;flex-direction:column;gap:1.2rem;}
.video-note{margin:0;padding-left:1.1rem;border-left:3px solid var(--accent);
  font-size:.92rem;line-height:1.65;color:var(--fg-dim);}
/* všetky karty rovnako široké aj vysoké — bez schodovitého odsadenia */
.video-cards{display:grid;grid-auto-rows:1fr;gap:1.25rem;}
.vc-item{margin-left:0;display:flex;}
.vc-item .mv-tilt{width:100%;}
.video-card{height:100%;min-height:172px;display:flex;flex-direction:column;}
.video-card .pc-desc{margin-top:auto;}
@media(max-width:960px){
  .video-split{grid-template-columns:1fr;}
  .video-side{position:static;}
}

/* ── Prieskum: vyváženie stĺpcov ── */
.research-side{justify-content:center;}
.research-card{border:1px solid var(--line);border-radius:20px;padding:1.8rem;
  background:color-mix(in srgb,var(--bg2) 70%, transparent);position:relative;overflow:hidden;}
.research-card::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(420px circle at 85% 0%, color-mix(in srgb,var(--accent) 8%, transparent), transparent 60%);}

/* ── Flip Cards (Projekty) ── */
.flip-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;margin-top:2.6rem;}
.flip{perspective:1300px;height:230px;}
.flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;
  transition:transform .75s cubic-bezier(.22,1,.36,1);}
.flip:hover .flip-inner,.flip:focus-within .flip-inner{transform:rotateY(180deg);}
.flip-front,.flip-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;
  border-radius:18px;border:1px solid var(--line);padding:1.35rem;display:flex;flex-direction:column;
  align-items:flex-start;justify-content:flex-end;text-align:left;overflow:hidden;}
.flip-front{background:
  radial-gradient(320px circle at 85% 15%, color-mix(in srgb,var(--accent) 10%, transparent), transparent 60%),
  var(--bg2);}
.flip-front h3{margin:0 0 .3rem;font-size:1.12rem;font-weight:800;letter-spacing:-.01em;color:var(--fg);}
.flip-cat{font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-dim);}
.flip-hint{position:absolute;top:1.1rem;right:1.2rem;font-size:.7rem;font-weight:700;color:var(--accent);
  opacity:.75;letter-spacing:.06em;}
.flip-emblem{position:absolute;top:1rem;left:1.2rem;height:40px;width:auto;opacity:.75;
  filter:drop-shadow(0 0 8px color-mix(in srgb,var(--accent) 45%, transparent));}
/* ── logo klienta + fotka na pozadí karty ── */
.flip-bg{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;
  opacity:.42;transition:opacity .6s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1);}
/* prekryv drží text čitateľný aj nad fotkou */
.flip-front::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(180deg, color-mix(in srgb,var(--bg2) 30%, transparent) 0%,
    color-mix(in srgb,var(--bg2) 82%, transparent) 58%, var(--bg2) 100%);}
.flip:hover .flip-bg{opacity:.62;transform:scale(1.06);}
/* pozor: iba z-index — position sa tu nesmie prepisovať,
   inak emblém aj logo vypadnú z ľavého horného rohu */
.flip-front h3,.flip-cat{position:relative;z-index:2;}
.flip-hint,.flip-emblem,.flip-logo{z-index:2;}
.flip-logo{position:absolute;top:1rem;left:1.2rem;max-height:44px;max-width:56%;
  width:auto;height:auto;object-fit:contain;object-position:left center;opacity:.95;
  filter:drop-shadow(0 2px 10px rgba(0,0,0,.45));transition:opacity .3s;}
.flip:hover .flip-logo{opacity:1;}
.flip-back{transform:rotateY(180deg);justify-content:center;gap:.5rem;
  background:linear-gradient(150deg, color-mix(in srgb,var(--accent-2) 26%, var(--bg2)), var(--bg2) 70%);
  border-color:color-mix(in srgb,var(--accent) 45%, transparent);}
.flip-back h3{margin:0;font-size:1rem;font-weight:800;color:var(--fg);}
.flip-back p{margin:0;font-size:.83rem;line-height:1.55;color:var(--fg-dim);}
.flip-back a{color:var(--accent);text-decoration:none;font-size:.78rem;font-weight:700;letter-spacing:.04em;}
.flip-back a:hover{text-decoration:underline;}
@media(max-width:900px){.flip-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:560px){.flip-grid{grid-template-columns:1fr;}.flip{height:210px;}}

/* ── Coverflow 3D slider ── */
.cf-outer{margin-top:1.6rem;}
.cf-stage{position:relative;max-width:1160px;margin:0 auto;
  height:clamp(560px, 78vw, 760px);
  perspective:1700px;display:flex;align-items:center;justify-content:center;}
.cf-card{position:absolute;width:min(430px,78vw);border-radius:18px;overflow:hidden;
  background:var(--bg2);border:1px solid var(--line);
  box-shadow:0 30px 60px rgba(0,0,0,.55), 0 0 40px color-mix(in srgb,var(--accent) 10%, transparent);
  transition:transform .7s cubic-bezier(.4,0,.2,1),opacity .7s cubic-bezier(.4,0,.2,1),filter .7s cubic-bezier(.4,0,.2,1);
  cursor:pointer;backface-visibility:hidden;}
.cf-card img{width:100%;display:block;}
.cf-meta{padding:.7rem .95rem .85rem;text-align:left;}
.cf-date,.cf-venue{display:block;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim);}
.cf-title{font-size:1rem;font-weight:800;margin:.2rem 0;letter-spacing:-.01em;color:var(--fg);}
.mv-magnet:has(.cf-arrow){position:absolute;left:0;top:calc(50% - 26px);z-index:120;}
.mv-magnet-right:has(.cf-arrow){left:auto;right:0;}
.cf-arrow{width:52px;height:52px;border-radius:50%;border:1px solid var(--line);cursor:pointer;
  background:color-mix(in srgb,var(--bg2) 55%, transparent);backdrop-filter:blur(6px);
  color:var(--fg);font-size:1.5rem;display:grid;place-items:center;transition:background .25s,color .25s,border-color .25s;}
.cf-arrow:hover{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);}
.cf-outer .car-dots{margin-top:1.3rem;}
@media(max-width:640px){.cf-arrow{width:42px;height:42px;}.cf-stage{height:clamp(470px,128vw,600px);}}

/* ── O nás: upratený layout ── */
.onas-grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:4.2rem;align-items:start;}
.onas-main{display:flex;flex-direction:column;}
.onas-main .about-body p{max-width:none;}
/* fotka: užšia a odsadená k pravému okraju, aby nezasahovala do textu ani deliacej linky */
.onas-side{position:sticky;top:104px;display:flex;flex-direction:column;gap:1.15rem;
  width:100%;max-width:330px;justify-self:end;margin-left:auto;}
.side-quote{margin:0;padding:1.05rem 1.2rem;border-left:3px solid var(--accent);
  background:color-mix(in srgb,var(--bg2) 82%, transparent);border-radius:0 14px 14px 0;
  font-family:'Instrument Serif',serif;font-style:italic;font-size:1.08rem;line-height:1.5;color:var(--fg);}
.side-tags{display:flex;flex-wrap:wrap;gap:.5rem;}
.side-tags span{font-size:.64rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
  color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 42%, transparent);
  padding:.32rem .72rem;border-radius:20px;transition:all .25s;}
.side-tags span:hover{background:var(--accent);color:var(--accent-ink);}
@media(max-width:960px){.onas-grid{grid-template-columns:1fr;}.onas-side{position:static;max-width:460px;}}

/* ── Prieskum: dlaždice metód ── */
.research-tiles{display:grid;grid-template-columns:1fr 1fr;gap:1.05rem;width:100%;}
.rt{border:1px solid var(--line);border-radius:16px;padding:1.2rem 1.15rem;
  background:color-mix(in srgb,var(--bg2) 78%, transparent);
  display:flex;flex-direction:column;gap:.5rem;
  transition:border-color .3s, transform .3s, box-shadow .3s;}
.rt:hover{border-color:var(--accent);transform:translateY(-4px);
  box-shadow:0 16px 36px rgba(0,0,0,.42), 0 0 22px color-mix(in srgb,var(--accent) 16%, transparent);}
.rt svg{width:27px;height:27px;stroke:var(--accent);fill:none;stroke-width:1.6;
  stroke-linecap:round;stroke-linejoin:round;
  filter:drop-shadow(0 0 5px color-mix(in srgb,var(--accent) 45%, transparent));}
.rt b{font-size:.95rem;letter-spacing:-.01em;}
.rt span{font-size:.79rem;color:var(--fg-dim);line-height:1.5;}
@media(max-width:520px){.research-tiles{grid-template-columns:1fr;}}

/* ── CTA badge: FEHU logo v ohni ── */
.sec-cta .orbit-badge{width:210px;height:210px;margin-bottom:2.4rem;}
.sec-cta .badge-text{font-size:7.6px;letter-spacing:1.5px;}
.badge-fire{width:116px !important;height:116px !important;overflow:visible !important;
  background:radial-gradient(circle at 50% 42%, #2a1c06, #0c0803 78%) !important;
  box-shadow:0 0 0 1px rgba(244,214,120,.35), 0 0 34px rgba(255,150,40,.45),
    0 0 70px rgba(255,110,20,.25), inset 0 2px 8px rgba(0,0,0,.6);}
/* runa v kruhu zmenšená o 30 % (72% → 50.4%) */
.badge-rune{position:relative;z-index:3;width:50.4%;height:auto;display:block;
  margin:0 auto;animation:runeFire 2.4s ease-in-out infinite;}
@keyframes runeFire{
  0%,100%{filter:drop-shadow(0 0 9px rgba(255,180,60,.85)) drop-shadow(0 0 20px rgba(255,120,10,.5));transform:scale(1);}
  50%{filter:drop-shadow(0 0 17px rgba(255,210,110,1)) drop-shadow(0 0 36px rgba(255,140,20,.8));transform:scale(1.05);}
}
.badge-flame{position:absolute;left:50%;bottom:-14px;transform:translateX(-50%);
  width:150%;height:150%;border-radius:50%;z-index:1;pointer-events:none;
  background:radial-gradient(circle at 50% 78%, rgba(255,170,50,.55), rgba(255,100,10,.22) 42%, transparent 66%);
  filter:blur(6px);animation:flameFlick 1.6s ease-in-out infinite alternate;}
@keyframes flameFlick{
  from{opacity:.6;transform:translateX(-50%) scale(.92) translateY(3px);}
  to{opacity:1;transform:translateX(-50%) scale(1.08) translateY(-3px);}
}

/* ── eyebrow divider vždy iba na šírku textu ── */
.sec .eyebrow{width:fit-content;max-width:100%;}
.vis-text>.eyebrow,.bc-side>.eyebrow,.tl-side>.eyebrow,
.video-side>.eyebrow,.onas-main>.eyebrow{align-self:flex-start;}
.center-wrap>.eyebrow{margin-left:auto;margin-right:auto;}

/* ── text zarovnaný s gridom (Projekty) ── */
.grid-aligned{max-width:none !important;margin-left:0;margin-right:0;text-align:left;}
.grid-aligned p{max-width:none;}

/* ── veľkosti nadpisov ── */
.head-md{font-size:clamp(1.7rem,3.4vw,2.5rem) !important;line-height:1.1;max-width:16ch;}
.head-one{font-size:clamp(1.5rem,3vw,2.55rem) !important;line-height:1.1;
  max-width:none;white-space:nowrap;}
@media(max-width:1100px){.head-one{white-space:normal;}}
.head-md .st-w,.head-one .st-w{margin-right:.24em;}

/* ── Eventy: bez zbytočných medzier, veľký slider ── */
.sec-cases{padding-top:3.4rem;padding-bottom:3.4rem;}
.sec-cases .sub-lead.center-lead{margin-bottom:.4rem;}
.cf-outer{margin-top:0;}
/* výška presne podľa karty (plagát ~16:9 + meta pruh) → žiadne prázdne pásy */
.cf-stage{height:calc(min(470px,80vw) * 0.575 + 105px);}
.cf-card{width:min(470px,80vw);}
.sec-cases .about-body{margin-top:1.6rem !important;}

/* ── Médiá: vzduch nad sekciou ── */
.sec-services{padding-top:7rem !important;padding-bottom:5rem !important;}

/* ── Broadcast + Timeline: zarovnanie vľavo ── */
.sec-data{text-align:left;}
.sec-data .big-head,.sec-data .sub-lead,.sec-data .st-head{margin-left:0;margin-right:0;text-align:left;}
.bc-side .st-head,.tl-side .st-head{text-align:left;}
.sec-timeline{text-align:left;}

/* ── Animated Tabs ── */
.media-tabs-card{text-align:center;}
.mv-tabs{max-width:760px;margin:0 auto;}
.mv-tabs__bar{position:relative;display:inline-flex;gap:.25rem;flex-wrap:wrap;
  background:color-mix(in srgb,var(--card-light-fg) 6%, transparent);
  border:1px solid color-mix(in srgb,var(--card-light-fg) 14%, transparent);
  border-radius:14px;padding:.3rem;margin:0 auto 2rem;}
.mv-tab{position:relative;z-index:1;border:none;background:none;
  color:var(--card-light-dim);padding:.6rem 1.15rem;cursor:pointer;font:inherit;
  font-weight:700;font-size:.85rem;border-radius:10px;transition:color .25s;white-space:nowrap;}
.mv-tab.is-active{color:var(--accent-ink);}
.mv-tabs__indicator{position:absolute;top:.3rem;bottom:.3rem;left:0;border-radius:10px;
  background:var(--accent);box-shadow:0 0 20px color-mix(in srgb,var(--accent) 45%, transparent);
  transition:transform .35s cubic-bezier(.22,1,.36,1),width .35s cubic-bezier(.22,1,.36,1);}
.mv-panel{animation:mvTabsIn .4s cubic-bezier(.22,1,.36,1);text-align:left;
  background:color-mix(in srgb,var(--card-light-fg) 4%, transparent);
  border:1px solid color-mix(in srgb,var(--card-light-fg) 10%, transparent);
  border-radius:16px;padding:1.6rem 1.8rem;min-height:170px;}
@keyframes mvTabsIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.mv-panel-title{margin:0 0 .7rem;font-size:1.25rem;font-weight:800;color:var(--card-light-fg);letter-spacing:-.01em;}
.mv-panel-num{color:var(--accent);font-size:.85rem;font-weight:700;margin-right:.7rem;letter-spacing:.1em;}
.mv-panel-desc{margin:0 0 1.1rem;font-size:.95rem;line-height:1.7;color:var(--card-light-dim);}
.mv-tags{display:flex;gap:.5rem;flex-wrap:wrap;}
.mv-tag{font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 45%, transparent);
  border-radius:20px;padding:.3rem .75rem;}

/* ── Broadcast: split layout ── */
.bc-split{display:grid;grid-template-columns:minmax(280px,430px) minmax(0,1fr);gap:3.2rem;align-items:start;}
.bc-side{display:flex;flex-direction:column;gap:1.2rem;position:sticky;top:110px;}
.bc-acc .mv-acc{margin:0;max-width:none;}
@media(max-width:960px){.bc-split{grid-template-columns:1fr;}.bc-side{position:static;}}

/* ── Accordion ── */
.mv-acc{max-width:840px;margin:1rem auto 0;text-align:left;}
.acc-item{border-bottom:1px solid var(--line);}
.acc-item:first-child{border-top:1px solid var(--line);}
.acc-head{display:flex;justify-content:space-between;align-items:center;gap:1rem;
  padding:1.25rem 0;cursor:pointer;font-weight:800;font-size:1.08rem;letter-spacing:-.01em;color:var(--fg);}
.acc-head::after{content:"+";font-size:1.6rem;font-weight:300;color:var(--accent);
  transition:transform .35s cubic-bezier(.22,1,.36,1);line-height:1;}
.acc-item.is-open .acc-head::after{transform:rotate(45deg);}
.acc-head:hover{color:var(--accent);}
.acc-num{color:var(--accent);font-size:.8rem;font-weight:700;margin-right:.9rem;letter-spacing:.1em;}
.acc-body{overflow:hidden;transition:max-height .4s cubic-bezier(.22,1,.36,1);}
.acc-body p{margin:0 0 1.3rem;color:var(--fg-dim);line-height:1.75;font-size:.95rem;max-width:680px;}

/* ── Timeline (Ako pracujeme) ── */
.sec-timeline{background:linear-gradient(180deg, transparent, color-mix(in srgb,var(--bg2) 55%, transparent) 30%, transparent);}
.tl-wrap{display:grid;grid-template-columns:minmax(280px,430px) minmax(0,1fr);gap:3.4rem;align-items:start;}
.tl-side{display:flex;flex-direction:column;gap:1.2rem;position:sticky;top:110px;}
.mv-timeline{position:relative;padding-left:2.6rem;}
.mv-timeline__line{position:absolute;left:10px;top:6px;bottom:6px;width:2px;
  background:color-mix(in srgb,var(--line) 130%, transparent);border-radius:2px;overflow:hidden;}
.mv-timeline__fill{width:100%;height:0;border-radius:2px;
  background:linear-gradient(var(--accent-2), var(--accent), #ffd27a);
  box-shadow:0 0 12px color-mix(in srgb,var(--accent) 60%, transparent);}
.tl-item{position:relative;padding-bottom:2.5rem;opacity:0;transform:translateY(26px);
  transition:opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1);}
.tl-item:last-child{padding-bottom:.4rem;}
.tl-item::before{content:"";position:absolute;left:-2.6rem;top:.25rem;width:14px;height:14px;margin-left:4px;
  border-radius:50%;background:var(--bg);
  border:3px solid color-mix(in srgb,var(--accent) 30%, transparent);
  transition:box-shadow .9s cubic-bezier(.22,1,.36,1), border-color .9s cubic-bezier(.22,1,.36,1);}
.tl-item.is-visible{opacity:1;transform:none;}
/* zapálenie guličky — spúšťa ho čiara, nie viditeľnosť položky */
.tl-item.is-lit::before{border-color:var(--accent);
  box-shadow:0 0 0 6px color-mix(in srgb,var(--accent) 20%, transparent),
  0 0 16px color-mix(in srgb,var(--accent) 55%, transparent);}
.tl-num{font-size:.68rem;font-weight:800;letter-spacing:.26em;color:var(--accent);}
.tl-item h3{margin:.25rem 0 .45rem;font-size:1.25rem;font-weight:800;letter-spacing:-.01em;}
.tl-item p{margin:0;color:var(--fg-dim);line-height:1.7;font-size:.95rem;max-width:520px;}
@media(max-width:960px){.tl-wrap{grid-template-columns:1fr;}.tl-side{position:static;}}

/* ── Kontakt: glass formulár ── */
.v2-form{width:100%;max-width:620px;margin:0 auto;text-align:left;
  background:color-mix(in srgb,var(--bg) 30%, transparent);
  border:1px solid rgba(255,255,255,.22);border-radius:22px;padding:1.7rem 1.7rem 1.6rem;
  backdrop-filter:blur(14px);box-shadow:0 30px 70px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.18);}
.v2-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.9rem;margin-bottom:1.2rem;}
.v2-field{display:flex;flex-direction:column;gap:.35rem;}
.v2-field.full{grid-column:1 / -1;}
.v2-field>span{font-size:.66rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;
  color:color-mix(in srgb,var(--accent-ink) 75%, transparent);}
.v2-field input,.v2-field select,.v2-field textarea{
  width:100%;box-sizing:border-box;padding:.85rem 1rem;border-radius:12px;font-size:.9rem;font-family:inherit;
  background:color-mix(in srgb,var(--bg2) 92%, transparent);color:var(--fg);
  border:1px solid color-mix(in srgb,var(--accent) 22%, transparent);outline:none;resize:vertical;
  transition:border-color .25s, box-shadow .25s, transform .25s;}
.v2-field input:focus,.v2-field select:focus,.v2-field textarea:focus{
  border-color:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 22%, transparent);
  transform:translateY(-1px);}
.v2-field input::placeholder,.v2-field textarea::placeholder{color:var(--fg-dim);}
.v2-submit{display:inline-flex;align-items:center;gap:.5rem;font-size:.95rem;}
.v2-submit .arr{transition:transform .25s;}
.v2-submit:hover .arr{transform:translateX(5px);}
@media(max-width:560px){.v2-form-grid{grid-template-columns:1fr;}.v2-form{padding:1.3rem;}}

/* ── Footer mega ── */
.v2-footer{position:relative;overflow:hidden;padding-bottom:0;}
.foot-hero{max-width:1100px;margin:0 auto 3.5rem;display:flex;align-items:center;justify-content:space-between;
  gap:2rem;flex-wrap:wrap;padding-bottom:2.6rem;border-bottom:1px solid var(--line);}
.foot-hero-head{margin:0;font-size:clamp(2rem,5vw,3.4rem);font-weight:800;letter-spacing:-.03em;line-height:1.02;}
.v2-footer .foot-col button{transition:color .2s, transform .25s cubic-bezier(.22,1,.36,1);}
.v2-footer .foot-col button:hover{color:var(--accent);transform:translateX(6px);}
.v2-footer .foot-bottom{position:relative;z-index:2;align-items:center;}
/* ── právne odkazy v pätičke ── */
.foot-legal{display:flex;flex-wrap:wrap;gap:.35rem 1.1rem;justify-content:center;}
.foot-legal button{background:none;border:none;padding:0;cursor:pointer;font-family:inherit;
  font-size:.7rem;color:var(--fg-dim);transition:color .22s;}
.foot-legal button:hover{color:var(--accent);text-decoration:underline;text-underline-offset:3px;}
@media(max-width:720px){.v2-footer .foot-bottom{justify-content:center;text-align:center;}}
/* (obrie textové FEHU v pätičke odstránené) */
/* ── plávajúci scroll-top s kruhovým progresom ── */
.stf{position:fixed;right:20px;bottom:66px;z-index:998;width:52px;height:52px;padding:0;
  border-radius:50%;border:0;cursor:pointer;display:grid;place-items:center;
  background:color-mix(in srgb,var(--bg2) 92%, transparent);backdrop-filter:blur(8px);
  box-shadow:0 10px 30px rgba(0,0,0,.5), 0 0 0 1px color-mix(in srgb,var(--accent) 22%, transparent);
  opacity:0;transform:translateY(14px) scale(.85);pointer-events:none;
  transition:opacity .35s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1), box-shadow .3s;}
.stf.on{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}
.stf:hover{box-shadow:0 12px 34px rgba(0,0,0,.55), 0 0 26px color-mix(in srgb,var(--accent) 45%, transparent),
  0 0 0 1px var(--accent);}
.stf-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);}
.stf-track{fill:none;stroke:color-mix(in srgb,var(--accent) 16%, transparent);stroke-width:2.5;}
.stf-bar{fill:none;stroke:var(--accent);stroke-width:2.5;stroke-linecap:round;
  transition:stroke-dashoffset .12s linear;
  filter:drop-shadow(0 0 5px color-mix(in srgb,var(--accent) 65%, transparent));}
.stf-arrow{position:relative;z-index:1;color:var(--accent);font-size:1.2rem;line-height:1;transition:transform .25s;}
.stf:hover .stf-arrow{transform:translateY(-2px);}
@media(max-width:640px){.stf{right:14px;bottom:72px;width:46px;height:46px;}}

/* ── jednoriadkové nadpisy v bočných stĺpcoch ── */
.bc-side .st-head,.tl-side .st-head,.video-side .st-head{
  font-size:clamp(1.45rem,2.5vw,2.05rem) !important;line-height:1.12;}
@media(min-width:961px){
  .bc-side .st-head,.tl-side .st-head{white-space:nowrap;}
}
`;
