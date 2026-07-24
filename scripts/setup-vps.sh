#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# setup-vps.sh — Configuration initiale du VPS
#
# Usage :
#   ssh root@mon-vps 'bash -s' < scripts/setup-vps.sh
#
# Ce script est conçu pour Ubuntu 22.04 / 24.04 LTS.
# À exécuter UNE SEULE FOIS lors du premier déploiement.
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  🖥️  Configuration initiale du VPS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ── Vérifier qu'on est root ────────────────────────────────
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Ce script doit être exécuté en tant que root${NC}"
  exit 1
fi

# ── 1. Mise à jour du système ──────────────────────────────
echo ""
echo -e "${YELLOW}📦 Mise à jour du système...${NC}"
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}  ✅ Système à jour${NC}"

# ── 2. Paquets de base ─────────────────────────────────────
echo ""
echo -e "${YELLOW}📦 Installation des paquets de base...${NC}"
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    ufw \
    htop \
    git \
    unzip \
    fail2ban
echo -e "${GREEN}  ✅ Paquets installés${NC}"

# ── 3. Docker ──────────────────────────────────────────────
echo ""
echo -e "${YELLOW}🐳 Installation de Docker...${NC}"
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
  echo -e "${GREEN}  ✅ Docker installé${NC}"
else
  echo -e "${GREEN}  ✅ Docker déjà présent${NC}"
fi

# ── 4. Docker Compose (plugin) ─────────────────────────────
echo ""
echo -e "${YELLOW}📦 Vérification de Docker Compose...${NC}"
if ! docker compose version &>/dev/null; then
  apt-get install -y -qq docker-compose-plugin
fi
echo -e "${GREEN}  ✅ Docker Compose: $(docker compose version --short)${NC}"

# ── 5. Création de l'utilisateur d'application ─────────────
echo ""
APP_USER="recup"
APP_DIR="/opt/recup-indurex"

if ! id -u "$APP_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$APP_USER"
  usermod -aG docker "$APP_USER"
  echo -e "${GREEN}  ✅ Utilisateur '$APP_USER' créé (membre du groupe docker)${NC}"
else
  echo -e "${GREEN}  ✅ Utilisateur '$APP_USER' existe déjà${NC}"
fi

# ── 6. Structure des répertoires ───────────────────────────
echo ""
echo -e "${YELLOW}📁 Création de la structure...${NC}"
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/certbot/www"
mkdir -p "$APP_DIR/certbot/conf"
mkdir -p "$APP_DIR/backups/db"
mkdir -p "$APP_DIR/ssl"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
echo -e "${GREEN}  ✅ Répertoires créés dans $APP_DIR${NC}"

# ── 7. Pare-feu (UFW) ─────────────────────────────────────
echo ""
echo -e "${YELLOW}🔥 Configuration du pare-feu...${NC}"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo -e "${GREEN}  ✅ Pare-feu configuré (ports: 22, 80, 443)${NC}"

# ── 8. Fail2ban ───────────────────────────────────────────
echo ""
echo -e "${YELLOW}🛡️  Configuration de fail2ban...${NC}"
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
EOF

systemctl enable --now fail2ban
echo -e "${GREEN}  ✅ Fail2ban actif${NC}"

# ── 9. Swap (si moins de 2 Go de RAM) ─────────────────────
TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 2048 ]; then
  echo ""
  echo -e "${YELLOW}💾 Création d'un swap (2 Go)...${NC}"
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo -e "${GREEN}  ✅ Swap activé${NC}"
fi

# ── Résumé ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Configuration terminée !${NC}"
echo ""
echo "  📂 App directory: $APP_DIR"
echo "  👤 Utilisateur:   $APP_USER"
echo "  🔥 Ports ouverts: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
echo ""
echo "  Prochaines étapes :"
echo "  1. Copier les fichiers du projet :"
echo "     cd /opt/recup-indurex"
echo "     git clone <votre-repo> ."
echo ""
echo "  2. Copier .env.example vers .env et configurer :"
echo "     cp .env.example .env && nano .env"
echo ""
echo "  3. Lancer les services :"
echo "     docker compose up -d"
echo ""
echo "  4. Obtenir le certificat SSL :"
echo "     ./scripts/init-ssl.sh mon-domaine.com admin@email.com"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
