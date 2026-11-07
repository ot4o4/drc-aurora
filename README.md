# Darou Rahmane Chicken — Édition Aurum

**En ligne : https://ot4o4.github.io/drc-aurora/** (GitHub Pages, branche `main`, racine du dépôt)

Nouvelle vitrine, indépendante du site en production (`darourahmane-chicken.onrender.com`), qui n'a pas été modifiée.

- **Dossier local** : `/home/ot4o4/drc-aurora/`
- **Fichier unique** : `index.html` (HTML + CSS + JS, aucune dépendance de build)
- **Assets** : `assets/` — logo, bannière et photos produits reprises du site officiel
- **Catalogue** : `products.json` (copie de l'API) ; le site interroge aussi l'API live `https://drc-api-dj8t.onrender.com/api/products` et retombe sur le catalogue local si l'API dort.

## Ce que fait le site

- Scène plein écran : 8 produits en carrousel horizontal (snap), halo lumineux, compteur 01/08, bouton d'ajout contextuel.
- Marché filtrable par catégories, cartes produits, ajout au panier en un geste.
- Bloc vedette « braisé », piliers de service (2 h, chaîne du froid, paiement), bloc revendeur.
- Panier en feuille basse : quantités, nom / téléphone / créneau / adresse, choix Wave · Orange Money · Espèces, livraison offerte dès 15 000 F.
- Commande envoyée en message WhatsApp formaté vers **+221 70 917 09 20** (aucun back-end nécessaire).
- Panier persistant (localStorage), navigation clavier ← →, `prefers-reduced-motion` respecté, responsive dès 360 px, composition deux colonnes ≥ 900 px.

## Aperçu local

```bash
cd /home/ot4o4/drc-aurora
python3 -m http.server 8899        # http://127.0.0.1:8899
```

## Captures contrôlées (chromium headless sur :9333)

```bash
# lancer une fois
chromium --headless=new --remote-debugging-port=9333 --user-data-dir=/tmp/drcprof \
  --no-first-run --disable-gpu --hide-scrollbars about:blank &

node tools/shot.mjs <url> shots/x.png 393 844 3 view 0 2500   # écran mobile
node tools/shot.mjs <url> shots/x.png 1440 900 1 view 0 2500  # desktop
node tools/flow.mjs <url> shots/x.png 393 844 3 "<js>" 800    # scénario + capture
node tools/eval.mjs <url> "<js>" 1440 900                     # mesures géométrie
```

## Mise à jour du site en ligne

```bash
cd /home/ot4o4/drc-aurora
# éditer index.html / assets, puis
git add -A && git commit -m "maj vitrine" && git push
```
GitHub Pages reconstruit tout seul en ~1 min (vérifier : `gh api repos/ot4o4/drc-aurora/pages/builds/latest`).

## Déploiement alternatif

`wrangler.jsonc` + `src/index.js` servent `public/` comme assets statiques.

```bash
cp index.html public/ && npx wrangler@latest deploy --temporary
```

Le compte temporaire expire en 60 min s'il n'est pas réclamé (URL `claim-preview`). Pour un hébergement durable : Render (Static Site), Netlify ou Cloudflare Pages — le dossier à publier est `public/`.

## Charte

`--ink #0A0708` · `--braise #FF7A34` · `--or #E7B75F` · `--cream #F6EDE3` — titres Fraunces (serif), interface Inter. Philosophie : fond sombre chaud, produit en cercle lumineux, une seule action dominante par écran.
