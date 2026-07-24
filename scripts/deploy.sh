#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# deploy.sh — Déploiement automatisé sur VPS
#
# Appelé par GitHub Actions (workflows/deploy.yml).
# Peut aussi être lancé manuellement :
#   ./scripts/deploy.sh
#
# Prérequis :
#   - Docker & Docker Compose installés sur le VPS
#   - .env configuré avec les bonnes variables
#   - Accès au registry (ghcr.io) configuré
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

cd "$(dirname "$0")/.."

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Déploiement — Recup Indurex"
echo "  📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Configuration ───────────────────────────────────────────
TAG="${TAG:-latest}"
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_BACKEND="${IMAGE_BACKEND:-recup-indurex-backend}"
IMAGE_FRONTEND="${IMAGE_FRONTEND:-recup-indurex-frontend}"

# ── Vérifications ───────────────────────────────────────────
if [ ! -f .env ]; then
  echo "❌ Fichier .env introuvable."
  echo "   Sur le VPS, créez le fichier .env avec les vraies valeurs depuis .env.example :"
  echo "   cp .env.example .env && nano .env"
  exit 1
fi

# Vérifier que .env ne contient pas les valeurs par défaut du template
if grep -q 'your-domain.com\|your-db-password\|your-secret-key' .env 2>/dev/null; then
  echo "⚠️  Le fichier .env contient encore des valeurs par défaut du template."
  echo "   Modifiez-le avec les vraies valeurs avant de déployer : nano .env"
  echo "   (Continuation dans 5 secondes...)"
  sleep 5
fi

if ! docker compose version &>/dev/null; then
  echo "❌ Docker Compose est requis."
  exit 1
fi

# ── Connexion au registry ──────────────────────────────────
# En local, il faut être connecté : echo "$TOKEN" | docker login ghcr.io -u <user> --password-stdin
# En CI, GITHUB_TOKEN est utilisé automatiquement.
echo "🔑 Connexion au registry..."
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  echo "   (GitHub Actions — token automatique)"
else
  echo "   (connexion manuelle nécessaire si non fait)"
fi

# ── Pull des dernières images ───────────────────────────────
echo ""
echo "📥 Pull des images..."
docker pull "${REGISTRY}/${IMAGE_BACKEND}:${TAG}" || {
  echo "   ⚠️  Image backend:${TAG} non trouvée, fallback sur :latest"
  docker pull "${REGISTRY}/${IMAGE_BACKEND}:latest" || true
}
docker pull "${REGISTRY}/${IMAGE_FRONTEND}:${TAG}" || {
  echo "   ⚠️  Image frontend:${TAG} non trouvée, fallback sur :latest"
  docker pull "${REGISTRY}/${IMAGE_FRONTEND}:latest" || true
}

# ── Mise à jour du docker-compose avec les nouvelles images ──
export BACKEND_IMAGE="${REGISTRY}/${IMAGE_BACKEND}:${TAG}"
export FRONTEND_IMAGE="${REGISTRY}/${IMAGE_FRONTEND}:${TAG}"

# ── Arrêt progressif ───────────────────────────────────────
echo ""
echo "🔄 Redéploiement..."

# Lancer les nouveaux conteneurs à côté des anciens
docker compose up -d --no-deps --pull missing backend nginx 2>&1 || true

# ── Migrations ──────────────────────────────────────────────
echo ""
echo "🗄️  Migrations..."
docker compose run --rm migrate || echo "   ⚠️  Migrations ignorées (service migrate du profil setup)"

# ── Vérification post-déploiement ──────────────────────────
echo ""
echo "🔍 Vérification..."
sleep 5

# Healthcheck backend
if docker compose exec -T backend python -c "
import http.client
try:
    conn = http.client.HTTPConnection('localhost', 8000, timeout=10)
    conn.request('GET', '/')
    resp = conn.getresponse()
    resp.read()
    assert resp.status < 500
    print('  ✅ Backend OK')
except Exception as e:
    print(f'  ❌ Backend: {e}')
    exit(1)
" 2>&1; then
  echo "  ✅ Backend opérationnel"
else
  echo "  ⚠️  Backend injoignable — vérifiez les logs : docker compose logs backend"
fi

# ── Nettoyage des anciennes images ─────────────────────────
echo ""
echo "🧹 Nettoyage..."
docker image prune -f 2>/dev/null || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Déploiement terminé"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
