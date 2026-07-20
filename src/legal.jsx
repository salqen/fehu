import { useState, useEffect, useCallback } from "react";

/* ============================================================
   FEHU — Cookies, súhlas a právne dokumenty
   • CookieConsent — lišta so súhlasom (GDPR / ePrivacy)
   • LegalModal    — Zásady cookies + Ochrana osobných údajov
   ============================================================ */

const CONSENT_KEY = "fehu-consent-v1";

/* ── Prevádzkovateľ — UPRAVTE podľa zápisu v OR SR ───────────
   Tieto údaje sa zobrazujú v právnych dokumentoch.           */
export const OPERATOR = {
  name:  "Fehu Prosperity s. r. o.",
  addr:  "Bratislava, Slovenská republika",
  ico:   "00 000 000",          // TODO: doplniť IČO
  dic:   "0000000000",          // TODO: doplniť DIČ
  email: "office@fehuprosperity.eu",
  reg:   "Obchodný register Mestského súdu Bratislava III",  // TODO: overiť oddiel/vložku
};

/* ── Meracie kódy — doplňte, keď budú kampane spustené ────── */
const GA_ID = "";   // napr. "G-XXXXXXXXXX"
const ADS_ID = "";  // napr. "AW-XXXXXXXXX"
const PIXEL_ID = ""; // napr. "1234567890"

const DEFAULT_CONSENT = { necessary: true, analytics: false, marketing: false };

export function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    return { ...DEFAULT_CONSENT, ...c, necessary: true };
  } catch { return null; }
}

function writeConsent(c) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...c, necessary: true, ts: Date.now() }));
  } catch { /* súkromný režim — súhlas platí len pre túto reláciu */ }
}

/* ── Google Consent Mode v2 ─────────────────────────────────
   Signál posielame vždy, aj keď skripty ešte nie sú nasadené. */
function pushConsentSignal(c) {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  window.gtag("consent", "update", {
    analytics_storage:       c.analytics ? "granted" : "denied",
    ad_storage:              c.marketing ? "granted" : "denied",
    ad_user_data:            c.marketing ? "granted" : "denied",
    ad_personalization:      c.marketing ? "granted" : "denied",
    functionality_storage:   "granted",
    security_storage:        "granted",
  });
}

