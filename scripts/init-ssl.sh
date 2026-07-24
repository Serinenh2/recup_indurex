#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# init-ssl.sh — Obtenir les certificats SSL Let's Encrypt
# Usage : ./scripts/init-ssl.sh example.com admin@example.com
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# Se positionner à la racine du projet (où se trouve docker-compose.yml)
cd "$(dirname "$0")/.."

DOMAIN="${1:-${DOMAIN:-}}"
EMAIL="${2:-${SSL_EMAIL:-}}"

if [ -z "$DOMAIN" ]; then
  echo "❌ Usage: $0 <domain> [email]"
  echo "   Ou définir DOMAIN= et SSL_EMAIL= dans .env"
  exit 1
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔐 Let's Encrypt — Obtention du certificat SSL"
echo "  🌐 Domaine : $DOMAIN"
echo "  📧 Email   : ${EMAIL:-<non requis pour --register-unsafely-without-email>}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Étape 1 : Vérifier que les services tournent
echo ""
echo "🔍 Vérification que Nginx est accessible sur le port 80..."

if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:80/.well-known/acme-challenge/test 2>/dev/null | grep -q '404'; then
  echo -e "${RED}⚠️  Nginx semble inaccessible sur localhost:80${NC}"
  echo "   Assurez-vous que 'docker compose up -d' est lancé."
  echo "   Le DNS doit pointer vers ce serveur pour Let's Encrypt."
  exit 1
fi
echo -e "  ✅ Nginx répond sur le port 80"

# Étape 2 : Lancer certbot pour obtenir le certificat
echo ""
echo "📜 Demande du certificat auprès de Let's Encrypt..."
echo "    (Cela peut prendre 30 secondes...)"
echo ""

CMD_ARGS=(
  certonly
  --webroot
  --webroot-path /var/www/certbot
  -d "$DOMAIN"
  --non-interactive
  --agree-tos
  --force-renewal
)

if [ -n "$EMAIL" ]; then
  CMD_ARGS+=(--email "$EMAIL")
else
  CMD_ARGS+=(--register-unsafely-without-email)
fi

docker compose run --rm certbot "${CMD_ARGS[@]}"

# Étape 3 : Vérification
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo -e "${GREEN}✅ Certificat SSL obtenu avec succès !${NC}"
  echo ""
  echo "  📁 Fichiers :"
  echo "    Certificat : ./certbot/conf/live/$DOMAIN/fullchain.pem"
  echo "    Clé privée : ./certbot/conf/live/$DOMAIN/privkey.pem"
  echo ""
  echo "  🔄 Renouvellement automatique : le service certbot"
  echo "     s'occupe du renouvellement toutes les 12h."
  echo ""
  echo "  🚀 Rechargez Nginx pour appliquer le HTTPS :"
  echo "     docker compose exec nginx nginx -s reload"
else
  echo -e "${RED}❌ Échec — Le certificat n'a pas été créé.${NC}"
  echo "   Vérifiez les logs : docker compose logs certbot"
  exit 1
fi
