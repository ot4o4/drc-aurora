#!/usr/bin/env bash
# Branche un domaine personnalisé sur la vitrine (GitHub Pages, dépôt ot4o4/drc-aurora).
# À lancer UNIQUEMENT quand les enregistrements DNS pointent déjà vers GitHub,
# sinon *.github.io redirige vers un domaine qui ne répond pas encore.
#
#   tools/domain.sh drc.sn
set -euo pipefail

DOM="${1:?usage: tools/domain.sh <domaine>   (ex: drc.sn)}"
REPO="ot4o4/drc-aurora"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Domaine : $DOM"
echo "Vérification DNS (doit renvoyer une IP GitHub 185.199.10x.153) :"
getent hosts "$DOM" || echo "  ⚠️  aucune résolution pour l'instant"
echo

read -r -p "Les DNS pointent bien vers GitHub ? [o/N] " ok
[ "$ok" = "o" ] || { echo "Annulé — rien n'a été modifié."; exit 1; }

printf '%s\n' "$DOM" > CNAME
cp index.html public/ 2>/dev/null || true

git add -A
git -c user.name="ot4o4" -c user.email="ot4o4@users.noreply.github.com" \
    commit -qm "domaine personnalisé : $DOM" || true
git push -q origin main

gh api -X PUT "repos/$REPO/pages" -f "cname=$DOM" >/dev/null
gh api -X PUT "repos/$REPO/pages" -F "https_enforced=true" >/dev/null || true

echo
echo "✅ Domaine enregistré sur GitHub Pages."
echo "   Site      : https://$DOM"
echo "   Vérif     : gh api repos/$REPO/pages --jq '.html_url, .status, .https_certificate'"
echo
echo "Enregistrements DNS attendus chez le registrar :"
cat <<TXT
  A      @      185.199.108.153
  A      @      185.199.109.153
  A      @      185.199.110.153
  A      @      185.199.111.153
  CNAME  www    ot4o4.github.io.
TXT