function loadScriptOnce(id, src, onload) {
  if (!src || document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id; s.async = true; s.src = src;
  if (onload) s.onload = onload;
  document.head.appendChild(s);
}

/* Skripty sa načítajú AŽ po udelení súhlasu — nikdy predtým. */
export function applyConsent(c) {
  pushConsentSignal(c);

  if (c.analytics && GA_ID) {
    loadScriptOnce("ga-src", `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, () => {
      window.gtag("js", new Date());
      window.gtag("config", GA_ID, { anonymize_ip: true });
    });
  }
  if (c.marketing && ADS_ID) {
    loadScriptOnce("ads-src", `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`, () => {
      window.gtag("config", ADS_ID);
    });
  }
  if (c.marketing && PIXEL_ID && !window.fbq) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }
}

/* ── Prepínač kategórie ── */
function Toggle({ checked, disabled, onChange, title, desc }) {
  return (
    <div className={`ck-cat ${disabled ? "is-locked" : ""}`}>
      <div className="ck-cat-head">
        <b>{title}</b>
        <button type="button" role="switch" aria-checked={checked} aria-label={title}
          disabled={disabled} onClick={() => !disabled && onChange(!checked)}
          className={`ck-switch ${checked ? "on" : ""}`}>
          <span className="ck-knob" />
        </button>
      </div>
      <p>{desc}</p>
    </div>
  );
}

/* ============================================================
   Lišta so súhlasom
   ============================================================ */
export function CookieConsent({ openSettingsSignal, onOpenPolicy }) {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_CONSENT);

  useEffect(() => {
    const saved = readConsent();
    if (saved) { applyConsent(saved); setDraft(saved); }
    else { pushConsentSignal(DEFAULT_CONSENT); setVisible(true); }
  }, []);

  /* znovuotvorenie z pätičky */
  useEffect(() => {
    if (openSettingsSignal > 0) {
      setDraft(readConsent() || DEFAULT_CONSENT);
      setShowPrefs(true);
      setVisible(true);
    }
  }, [openSettingsSignal]);

  const decide = useCallback((c) => {
    writeConsent(c); applyConsent(c); setVisible(false); setShowPrefs(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="ck-wrap" role="dialog" aria-modal="false" aria-label="Nastavenia cookies">
      <div className="ck-bar">
        <div className="ck-copy">
          <b>Používame cookies</b>
          <p>
            Nevyhnutné cookies potrebujeme na fungovanie webu. So súhlasom používame aj
            analytické a marketingové cookies, ktoré nám pomáhajú web zlepšovať a merať
            účinnosť kampaní. Súhlas môžete kedykoľvek zmeniť alebo odvolať.{" "}
            <button type="button" className="ck-link" onClick={() => onOpenPolicy("cookies")}>
              Zásady používania cookies
            </button>
          </p>
        </div>

        {showPrefs && (
          <div className="ck-prefs">
            <Toggle title="Nevyhnutné" checked disabled onChange={() => {}}
              desc="Zabezpečujú základné fungovanie webu — uloženie vášho súhlasu a voľbu svetlého či tmavého režimu. Bez nich web nefunguje správne, preto sa nedajú vypnúť." />
            <Toggle title="Analytické" checked={draft.analytics}
              onChange={v => setDraft(d => ({ ...d, analytics: v }))}
              desc="Anonymizovaná štatistika návštevnosti (Google Analytics) — koľko ľudí web navštívi a ktoré sekcie ich zaujímajú. Pomáha nám web zlepšovať." />
            <Toggle title="Marketingové" checked={draft.marketing}
              onChange={v => setDraft(d => ({ ...d, marketing: v }))}
              desc="Meranie konverzií a remarketing (Google Ads, Meta Pixel). Umožňujú zobraziť vám relevantnejšiu reklamu na iných weboch a sociálnych sieťach." />
          </div>
        )}

        <div className="ck-actions">
          {!showPrefs && (
            <button type="button" className="ck-btn ck-ghost" onClick={() => setShowPrefs(true)}>
              Nastavenia
            </button>
          )}
          <button type="button" className="ck-btn ck-ghost"
            onClick={() => decide({ ...DEFAULT_CONSENT })}>
            Odmietnuť všetko
          </button>
          {showPrefs && (
            <button type="button" className="ck-btn ck-ghost" onClick={() => decide(draft)}>
              Uložiť voľbu
            </button>
          )}
          <button type="button" className="ck-btn ck-primary"
            onClick={() => decide({ necessary: true, analytics: true, marketing: true })}>
            Prijať všetko
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Právne dokumenty — modal s dvoma záložkami
   ============================================================ */
export function LegalModal({ open, tab, onTab, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Právne informácie">
      <div className="lg-modal" onClick={e => e.stopPropagation()}>
        <div className="lg-head">
          <div className="lg-tabs">
            <button className={tab === "cookies" ? "on" : ""} onClick={() => onTab("cookies")}>
              Zásady cookies
            </button>
            <button className={tab === "gdpr" ? "on" : ""} onClick={() => onTab("gdpr")}>
              Ochrana osobných údajov
            </button>
          </div>
          <button className="lg-close" onClick={onClose} aria-label="Zavrieť">✕</button>
        </div>
        <div className="lg-body">
          {tab === "cookies" ? <CookiePolicy /> : <PrivacyPolicy />}
        </div>
      </div>
    </div>
  );
}

const UPDATED = "20. júla 2026";

function CookiePolicy() {
  return (
    <article className="lg-doc">
      <h2>Zásady používania cookies</h2>
      <p className="lg-meta">Účinné od {UPDATED}</p>

      <h3>1. Čo sú cookies</h3>
      <p>Cookies sú malé textové súbory, ktoré sa pri návšteve webovej stránky ukladajú
      vo vašom prehliadači. Umožňujú stránke zapamätať si vaše nastavenia a poskytujú
      prevádzkovateľovi informácie o tom, ako je web používaný. Popri cookies využívame
      aj podobné technológie, najmä lokálne úložisko prehliadača (localStorage).</p>

      <h3>2. Prevádzkovateľ</h3>
      <p>{OPERATOR.name}, {OPERATOR.addr}, IČO: {OPERATOR.ico}.
      Kontakt: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.</p>

      <h3>3. Kategórie, ktoré používame</h3>
      <h4>Nevyhnutné cookies</h4>
      <p>Sú potrebné na základné fungovanie webu a nedajú sa vypnúť. Ukladáme iba záznam
      o vašom súhlase (<code>fehu-consent-v1</code>) a voľbu svetlého či tmavého režimu.
      Údaje zostávajú vo vašom prehliadači a neodosielajú sa tretím stranám. Právnym
      základom je oprávnený záujem na prevádzke webu.</p>

      <h4>Analytické cookies</h4>
      <p>Používame Google Analytics 4 na anonymizovanú štatistiku návštevnosti — počet
      návštevníkov, zdroje návštev a obľúbenosť jednotlivých sekcií. IP adresa je
      anonymizovaná. Aktivujú sa len s vaším súhlasom a bežne majú platnosť do 24 mesiacov.</p>

      <h4>Marketingové cookies</h4>
      <p>Google Ads a Meta Pixel nám umožňujú merať účinnosť reklamných kampaní
      a zobrazovať vám relevantnejšiu reklamu na iných weboch a sociálnych sieťach.
      Aktivujú sa len s vaším súhlasom a bežne majú platnosť do 13 mesiacov.</p>

      <h3>4. Prenos mimo EÚ</h3>
      <p>Google a Meta môžu údaje spracúvať aj mimo Európskeho hospodárskeho priestoru,
      najmä v USA. Prenos prebieha na základe štandardných zmluvných doložiek Európskej
      komisie a rámca EU–US Data Privacy Framework.</p>

      <h3>5. Písma tretích strán</h3>
      <p>Web načítava typografiu zo služby Google Fonts. Pri načítaní sa Googlu odovzdá
      vaša IP adresa. Ide o technickú súčasť zobrazenia stránky, ktorá neukladá cookies.</p>

      <h3>6. Ako súhlas spravovať alebo odvolať</h3>
      <p>Súhlas môžete kedykoľvek zmeniť cez odkaz <b>Nastavenia cookies</b> v pätičke
      webu. Cookies viete zmazať aj priamo v nastaveniach prehliadača — v takom prípade
      sa vás pri ďalšej návšteve opýtame znova. Odvolanie súhlasu nemá vplyv na zákonnosť
      spracúvania pred jeho odvolaním.</p>

      <h3>7. Zmeny zásad</h3>
      <p>Tieto zásady môžeme priebežne aktualizovať. Aktuálne znenie je vždy dostupné
      na tejto stránke spolu s dátumom účinnosti.</p>
    </article>
  );
}

function PrivacyPolicy() {
  return (
    <article className="lg-doc">
      <h2>Zásady ochrany osobných údajov</h2>
      <p className="lg-meta">Účinné od {UPDATED}</p>

      <h3>1. Prevádzkovateľ</h3>
      <p>{OPERATOR.name}, so sídlom {OPERATOR.addr}, IČO: {OPERATOR.ico}, DIČ: {OPERATOR.dic},
      zapísaná v {OPERATOR.reg}. Kontakt vo veciach ochrany údajov:{" "}
      <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.</p>
      <p>Osobné údaje spracúvame v súlade s nariadením (EÚ) 2016/679 (GDPR) a zákonom
      č. 18/2018 Z. z. o ochrane osobných údajov.</p>

      <h3>2. Aké údaje spracúvame</h3>
      <p><b>Kontaktný formulár:</b> meno a priezvisko, e-mail, telefón, názov spoločnosti,
      oblasť záujmu a text vašej správy. Účelom je odpovedať na váš dopyt a pripraviť
      ponuku. Právny základ: opatrenia pred uzatvorením zmluvy na vašu žiadosť
      (čl. 6 ods. 1 písm. b GDPR).</p>
      <p><b>Newsletter:</b> e-mailová adresa. Účelom je zasielanie noviniek a marketingových
      informácií. Právny základ: váš súhlas (čl. 6 ods. 1 písm. a GDPR), ktorý môžete
      kedykoľvek odvolať odhlásením v každom e-maile.</p>
      <p><b>Analytika a marketing:</b> údaje o používaní webu podľa nastavení cookies.
      Právny základ: váš súhlas.</p>

      <h3>3. Ako dlho údaje uchovávame</h3>
      <p>Dopyty z kontaktného formulára uchovávame najviac 3 roky od poslednej komunikácie.
      Kontakty na zasielanie newslettera do odvolania súhlasu. Účtovné doklady po dobu
      stanovenú osobitnými predpismi, spravidla 10 rokov.</p>

      <h3>4. Komu údaje sprístupňujeme</h3>
      <p>Údaje neposkytujeme tretím osobám na ich vlastné marketingové účely. Sprístupňujeme
      ich len sprostredkovateľom, ktorí pre nás zabezpečujú prevádzku — poskytovateľom
      hostingu a e-mailových služieb, nástrojom na analytiku a reklamu (Google, Meta),
      a účtovným či právnym poradcom. Všetci sú viazaní mlčanlivosťou.</p>

      <h3>5. Vaše práva</h3>
      <p>Máte právo na prístup k svojim údajom, na ich opravu, vymazanie, obmedzenie
      spracúvania, na prenosnosť údajov, právo namietať proti spracúvaniu a právo
      kedykoľvek odvolať udelený súhlas. Žiadosť nám pošlite na{" "}
      <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>; vybavíme ju do jedného mesiaca.</p>
      <p>Ak sa domnievate, že spracúvaním vašich údajov došlo k porušeniu predpisov, máte
      právo podať sťažnosť Úradu na ochranu osobných údajov Slovenskej republiky,
      Hraničná 12, 820 07 Bratislava.</p>

      <h3>6. Bezpečnosť</h3>
      <p>Prijali sme primerané technické a organizačné opatrenia na ochranu údajov pred
      neoprávneným prístupom, stratou či zneužitím. Komunikácia s webom je šifrovaná
      protokolom HTTPS.</p>

      <h3>7. Automatizované rozhodovanie</h3>
      <p>Vaše údaje nepoužívame na automatizované individuálne rozhodovanie ani profilovanie
      s právnymi účinkami.</p>
    </article>
  );
}

/* ============================================================
   CSS
   ============================================================ */
export const LEGAL_CSS = `
/* ── Cookie lišta ── */
.ck-wrap{position:fixed;left:0;right:0;bottom:0;z-index:1200;display:flex;justify-content:center;
  padding:clamp(.7rem,2vw,1.3rem);pointer-events:none;
  animation:ckUp .55s cubic-bezier(.22,1,.36,1) both;}
@keyframes ckUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:none;}}
.ck-bar{pointer-events:auto;width:min(880px,100%);border-radius:20px;padding:1.25rem 1.4rem;
  background:color-mix(in srgb,var(--bg2) 92%, transparent);
  border:1px solid color-mix(in srgb,var(--accent) 30%, transparent);
  box-shadow:0 26px 70px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.12);
  backdrop-filter:blur(16px);display:flex;flex-direction:column;gap:1rem;
  max-height:min(82vh,700px);overflow-y:auto;}
.ck-copy b{display:block;font-size:.95rem;font-weight:800;letter-spacing:-.01em;margin-bottom:.35rem;color:var(--fg);}
.ck-copy p{margin:0;font-size:.85rem;line-height:1.65;color:var(--fg-dim);}
.ck-link{background:none;border:none;padding:0;font:inherit;cursor:pointer;
  color:var(--accent);text-decoration:underline;text-underline-offset:2px;}
.ck-link:hover{color:var(--accent-2);}
.ck-actions{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:flex-end;}
.ck-btn{padding:.7rem 1.25rem;border-radius:999px;cursor:pointer;font-family:inherit;
  font-size:.75rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
  transition:background .25s, border-color .25s, transform .25s cubic-bezier(.22,1,.36,1);}
.ck-btn:hover{transform:translateY(-2px);}
.ck-ghost{color:var(--fg-dim);background:transparent;
  border:1px solid color-mix(in srgb,var(--line) 160%, transparent);}
.ck-ghost:hover{color:var(--fg);border-color:color-mix(in srgb,var(--accent) 50%, transparent);}
.ck-primary{color:#1a1206;border:1px solid transparent;
  background:linear-gradient(120deg,var(--accent-2),var(--accent) 55%,#ffd27a);
  box-shadow:0 8px 24px color-mix(in srgb,var(--accent) 38%, transparent);}

/* ── Kategórie ── */
.ck-prefs{display:grid;gap:.55rem;padding-top:.9rem;
  border-top:1px solid color-mix(in srgb,var(--line) 150%, transparent);}
.ck-cat{padding:.75rem .9rem;border-radius:13px;
  background:color-mix(in srgb,var(--bg) 45%, transparent);
  border:1px solid color-mix(in srgb,var(--line) 130%, transparent);}
.ck-cat-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;}
.ck-cat-head b{font-size:.85rem;font-weight:800;color:var(--fg);}
.ck-cat p{margin:.3rem 0 0;font-size:.76rem;line-height:1.6;color:var(--fg-dim);}
.ck-switch{position:relative;width:44px;height:24px;border-radius:999px;flex:none;cursor:pointer;
  background:color-mix(in srgb,var(--line) 190%, transparent);
  border:1px solid color-mix(in srgb,var(--line) 150%, transparent);
  transition:background .28s cubic-bezier(.22,1,.36,1);}
.ck-switch.on{background:linear-gradient(120deg,var(--accent-2),var(--accent));
  border-color:color-mix(in srgb,var(--accent) 60%, transparent);}
.ck-switch:disabled{cursor:not-allowed;opacity:.55;}
.ck-knob{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;
  background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.3);
  transition:transform .28s cubic-bezier(.22,1,.36,1);}
