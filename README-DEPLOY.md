# FEHU web — nasadenie na Vercel

## Možnosť A: cez prehliadač (git)
1. Nahraj obsah tohto priečinka do GitHub repozitára
2. Na https://vercel.com/new importuj repozitár → Deploy (nič nenastavuješ, vercel.json je pripravený)

## Možnosť B: bez gitu (CLI, 2 minúty)
1. Otvor priečinok `fehu-web` v termináli (PowerShell)
2. Spusti:  npx vercel --prod
3. Prihlás sa (e-mail) a potvrď predvolené nastavenia — hotovo

Build: Vite → `npm run build` → výstup `dist/` (Vercel si to spraví sám).
Lokálny náhľad bez Vercelu: otvor `dist/index.html`.
