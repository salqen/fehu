import { useState, useEffect, useRef, useCallback } from "react";
import { POSTERS, LOGO_EMBLEM, LOGO_FULL, MENU, FehuOrbital, CSS } from "./FehuFire.jsx";

/* ============================================================
   FEHU — VERZIA 2 · komponenty z COMPONENT SITE
   • Card 3D Tilt (piliere stratégie + video dokumenty)
   • Bento Grid so spotlight hoverom (Projekty)
   • Coverflow 3D slider (Eventy — RFA plagáty)
   • Animated Tabs s klzavým indikátorom (Médiá)
   • Accordion s plynulou výškou (Broadcast & Podcast)
   Všetko adaptované do ohnivej FEHU palety.
   ============================================================ */

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

/* ---- Coverflow 3D slider (component site: slider-3-coverflow) ---- */
function Coverflow({ items }) {
  const [active, setActive] = useState(0);
  const timer = useRef(null);
  const total = items.length;
  const restart = useCallback(() => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setActive(a => (a + 1) % total), 3800);
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
            transform: `translateX(${off * 62}%) rotateY(${off * -38}deg) scale(${off === 0 ? 1 : .78 - abs * .04})`,
            zIndex: 100 - abs,
            opacity: abs > 2 ? 0 : 1 - abs * .18,
            filter: off === 0 ? "none" : "brightness(.5)",
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
        <button className="cf-arrow left" onClick={() => go(active - 1)} aria-label="Predošlý">‹</button>
        <button className="cf-arrow right" onClick={() => go(active + 1)} aria-label="Ďalší">›</button>
      </div>
      <div className="car-dots">
        {items.map((_, i) => (
          <button key={i} className={`car-dot ${i === active ? "on" : ""}`} onClick={() => go(i)} aria-label={`Plagát ${i + 1}`} />
        ))}
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
    const t = setTimeout(measure, 350); // po načítaní fontov
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

const BENTO = [
  { size: "big", t: "RFA – Real Fight Arena", d: "Kompletná vizuálna identita, promo kampane, event branding, video produkcia a broadcast pre najväčšiu MMA organizáciu na Slovensku." },
  { size: "", t: "Hip Hop Žije Festival", d: "Najväčší hip-hopový festival na Slovensku." },
  { size: "", t: "XBIO", d: "E-commerce a budovanie značky.", url: "https://www.xbio.sk" },
  { size: "wide", t: "GS Group Company", d: "Veľkoobchod a distribúcia nápojov pre reštaurácie, hotely, bary a gastro prevádzky." },
  { size: "", t: "ThaiSpot", d: "Gastronómia a marketing.", url: "https://www.thaispot.sk" },
  { size: "", t: "Alchymista Bar", d: "Branding a eventy." },
];

/* ============================================================ */
export default function FehuFireV2() {
  const [dark, setDark] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const sectionRefs = useRef({});
  const bentoRef = useRef(null);

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

  /* bento spotlight (component site: bento-grid) */
  const onBentoMove = (e) => {
    bentoRef.current?.querySelectorAll(".cell").forEach(c => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--bx", `${e.clientX - r.left}px`);
      c.style.setProperty("--by", `${e.clientY - r.top}px`);
    });
  };

  return (
    <div className={`fehu ${dark ? "dark" : "light"}`}>
      <style>{CSS}{V2_CSS}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="logo" onClick={() => scrollTo("top")}><img className="logo-rune-img logo-wide-img" src="/logo-wide.png" alt="FEHU Prosperity" /></div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={() => setDark(d => !d)} aria-label="Prepnúť tému">
            {dark ? "☀" : "☾"}
          </button>
          <button className="nav-cta" onClick={() => scrollTo("kontakt")}>Začať</button>
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
          <button className="hero-btn" onClick={() => scrollTo("kontakt")}>
            Začať <span className="arr">→</span>
          </button>
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
          <div className="about-body rv" style={{transitionDelay:"260ms"}}>
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
        </div>
      </section>

      {/* STRATÉGIA — piliere s 3D tilt kartami */}
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
          <div className="pillars">
            <div className="pillar-ring">
              <svg viewBox="0 0 400 400" className="radar">
                <circle cx="200" cy="200" r="160" className="radar-c"/>
                <circle cx="200" cy="200" r="110" className="radar-c"/>
                <circle cx="200" cy="200" r="60" className="radar-c"/>
                {[0,1,2,3,4].map(i=>{
                  const a = (-90 + i*72) * Math.PI/180;
                  return <line key={i} x1="200" y1="200" x2={200+Math.cos(a)*160} y2={200+Math.sin(a)*160} className="radar-l"/>;
                })}
                {[0,1,2,3,4].map(i=>{
                  const a = (-90 + i*72) * Math.PI/180;
                  return <circle key={i} cx={200+Math.cos(a)*160} cy={200+Math.sin(a)*160} r="9" className="radar-node"/>;
                })}
              </svg>
              <div className="ring-center-label">5 pilierov<br/>rastu</div>
              {PILLARS.map((p,i)=>{
                const a = (-90 + i*72) * Math.PI/180;
                const x = 50 + Math.cos(a)*46, y = 50 + Math.sin(a)*46;
                const anchor = ["pl-top","pl-right","pl-br","pl-bl","pl-left"][i];
                return <span key={i} className={`pillar-label ${anchor}`} style={{left:`${x}%`,top:`${y}%`}}>
                  <i>{p.n}</i>{p.t}
                </span>;
              })}
            </div>
          </div>

          <div className="pillar-cards">
            {PILLARS.map((p,i)=>(
              <div className="rv-scale tilt-holder" style={{transitionDelay:`${i*100}ms`}} key={i}>
                <Tilt className="pillar-card">
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
          <div className="vis-text rv-r" style={{transitionDelay:"150ms", justifyContent:"center"}}>
            <div className="about-body">
              <p>Na základe výsledkov prieskumu pomáhame klientom efektívnejšie nastavovať marketingové kampane,
              budovať značku, uvádzať nové produkty na trh, lepšie porozumieť svojim zákazníkom a vytvárať
              biznis stratégie založené na reálnych dátach.</p>
              <p>Naším cieľom nie je len zbierať informácie, ale poskytovať <b>kvalitné analýzy</b>, ktoré klientom
              pomáhajú prijímať správne rozhodnutia, minimalizovať riziká a dosahovať lepšie obchodné výsledky.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROJEKTY — bento grid so spotlight hoverom */}
      <section className="sec sec-clients" ref={setRef("projekty")}>
        <div className="wrap center-wrap">
          <p className="eyebrow rv">Projekty</p>
          <div className="rv" style={{transitionDelay:"80ms"}}><h2 className="big-head">
            Projekty, na ktorých <span className="serif-it">spolupracujeme</span>.
          </h2></div>
          <div className="rv" style={{transitionDelay:"160ms"}}><p className="sub-lead center-lead">
            Naše skúsenosti sme získavali pri spolupráci na úspešných projektoch z oblasti športu, médií,
            e-commerce, distribúcie, gastronómie a podnikania. Každému klientovi prinášame individuálny prístup,
            strategické myslenie a riešenia zamerané na dlhodobý rast a budovanie silnej značky.
          </p></div>

          <div className="mv-bento rv" ref={bentoRef} onPointerMove={onBentoMove} style={{transitionDelay:"220ms"}}>
            {BENTO.map((b,i)=>(
              <div className={`cell ${b.size}`} key={i}>
                <h3>{b.t}</h3>
                <p>{b.d}</p>
                {b.url && <a href={b.url} target="_blank" rel="noreferrer">{b.url.replace("https://","")} →</a>}
                <img className="bento-emblem" src={LOGO_EMBLEM} alt="" aria-hidden="true" />
              </div>
            ))}
          </div>

          <div className="about-body rv" style={{margin:"2.5rem auto 0", textAlign:"left"}}>
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

          <div className="about-body rv" style={{margin:"3rem auto 0"}}>
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

      {/* CTA — kontakt */}
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
        <div className="cta-form rv" style={{transitionDelay:"260ms"}}>
          <div className="cta-fields">
            <input className="cta-input" placeholder="Meno a priezvisko" />
            <input className="cta-input" placeholder="E-mail / telefón" />
            <select className="cta-input cta-select">
              <option value="">Typ spolupráce</option>
              <option>Video / dokumenty</option>
              <option>Prieskum trhu</option>
              <option>Eventy</option>
              <option>Médiá</option>
              <option>Broadcast & Podcast</option>
              <option>Komplexná spolupráca</option>
            </select>
          </div>
          <button className="cta-btn">Odoslať dopyt <span className="arr">→</span></button>
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

      {/* FOOTER */}
      <footer className="footer">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="logo"><img className="logo-rune-img" src={LOGO_FULL} alt="FEHU Prosperity" /></div>
            <p className="foot-sign"><span className="serif-it">Prihláste sa</span> a využite silu FEHU.</p>
            <div className="foot-form">
              <input className="foot-input" placeholder="Váš e-mail" aria-label="E-mail" />
              <button className="foot-submit" aria-label="Odoslať">→</button>
            </div>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h4>Služby</h4>
              <button onClick={()=>scrollTo("video")}>Video / dokumenty</button>
              <button onClick={()=>scrollTo("prieskum")}>Prieskum trhu</button>
              <button onClick={()=>scrollTo("eventy")}>Eventy</button>
              <button onClick={()=>scrollTo("media")}>Médiá</button>
              <button onClick={()=>scrollTo("broadcast")}>Broadcast & Podcast</button>
            </div>
            <div className="foot-col">
              <h4>Spoločnosť</h4>
              <button onClick={()=>scrollTo("onas")}>O nás</button>
              <button onClick={()=>scrollTo("projekty")}>Projekty</button>
              <button onClick={()=>scrollTo("kontakt")}>Kontakt</button>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 FEHU. Všetky práva vyhradené.</span>
          <span>Bratislava · Praha · Viedeň</span>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   V2 CSS — komponenty z COMPONENT SITE vo FEHU palete
   ============================================================ */
const V2_CSS = `
/* ── Card 3D Tilt ── */
.mv-tilt{position:relative;transform-style:preserve-3d;will-change:transform;
  transition:transform .25s ease-out;overflow:hidden;height:100%;}
.mv-tilt__glare{position:absolute;inset:0;pointer-events:none;border-radius:inherit;}
.tilt-holder{display:flex;}
.tilt-holder .pillar-card{flex:1;}

/* ── Bento Grid (spotlight hover) ── */
.mv-bento{display:grid;gap:16px;grid-template-columns:repeat(4,1fr);grid-auto-rows:155px;
  margin-top:2.5rem;text-align:left;}
.mv-bento .cell{position:relative;border-radius:18px;border:1px solid var(--line);
  background:var(--bg2);padding:1.3rem;overflow:hidden;transition:border-color .3s;}
.mv-bento .cell::before{content:"";position:absolute;inset:0;opacity:0;transition:opacity .3s;
  background:radial-gradient(320px circle at var(--bx,50%) var(--by,50%), color-mix(in srgb,var(--accent) 14%, transparent), transparent 60%);}
.mv-bento .cell:hover{border-color:color-mix(in srgb,var(--accent) 55%, transparent);}
.mv-bento .cell:hover::before{opacity:1;}
.mv-bento .wide{grid-column:span 2;}
.mv-bento .tall{grid-row:span 2;}
.mv-bento .big{grid-column:span 2;grid-row:span 2;}
.mv-bento h3{margin:0 0 .45rem;font-size:1.02rem;font-weight:800;letter-spacing:.02em;color:var(--fg);position:relative;z-index:1;}
.mv-bento .big h3{font-size:1.35rem;}
.mv-bento p{margin:0;font-size:.84rem;line-height:1.55;color:var(--fg-dim);position:relative;z-index:1;}
.mv-bento a{display:inline-block;margin-top:.6rem;color:var(--accent);text-decoration:none;
  font-size:.78rem;font-weight:700;letter-spacing:.04em;position:relative;z-index:1;}
.mv-bento a:hover{text-decoration:underline;}
.bento-emblem{position:absolute;right:14px;bottom:12px;height:32px;width:auto;opacity:.45;
  filter:drop-shadow(0 0 6px color-mix(in srgb,var(--accent) 40%, transparent));}
.mv-bento .big .bento-emblem{height:52px;opacity:.6;}
@media(max-width:760px){.mv-bento{grid-template-columns:repeat(2,1fr);}}
@media(max-width:480px){.mv-bento{grid-template-columns:1fr;grid-auto-rows:auto;}
  .mv-bento .cell{grid-column:auto !important;grid-row:auto !important;min-height:130px;}}

/* ── Coverflow 3D slider ── */
.cf-outer{margin-top:3rem;}
.cf-stage{position:relative;max-width:920px;margin:0 auto;height:min(560px,120vw);
  perspective:1600px;display:flex;align-items:center;justify-content:center;}
.cf-card{position:absolute;width:min(300px,62vw);border-radius:18px;overflow:hidden;
  background:var(--bg2);border:1px solid var(--line);
  box-shadow:0 30px 60px rgba(0,0,0,.55), 0 0 40px color-mix(in srgb,var(--accent) 10%, transparent);
  transition:transform .7s cubic-bezier(.4,0,.2,1),opacity .7s cubic-bezier(.4,0,.2,1),filter .7s cubic-bezier(.4,0,.2,1);
  cursor:pointer;backface-visibility:hidden;}
.cf-card img{width:100%;display:block;}
.cf-meta{padding:.65rem .9rem .8rem;text-align:left;}
.cf-date,.cf-venue{display:block;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim);}
.cf-title{font-size:.95rem;font-weight:800;margin:.2rem 0;letter-spacing:-.01em;color:var(--fg);}
.cf-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:120;
  width:52px;height:52px;border-radius:50%;border:1px solid var(--line);cursor:pointer;
  background:color-mix(in srgb,var(--bg2) 55%, transparent);backdrop-filter:blur(6px);
  color:var(--fg);font-size:1.5rem;display:grid;place-items:center;transition:all .25s;}
.cf-arrow:hover{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);}
.cf-arrow.left{left:0;}
.cf-arrow.right{right:0;}
.cf-outer .car-dots{margin-top:1.4rem;}
@media(max-width:640px){.cf-arrow{width:42px;height:42px;}}

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
`;
