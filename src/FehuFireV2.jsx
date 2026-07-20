import { useState, useEffect, useRef, useCallback } from "react";
import { POSTERS, LOGO_EMBLEM, LOGO_FULL, MENU, FehuOrbital, CSS } from "./FehuFire.jsx";

/* ============================================================
   FEHU — VERZIA 2 · komponenty z COMPONENT SITE
   • Cursor Trail (ohnivá stopa za kurzorom)
   • Scroll Progress (gradient lišta hore)
   • Magnetic Button (CTA tlačidlá)
   • Interaktívny radar 5 pilierov (hover/klik + auto-cyklus)
   • Card 3D Tilt (piliere + video dokumenty + foto zakladateľa)
   • Flip Cards (Projekty)
   • Coverflow 3D slider (Eventy — RFA plagáty)
   • Animated Tabs (Médiá) · Accordion (Broadcast)
   • Footer-mega štýl (reveal, hover-slide linky, giant logo, scroll-top)
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
      for (let i = 0; i < 3; i++) {
        parts.push({
          x: e.clientX + (Math.random() - .5) * 8,
          y: e.clientY + (Math.random() - .5) * 8,
          vx: (Math.random() - .5) * .9,
          vy: (Math.random() - .5) * .9 - .45,
          size: Math.random() * 2.6 + 1.4,
          hue: 22 + Math.random() * 20,
        });
      }
      if (parts.length > 160) parts.splice(0, parts.length - 160);
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        ctx.fillStyle = `hsla(${p.hue},95%,${48 + Math.random() * 16}%,${Math.min(1, p.size / 3)})`;
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
      `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,190,80,.20), transparent 55%)`;
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

/* ---- Interaktívny radar 5 pilierov ---- */
function InteractiveRadar({ items, active, setActive }) {
  const locked = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      if (!locked.current) setActive(a => (a + 1) % items.length);
    }, 2600);
    return () => clearInterval(t);
  }, [items.length, setActive]);

  return (
    <div className="pillars">
      <div className="pillar-ring ir-ring"
        onPointerEnter={() => { locked.current = true; }}
        onPointerLeave={() => { locked.current = false; }}>
        <svg viewBox="0 0 400 400" className="radar">
          <circle cx="200" cy="200" r="160" className="radar-c"/>
          <circle cx="200" cy="200" r="110" className="radar-c"/>
          <circle cx="200" cy="200" r="60" className="radar-c"/>
          {items.map((_, i) => {
            const a = (-90 + i * 72) * Math.PI / 180;
            return <line key={i} x1="200" y1="200"
              x2={200 + Math.cos(a) * 160} y2={200 + Math.sin(a) * 160}
              className={`radar-l ${active === i ? "on" : ""}`}/>;
          })}
          {items.map((_, i) => {
            const a = (-90 + i * 72) * Math.PI / 180;
            const cx = 200 + Math.cos(a) * 160, cy = 200 + Math.sin(a) * 160;
            return (
              <g key={i} className="ir-node-g" style={{ cursor: "pointer" }}
                onPointerEnter={() => setActive(i)} onClick={() => setActive(i)}>
                <circle cx={cx} cy={cy} r="26" fill="transparent" />
                <circle cx={cx} cy={cy} r={active === i ? 13 : 9}
                  className={`radar-node ${active === i ? "on" : ""}`}/>
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

/* ---- Flip Cards — Projekty (component site: flip-card + glare) ---- */
function FlipCard({ p, delay }) {
  return (
    <div className="flip rv-scale" style={{ transitionDelay: `${delay}ms` }}>
      <div className="flip-inner">
        <div className="flip-front">
          <img className="flip-emblem" src={LOGO_EMBLEM} alt="" aria-hidden="true" />
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
  { t: "RFA – Real Fight Arena", cat: "Šport · Eventy · Broadcast", d: "Kompletná vizuálna identita, promo kampane, event branding, video produkcia a broadcast pre najväčšiu MMA organizáciu na Slovensku." },
  { t: "Hip Hop Žije Festival", cat: "Hudba · Festival", d: "Najväčší hip-hopový festival na Slovensku — marketing, médiá a jubilejný dokument 10 rokov Hip Hop Žije." },
  { t: "XBIO", cat: "E-commerce · Brand", d: "Budovanie značky a výkonnostný marketing pre e-shop so zdravou výživou.", url: "https://www.xbio.sk" },
  { t: "ThaiSpot", cat: "Gastronómia · Marketing", d: "Marketing a budovanie značky pre autentickú thajskú gastronómiu.", url: "https://www.thaispot.sk" },
  { t: "Alchymista Bar", cat: "Gastro · Eventy", d: "Branding, eventy a profesionálny bar catering v spolupráci so skúseným tímom." },
  { t: "GS Group Company", cat: "Distribúcia · B2B", d: "Veľkoobchod a distribúcia nápojov pre reštaurácie, hotely, bary a gastro prevádzky." },
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

/* ============================================================ */
export default function FehuFireV2() {
  const [dark, setDark] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [activePillar, setActivePillar] = useState(0);
  const sectionRefs = useRef({});

  const scrollTo = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const setRef = (id) => (el) => { sectionRefs.current[id] = el; };

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
      <style>{CSS}{V2_CSS}</style>
      <ScrollProgress />
      <CursorTrail />

      {/* NAV */}
      <nav className="nav">
        <div className="logo" onClick={() => scrollTo("top")}><img className="logo-rune-img logo-wide-img" src="/logo-wide.png" alt="FEHU Prosperity" /></div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={() => setDark(d => !d)} aria-label="Prepnúť tému">
            {dark ? "☀" : "☾"}
          </button>
          <Magnetic strength={10}><button className="nav-cta" onClick={() => scrollTo("kontakt")}>Začať</button></Magnetic>
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
              Začať <span className="arr">→</span>
            </button>
          </Magnetic>
          <div className="scroll-hint" onClick={() => scrollTo("strategia")}>
            <span>Posunúť nadol</span><span className="arr-down">↓</span>
          </div>
        </div>
      </header>

      {/* O NÁS */}
      <section className="sec sec-about" ref={setRef("onas")}>
        <div className="wrap">
          <p className="eyebrow rv">O nás</p>
          <div className="rv" style={{transitionDelay:"80ms"}}><h2 className="big-head">
            Budujeme <span className="serif-it">úspešné</span> firmy a silné značky.
          </h2></div>
          <p className="sub-lead rv" style={{transitionDelay:"140ms"}}>
            <b>Fehu Prosperity</b> je spoločnosť zameraná na budovanie úspešných firiem, silných značiek
            a dlhodobo udržateľného rastu. Poskytujeme komplexné služby v oblasti biznis stratégie,
            marketingu, manažmentu, budovania značiek, prieskumu trhu, tvorby video obsahu
            a profesionálnej prípravy dokumentov.
          </p>
          <blockquote className="about-quote rv" style={{transitionDelay:"200ms"}}>
            „Od nápadu cez stratégiu až po finálnu realizáciu – všetko pod jednou strechou.“
          </blockquote>
          <div className="about-grid rv" style={{transitionDelay:"260ms"}}>
          <div className="about-body">
            <p>Veríme, že úspešná značka nevzniká náhodou. Je výsledkom jasnej vízie, premyslenej stratégie,
            kvalitnej komunikácie a dôslednej realizácie. Preto ku každému projektu pristupujeme individuálne
            a navrhujeme riešenia, ktoré prinášajú reálne výsledky a dlhodobú hodnotu.</p>
            <p>Za spoločnosťou stojí podnikateľ <b>Boris Marhanský</b>, ktorý počas svojej podnikateľskej kariéry
            vybudoval a rozvíjal viaceré úspešné projekty. Jeho skúsenosti z oblasti podnikania, marketingu,
            manažmentu a budovania značiek tvoria základ filozofie Fehu Prosperity – byť partnerom, ktorý
            nielen radí, ale aktívne pomáha meniť vízie na úspešné projekty.</p>
            <p>Našim klientom pomáhame vytvárať silnú identitu značky, nastavovať efektívne obchodné
            a marketingové stratégie, analyzovať trh a identifikovať nové príležitosti na rast. Zároveň
            zabezpečujeme tvorbu profesionálnych videí, reklamných kampaní, prezentačných materiálov
            a obchodných dokumentov, ktoré podporujú dôveryhodnosť značky a zvyšujú jej hodnotu.</p>
            <p>Spájame kreativitu, strategické myslenie, moderné technológie a praktické skúsenosti.
            Naším cieľom je vytvárať riešenia, ktoré nielen dobre vyzerajú, ale predovšetkým fungujú
            a prinášajú merateľné výsledky.</p>
            <p><b>Fehu Prosperity</b> je partner pre podnikateľov, startupy aj etablované spoločnosti,
            ktoré chcú rásť, budovať silnú značku a uspieť v dynamickom podnikateľskom prostredí.</p>
          </div>
          <Tilt className="founder-card" max={6} scale={1.02}>
            <img src="/boris-marhansky.jpg" alt="Boris Marhanský — zakladateľ Fehu Prosperity" loading="lazy" />
            <figcaption><b>Boris Marhanský</b><span>Zakladateľ · Fehu Prosperity</span></figcaption>
          </Tilt>
          </div>
        </div>
      </section>

      {/* STRATÉGIA — interaktívny radar + tilt karty */}
      <section className="sec sec-strategy" ref={setRef("strategia")}>
        <div className="wrap">
          <div className="rv"><h2 className="big-head">
            Dátami riadené, na výkon zamerané<br/>
            <span className="serif-it">rastové</span> biznisové riešenia.
          </h2></div>
          <div className="rv" style={{transitionDelay:"100ms"}}><p className="sub-lead">
            Naše riešenia pomohli firmám každej veľkosti rásť rýchlejšie — bez ohľadu
            na odvetvie či model príjmov.
          </p></div>

          <InteractiveRadar items={PILLARS} active={activePillar} setActive={setActivePillar} />

          <div className="pillar-cards">
            {PILLARS.map((p,i)=>(
              <div className="rv-scale tilt-holder" style={{transitionDelay:`${i*100}ms`}} key={i}
                onPointerEnter={() => setActivePillar(i)}>
                <Tilt className={`pillar-card ${activePillar === i ? "pc-on" : ""}`}>
                  <span className="pc-num">{p.n}</span>
                  <h4 className="pc-title">{p.t}</h4>
                  <p className="pc-desc">{p.d}</p>
                </Tilt>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO / DOKUMENTY — 3D tilt karty */}
      <section className="sec sec-about" ref={setRef("video")}>
        <div className="wrap">
          <p className="eyebrow rv">Video / dokumenty</p>
          <div className="rv" style={{transitionDelay:"80ms"}}><h2 className="big-head">
            Skutočné príbehy so <span className="serif-it">silným</span> spracovaním.
          </h2></div>
          <p className="sub-lead rv" style={{transitionDelay:"140ms"}}>
            <b>Fehu Prosperity</b> sa venuje tvorbe dokumentárnych filmov a video dokumentov, ktoré zachytávajú
            skutočné príbehy, významné osobnosti a jedinečné udalosti. Každý projekt realizujeme od prvotného
            konceptu cez scenár, produkciu a natáčanie až po finálnu postprodukciu.
          </p>
          <div className="pillar-cards" style={{marginTop:"1rem"}}>
            {DOC_CARDS.map((p,i)=>(
              <div className="rv-scale tilt-holder" style={{transitionDelay:`${i*100}ms`}} key={i}>
                <Tilt className="pillar-card">
                  <span className="pc-num">{p.n}</span>
                  <h4 className="pc-title">{p.t}</h4>
                  <p className="pc-desc">{p.d}</p>
                </Tilt>
              </div>
            ))}
          </div>
          <div className="about-body rv" style={{marginTop:"2.5rem"}}>
            <p>Naším cieľom je vytvárať dokumentárny obsah s vysokou produkčnou kvalitou, silným príbehom
            a vizuálnym spracovaním, ktoré osloví divákov a zanechá trvalý dojem.</p>
          </div>
        </div>
      </section>

      {/* PRIESKUM TRHU */}
      <section className="sec sec-visual" ref={setRef("prieskum")}>
        <div className="wrap vis-wrap">
          <div className="vis-text rv-l">
            <p className="eyebrow" style={{textAlign:"left", margin:0}}>Prieskum trhu</p>
            <h2 className="big-head">
              Rozhodnutia postavené na <span className="serif-it">dátach</span>,<br/>nie na domnienkach.
            </h2>
            <p className="sub-lead" style={{margin:0}}>
              Pre našich klientov realizujeme profesionálne prieskumy trhu, ktoré poskytujú
              reálny pohľad na názory, správanie a potreby cieľovej skupiny.
            </p>
            <ul className="vis-list">
              <li>Prieskumy prostredníctvom call centra</li>
              <li>Osobné rozhovory v teréne</li>
              <li>Vyškolení anketári v uliciach a na vybraných miestach</li>
              <li>Analýza, vyhodnotenie a praktické odporúčania</li>
            </ul>
          </div>
          <div className="vis-text rv-r research-side" style={{transitionDelay:"150ms"}}>
            <div className="research-card">
              <div className="about-body">
                <p>Na základe výsledkov prieskumu pomáhame klientom efektívnejšie nastavovať marketingové kampane,
                budovať značku, uvádzať nové produkty na trh, lepšie porozumieť svojim zákazníkom a vytvárať
                biznis stratégie založené na reálnych dátach.</p>
                <p>Naším cieľom nie je len zbierať informácie, ale poskytovať <b>kvalitné analýzy</b>, ktoré klientom
                pomáhajú prijímať správne rozhodnutia, minimalizovať riziká a dosahovať lepšie obchodné výsledky.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJEKTY — flip karty */}
      <section className="sec sec-clients" ref={setRef("projekty")}>
        <div className="wrap center-wrap">
          <p className="eyebrow rv">Projekty</p>
          <div className="rv" style={{transitionDelay:"80ms"}}><h2 className="big-head">
            Projekty, na ktorých <span className="serif-it">spolupracujeme</span>.
          </h2></div>
          <div className="rv" style={{transitionDelay:"160ms"}}><p className="sub-lead center-lead">
            Naše skúsenosti sme získavali pri spolupráci na úspešných projektoch z oblasti športu, médií,
            e-commerce, distribúcie, gastronómie a podnikania. Prejdite kurzorom po karte a spoznajte detail.
          </p></div>

          <div className="flip-grid">
            {PROJECTS.map((p, i) => <FlipCard p={p} delay={i * 80} key={i} />)}
          </div>

          <div className="about-body rv" style={{margin:"2.8rem auto 0", textAlign:"left"}}>
            <p>Tieto spolupráce predstavujú spojenie stratégie, marketingu, brandingu, video produkcie,
            prieskumu trhu a projektového manažmentu. Každý projekt vnímame ako dlhodobé partnerstvo,
            ktorého cieľom je vytvárať merateľné výsledky, posilňovať značku a podporovať rast našich klientov.</p>
            <p>Vo <b>Fehu Prosperity</b> veríme, že úspech vzniká spojením kvalitnej stratégie, kreativity
            a precíznej realizácie. Práve preto sa usilujeme byť partnerom, ktorý svojim klientom prináša
            skutočnú hodnotu a pomáha im dosahovať ich dlhodobé ciele.</p>
          </div>
        </div>
      </section>

      {/* EVENTY — coverflow 3D slider */}
      <section className="sec sec-cases" ref={setRef("eventy")}>
        <div className="wrap">
          <p className="eyebrow rv">Eventy</p>
          <div className="rv" style={{transitionDelay:"80ms"}}><h2 className="big-head center">
            Podujatia <span className="serif-it">na kľúč</span> — od konceptu po deň D
          </h2></div>
          <div className="rv" style={{transitionDelay:"160ms"}}><p className="sub-lead center-lead">
            Zabezpečujeme kompletnú organizáciu podujatí na kľúč. Špecializujeme sa na športové podujatia,
            hudobné festivaly a koncerty, firemné eventy, konferencie, galavečery, VIP podujatia aj promo akcie.
          </p></div>

          <Coverflow items={POSTERS} />

          <div className="about-body rv" style={{margin:"2.6rem auto 0"}}>
            <p>Postaráme sa o <b>kompletný produkčný servis</b> vrátane plánovania, koordinácie, technického
            zabezpečenia, personálu, logistiky a komunikácie s partnermi.</p>
            <p>Súčasťou našich služieb je aj profesionálny <b>bar catering</b> — kompletné nápojové riešenia,
            mobilné bary, profesionálni barmani a individuálna ponuka prispôsobená charakteru podujatia.</p>
            <p>Naším cieľom je vytvárať podujatia, ktoré sú dokonale zorganizované, reprezentujú značku klienta
            na najvyššej úrovni a zanechávajú nezabudnuteľný zážitok u každého účastníka.</p>
          </div>
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

      {/* BROADCAST & PODCAST — accordion */}
      <section className="sec sec-data" ref={setRef("broadcast")}>
        <div className="wrap">
          <p className="eyebrow rv" style={{textAlign:"left"}}>Broadcast & Podcast</p>
          <div className="rv" style={{transitionDelay:"80ms"}}><h2 className="big-head">
            Naživo aj <span className="serif-it">na mieru</span>.
          </h2></div>
          <div className="rv" style={{transitionDelay:"160ms"}}><p className="sub-lead">
            Zabezpečujeme profesionálnu produkciu živých vysielaní, online prenosov a podcastov na mieru.
            Vďaka moderným technológiám a skúsenému produkčnému tímu vytvoríme riešenie prispôsobené
            potrebám každého klienta.
          </p></div>
          <div className="rv" style={{transitionDelay:"220ms"}}>
            <Accordion items={BROADCAST_ITEMS} />
          </div>
        </div>
      </section>

      {/* CTA — kontakt (glass formulár) */}
      <section className="sec sec-cta" ref={setRef("kontakt")}>
        <div className="orbit-badge">
          <svg viewBox="0 0 120 120" className="badge-ring">
            <defs><path id="cir2" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
            <text className="badge-text"><textPath href="#cir2" startOffset="0">RÁSŤ · STRATÉGIA · OPTIMALIZÁCIA · KONVERTOVAŤ · </textPath></text>
          </svg>
          <div className="badge-core">
            <svg viewBox="0 0 24 24" className="globe"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
          </div>
        </div>
        <p className="cta-eyebrow rv" style={{transitionDelay:"0ms"}}>Poďme na obežnú dráhu</p>
        <h2 className="cta-head rv" style={{transitionDelay:"100ms"}}>
          Posuňme vašu firmu <span className="serif-it">roky dopredu</span>.
        </h2>
        <p className="cta-sub rv" style={{transitionDelay:"180ms"}}>Bezplatná konzultácia do 48 hodín. Žiadne záväzky.</p>

        <div className="v2-form rv" style={{transitionDelay:"260ms"}}>
          <div className="v2-form-grid">
            <label className="v2-field">
              <span>Meno a priezvisko</span>
              <input placeholder="Ján Novák" />
            </label>
            <label className="v2-field">
              <span>E-mail / telefón</span>
              <input placeholder="jan@firma.sk" />
            </label>
            <label className="v2-field full">
              <span>Typ spolupráce</span>
              <select defaultValue="">
                <option value="" disabled>Vyberte oblasť…</option>
                <option>Video / dokumenty</option>
                <option>Prieskum trhu</option>
                <option>Eventy</option>
                <option>Médiá</option>
                <option>Broadcast & Podcast</option>
                <option>Komplexná spolupráca</option>
              </select>
            </label>
            <label className="v2-field full">
              <span>Správa</span>
              <textarea rows={4} placeholder="Povedzte nám o vašom projekte…" />
            </label>
          </div>
          <Magnetic>
            <button className="cta-btn v2-submit">Odoslať dopyt <span className="arr">→</span></button>
          </Magnetic>
        </div>

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
            <div className="foot-form">
              <input className="foot-input" placeholder="Váš e-mail" aria-label="E-mail" />
              <button className="foot-submit" aria-label="Odoslať">→</button>
            </div>
          </div>
          <div className="foot-cols">
            <div className="foot-col rv" style={{transitionDelay:"140ms"}}>
              <h4>Služby</h4>
              <button onClick={()=>scrollTo("video")}>Video / dokumenty</button>
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
              <button onClick={()=>window.open("mailto:office@fehuprosperity.eu")}>office@fehuprosperity.eu</button>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} FEHU. Všetky práva vyhradené.</span>
          <span>Bratislava · Praha · Viedeň</span>
        </div>
        <Magnetic strength={12} className="scroll-top-holder">
          <button className="scroll-top" onClick={() => scrollTo("top")} aria-label="Späť hore">↑</button>
        </Magnetic>
        <div className="foot-giant" aria-hidden="true">FEHU</div>
      </footer>
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

/* ── Card 3D Tilt ── */
.mv-tilt{position:relative;transform-style:preserve-3d;will-change:transform;
  transition:transform .25s ease-out;overflow:hidden;height:100%;}
.mv-tilt__glare{position:absolute;inset:0;pointer-events:none;border-radius:inherit;}
.tilt-holder{display:flex;}
.tilt-holder .pillar-card{flex:1;}

/* ── Interaktívny radar ── */
.ir-ring .radar-l{transition:stroke .3s, opacity .3s;}
.ir-ring .radar-l.on{stroke:var(--accent);opacity:1;
  filter:drop-shadow(0 0 6px color-mix(in srgb,var(--accent) 70%, transparent));}
.ir-ring .radar-node{transition:fill .3s;}
.ir-ring .radar-node.on{fill:var(--accent);animation:none;
  filter:drop-shadow(0 0 10px color-mix(in srgb,var(--accent) 85%, transparent));}
.pillar-label{cursor:pointer;transition:background .3s,color .3s,border-color .3s,box-shadow .3s,transform .3s;font-family:inherit;}
.pillar-label.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);
  box-shadow:0 0 26px color-mix(in srgb,var(--accent) 55%, transparent);transform:translate(0,0) scale(1.08);}
.pillar-label.on i{color:var(--accent-ink);}
.ir-center{animation:irFade .45s ease;max-width:150px;font-weight:700;font-size:.9rem;line-height:1.25;text-align:center;}
.ir-num{display:block;font-style:normal;color:var(--accent);font-size:.7rem;letter-spacing:.28em;margin-bottom:.3rem;}
@keyframes irFade{from{opacity:0;transform:translate(-50%,-46%);}to{opacity:1;transform:translate(-50%,-50%);}}
.pillar-card{transition:border-color .35s, box-shadow .35s;}
.pillar-card.pc-on{border-color:var(--accent);
  box-shadow:0 0 34px color-mix(in srgb,var(--accent) 26%, transparent), 0 18px 44px rgba(0,0,0,.45);}

/* ── O nás: zakladateľ (tilt) ── */
.v2-footer, .founder-card{}
.mv-tilt.founder-card{border-radius:20px;border:1px solid var(--line);background:var(--bg2);
  box-shadow:0 24px 60px rgba(0,0,0,.5), 0 0 46px color-mix(in srgb,var(--accent) 9%, transparent);height:auto;}
.mv-tilt.founder-card img{width:100%;display:block;}
.mv-tilt.founder-card figcaption{padding:.95rem 1.15rem 1.05rem;display:flex;flex-direction:column;gap:.18rem;}
.mv-tilt.founder-card b{font-size:1rem;}
.mv-tilt.founder-card span{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-dim);}

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
.cf-stage{position:relative;max-width:980px;margin:0 auto;
  height:clamp(500px, 66vw, 620px);
  perspective:1600px;display:flex;align-items:center;justify-content:center;}
.cf-card{position:absolute;width:min(340px,70vw);border-radius:18px;overflow:hidden;
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
@media(max-width:640px){.cf-arrow{width:42px;height:42px;}.cf-stage{height:clamp(430px,120vw,560px);}}

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

/* ── Accordion ── */
.mv-acc{max-width:840px;margin:1rem auto 0;text-align:left;}
.acc-item{border-bottom:1px solid var(--line);}
.acc-head{display:flex;justify-content:space-between;align-items:center;gap:1rem;
  padding:1.25rem 0;cursor:pointer;font-weight:800;font-size:1.08rem;letter-spacing:-.01em;color:var(--fg);}
.acc-head::after{content:"+";font-size:1.6rem;font-weight:300;color:var(--accent);
  transition:transform .35s cubic-bezier(.22,1,.36,1);line-height:1;}
.acc-item.is-open .acc-head::after{transform:rotate(45deg);}
.acc-head:hover{color:var(--accent);}
.acc-num{color:var(--accent);font-size:.8rem;font-weight:700;margin-right:.9rem;letter-spacing:.1em;}
.acc-body{overflow:hidden;transition:max-height .4s cubic-bezier(.22,1,.36,1);}
.acc-body p{margin:0 0 1.3rem;color:var(--fg-dim);line-height:1.75;font-size:.95rem;max-width:680px;}

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
.v2-footer .foot-bottom{position:relative;z-index:2;}
.foot-giant{font-size:clamp(7rem,24vw,21rem);font-weight:900;line-height:.78;text-align:center;
  letter-spacing:.02em;user-select:none;pointer-events:none;margin-top:1.5rem;
  color:transparent;-webkit-text-stroke:1px color-mix(in srgb,var(--accent) 26%, transparent);
  background:linear-gradient(180deg, color-mix(in srgb,var(--accent) 14%, transparent), transparent 85%);
  -webkit-background-clip:text;background-clip:text;}
.scroll-top-holder{position:absolute;right:1.8rem;bottom:5.2rem;z-index:5;}
.scroll-top{width:48px;height:48px;border-radius:50%;border:1px solid var(--line);cursor:pointer;
  background:var(--bg2);color:var(--accent);font-size:1.25rem;display:grid;place-items:center;
  transition:all .25s;box-shadow:0 10px 30px rgba(0,0,0,.4);}
.scroll-top:hover{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);
  box-shadow:0 0 28px color-mix(in srgb,var(--accent) 50%, transparent);}
@media(max-width:640px){.scroll-top-holder{right:1rem;bottom:6rem;}}
`;