.ck-switch.on .ck-knob{transform:translateX(20px);}
.ck-cat.is-locked{opacity:.85;}
@media(max-width:620px){
  .ck-actions{justify-content:stretch;}
  .ck-btn{flex:1 1 auto;text-align:center;}
}

/* ── Právny modal ── */
.lg-overlay{position:fixed;inset:0;z-index:1300;display:flex;align-items:center;justify-content:center;
  padding:clamp(.8rem,3vw,2rem);background:rgba(0,0,0,.68);backdrop-filter:blur(6px);
  animation:lgIn .3s ease both;}
@keyframes lgIn{from{opacity:0;}to{opacity:1;}}
.lg-modal{width:min(820px,100%);max-height:88vh;display:flex;flex-direction:column;
  border-radius:22px;overflow:hidden;background:var(--bg2);
  border:1px solid color-mix(in srgb,var(--accent) 26%, transparent);
  box-shadow:0 34px 90px rgba(0,0,0,.5);
  animation:lgPop .45s cubic-bezier(.22,1,.36,1) both;}
@keyframes lgPop{from{opacity:0;transform:translateY(22px) scale(.98);}to{opacity:1;transform:none;}}
.lg-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;
  padding:1rem 1.2rem;border-bottom:1px solid var(--line);flex:none;}
