# FEHU — Marketingová Agentúra (web)

One-page web agentúry FEHU postavený na **Vite + React**.

## Lokálny vývoj

```bash
npm install
npm run dev
```

Otvor adresu, ktorú vypíše terminál (predvolene http://localhost:5173).

## Produkčný build

```bash
npm run build      # vytvorí priečinok dist/
npm run preview    # lokálny náhľad produkčného buildu
```

## Nasadenie

### Vercel
1. Pushni tento priečinok do Git repozitára (GitHub/GitLab/Bitbucket).
2. Na [vercel.com](https://vercel.com) → **Add New → Project** → vyber repozitár.
3. Vercel automaticky rozpozná Vite. Nastavenia sú aj v `vercel.json`:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Klikni **Deploy**.

Alternatíva cez CLI:
```bash
npm i -g vercel
vercel        # náhľadový deploy
vercel --prod # produkcia
```

### Netlify
1. Pushni priečinok do Git repozitára.
2. Na [netlify.com](https://netlify.com) → **Add new site → Import an existing project**.
3. Nastavenia sú v `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Klikni **Deploy**.

Alternatíva cez CLI:
```bash
npm i -g netlify-cli
netlify deploy            # náhľad
netlify deploy --prod     # produkcia
```

## Štruktúra

```
index.html          vstupný HTML + meta tagy (SEO/OG)
vite.config.js      konfigurácia Vite
src/main.jsx        bootstrap React aplikácie
src/FehuFire.jsx    samotný web (komponent)
src/index.css       základné resety
vercel.json         config pre Vercel
netlify.toml        config pre Netlify
```