.lg-tabs{display:flex;gap:.4rem;flex-wrap:wrap;}
.lg-tabs button{padding:.55rem 1rem;border-radius:999px;border:1px solid transparent;
  background:transparent;cursor:pointer;font-family:inherit;font-size:.72rem;font-weight:800;
  letter-spacing:.1em;text-transform:uppercase;color:var(--fg-dim);transition:all .25s;}
.lg-tabs button:hover{color:var(--fg);}
.lg-tabs button.on{color:var(--accent-ink);
  background:color-mix(in srgb,var(--accent) 14%, transparent);
  border-color:color-mix(in srgb,var(--accent) 38%, transparent);}
.lg-close{width:36px;height:36px;border-radius:50%;flex:none;cursor:pointer;font-size:.9rem;
  color:var(--fg-dim);background:transparent;border:1px solid var(--line);transition:all .25s;}
.lg-close:hover{color:var(--fg);border-color:var(--accent);transform:rotate(90deg);}
.lg-body{overflow-y:auto;padding:1.5rem 1.6rem 2rem;}
.lg-doc h2{margin:0 0 .3rem;font-size:1.5rem;font-weight:800;letter-spacing:-.02em;color:var(--fg);}
.lg-doc h3{margin:1.7rem 0 .5rem;font-size:1rem;font-weight:800;color:var(--accent-ink);}
.lg-doc h4{margin:1.1rem 0 .35rem;font-size:.88rem;font-weight:800;color:var(--fg);}
.lg-doc p{margin:0 0 .7rem;font-size:.87rem;line-height:1.75;color:var(--fg-dim);}
.lg-doc a{color:var(--accent);text-decoration:none;}
.lg-doc a:hover{text-decoration:underline;}
.lg-doc code{font-family:"Space Mono",monospace;font-size:.8em;padding:.1em .4em;border-radius:5px;
  background:color-mix(in srgb,var(--accent) 12%, transparent);color:var(--accent-ink);}
.lg-meta{font-size:.72rem !important;letter-spacing:.1em;text-transform:uppercase;
  color:color-mix(in srgb,var(--fg-dim) 80%, transparent) !important;}
@media(max-width:560px){.lg-body{padding:1.2rem 1.1rem 1.6rem;}.lg-doc h2{font-size:1.25rem;}}
`;
