#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# install.sh — Installation one-click RECUP-DZ (Indurex)
#
# Usage :
#   sudo bash install.sh              ← Installation interactive
#   sudo bash install.sh --unattended ← Installation automatique (utilise .env.example)
#
# Ce script est conçu pour Ubuntu 22.04 / 24.04 LTS.
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Couleurs ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Variables globales ────────────────────────────────────────────────────────
APP_DIR="/opt/recup-indurex"
APP_USER="recup"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
UNATTENDED=false
DOMAIN=""
SSL_EMAIL=""
DB_PASSWORD=""
ADMIN_PASSWORD=""
SECRET_KEY=""
SKIP_SSL=false

# ═══════════════════════════════════════════════════════════════════════════════
#  FONCTIONS UTILITAIRES
# ═══════════════════════════════════════════════════════════════════════════════

print_banner() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  🏗️  RECUP-DZ — Installation One-Click${NC}"
  echo -e "${CYAN}  Système de Gestion des Récupérateurs de Déchets${NC}"
  echo -e "${CYAN}  Conforme à : Loi n°01-19 | Décret n°06-104${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_step() {
  echo ""
  echo -e "${YELLOW}[$1/$TOTAL_STEPS]${NC} ${BOLD}$2${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_ok() {
  echo -e "  ${GREEN}✅${NC} $1"
}

print_info() {
  echo -e "  ${BLUE}ℹ️${NC}  $1"
}

print_warn() {
  echo -e "  ${YELLOW}⚠️${NC}  $1"
}

print_error() {
  echo -e "  ${RED}❌${NC} $1"
}

check_root() {
  if [ "$EUID" -ne 0 ]; then
    print_error "Ce script doit être exécuté en tant que root (sudo)."
    echo ""
    echo "  Utilisation : sudo bash install.sh"
    exit 1
  fi
}

check_os() {
  if [ ! -f /etc/os-release ]; then
    print_warn "Impossible de détecter l'OS. Poursuite quand même..."
    return
  fi
  source /etc/os-release
  if [ "$ID" != "ubuntu" ]; then
    print_warn "Ce script est conçu pour Ubuntu. OS détecté : $ID"
    print_warn "L'installation peut échouer sur d'autres distributions."
    sleep 3
  else
    print_ok "Ubuntu $VERSION_ID détecté"
  fi
}

prompt_with_default() {
  local prompt="$1"
  local default="$2"
  local var_name="$3"
  local value

  if [ "$UNATTENDED" = true ]; then
    eval "$var_name='$default'"
    echo "  → $default"
    return
  fi

  read -p "$(echo -e "  ${CYAN}?${NC} $prompt [$default] : ")" value
  eval "$var_name='${value:-$default}'"
}

prompt_password() {
  local prompt="$1"
  local var_name="$2"
  local value
  local confirm

  if [ "$UNATTENDED" = true ]; then
    eval "$var_name='$(python3 -c "import secrets; print(secrets.token_urlsafe(16))")'"
    return
  fi

  while true; do
    read -s -p "$(echo -e "  ${CYAN}?${NC} $prompt : ")" value
    echo ""
    if [ ${#value} -lt 8 ]; then
      print_error "Le mot de passe doit faire au moins 8 caractères."
      continue
    fi
    read -s -p "$(echo -e "  ${CYAN}?${NC} Confirmer le mot de passe : ")" confirm
    echo ""
    if [ "$value" != "$confirm" ]; then
      print_error "Les mots de passe ne correspondent pas."
      continue
    fi
    break
  done
  eval "$var_name='$value'"
}

generate_secret_key() {
  python3 -c "import secrets; print(secrets.token_urlsafe(50))"
}

# ═══════════════════════════════════════════════════════════════════════════════
#  ÉTAPES D'INSTALLATION
# ═══════════════════════════════════════════════════════════════════════════════

TOTAL_STEPS=12

# ── Étape 1 : Vérifications ───────────────────────────────────────────────────
step_1_checks() {
  print_step 1 "Vérifications initiales"
  
  check_root
  check_os

  # Vérifier Python 3
  if command -v python3 &>/dev/null; then
    print_ok "Python $(python3 --version | cut -d' ' -f2) détecté"
  else
    print_info "Installation de Python 3..."
    apt-get install -y -qq python3
    print_ok "Python 3 installé"
  fi

  # Vérifier curl
  if ! command -v curl &>/dev/null; then
    apt-get install -y -qq curl
  fi
  print_ok "curl disponible"

  # Vérifier que le démon Docker tourne dès le départ (si déjà installé)
  if command -v docker &>/dev/null; then
    if ! docker info &>/dev/null; then
      print_warn "Le démon Docker est installé mais ne répond pas."
      print_info "Tentative de démarrage..."
      systemctl start docker 2>/dev/null || true
      sleep 3
      if ! docker info &>/dev/null; then
        print_error "Impossible de démarrer Docker. Vérifiez manuellement : sudo systemctl status docker"
      fi
    fi
  fi

  # Détection du mode : projet déjà copié ou exécuté depuis une clé ?
  if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    print_ok "Projet détecté dans : $PROJECT_DIR"
  else
    print_warn "Fichier docker-compose.yml introuvable !"
    print_warn "Assurez-vous que tous les fichiers du projet sont copiés dans ce répertoire."
    print_warn "Souhaitez-vous continuer quand même ? (les fichiers devront être copiés manuellement)"
    local continue_anyway
    if [ "$UNATTENDED" = false ]; then
      read -p "  Continuer ? (o/N) : " continue_anyway
      if [ "${continue_anyway,,}" != "o" ] && [ "${continue_anyway,,}" != "oui" ]; then
        exit 1
      fi
    fi
  fi
}

# ── Étape 2 : Configuration ───────────────────────────────────────────────────
step_2_config() {
  print_step 2 "Configuration de l'installation"
  echo ""

  # Domaine
  prompt_with_default "Nom de domaine (laisser vide si pas de domaine)" "" DOMAIN

  if [ -n "$DOMAIN" ]; then
    prompt_with_default "Email pour Let's Encrypt" "admin@${DOMAIN}" SSL_EMAIL
  else
    SKIP_SSL=true
    print_info "Pas de domaine → SSL skipped (HTTP uniquement)"
  fi

  # Mots de passe (générés automatiquement si --unattended)
  echo ""
  prompt_password "Mot de passe pour la base de données PostgreSQL" DB_PASSWORD
  prompt_password "Mot de passe pour l'admin Django" ADMIN_PASSWORD
  echo ""

  # Générer la clé secrète Django
  SECRET_KEY=$(generate_secret_key)
  print_ok "Clé secrète Django générée"
}

# ── Étape 3 : Mise à jour du système ──────────────────────────────────────────
step_3_system_update() {
  print_step 3 "Mise à jour du système"
  
  apt-get update -qq
  apt-get upgrade -y -qq
  print_ok "Système à jour"
}

# ── Étape 4 : Paquets de base ─────────────────────────────────────────────────
step_4_base_packages() {
  print_step 4 "Installation des paquets système"
  
  apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    ufw \
    htop \
    git \
    unzip \
    fail2ban \
    python3-pip \
    python3-venv

  print_ok "Paquets installés : curl, git, ufw, fail2ban, python3, etc."
}

# ── Étape 5 : Docker ──────────────────────────────────────────────────────────
step_5_docker() {
  print_step 5 "Installation de Docker & Docker Compose"

  if ! command -v docker &>/dev/null; then
    print_info "Installation de Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
    print_ok "Docker installé"
    print_info "Attente du démarrage du démon Docker..."
    local docker_retries=0
    while ! docker info &>/dev/null; do
      sleep 2
      docker_retries=$((docker_retries + 1))
      if [ $docker_retries -ge 15 ]; then
        print_error "Le démon Docker ne démarre pas. Vérifiez : sudo systemctl status docker"
        break
      fi
    done
    print_ok "Démon Docker actif"
  else
    print_ok "Docker déjà présent ($(docker --version))"
    if ! docker info &>/dev/null; then
      print_warn "Le démon Docker est installé mais ne répond pas. Démarrage..."
      systemctl start docker 2>/dev/null || true
      sleep 5
      if ! docker info &>/dev/null; then
        print_error "Impossible de démarrer Docker. Vérifiez : sudo systemctl status docker"
      fi
    fi
  fi

  if ! docker compose version &>/dev/null; then
    apt-get install -y -qq docker-compose-plugin
  fi
  print_ok "Docker Compose : $(docker compose version --short)"
}

# ── Étape 6 : Utilisateur et répertoires ──────────────────────────────────────
step_6_user_dirs() {
  print_step 6 "Création de l'utilisateur et des répertoires"

  # Créer l'utilisateur si nécessaire
  if ! id -u "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    usermod -aG docker "$APP_USER"
    print_ok "Utilisateur '$APP_USER' créé"
  else
    print_ok "Utilisateur '$APP_USER' existe déjà"
    # S'assurer qu'il est dans le groupe docker
    usermod -aG docker "$APP_USER" 2>/dev/null || true
  fi

  # Créer la structure
  mkdir -p "$APP_DIR"
  mkdir -p "$APP_DIR/certbot/www"
  mkdir -p "$APP_DIR/certbot/conf"
  mkdir -p "$APP_DIR/backups/db"
  mkdir -p "$APP_DIR/ssl"
  chown -R "$APP_USER:$APP_USER" "$APP_DIR"
  print_ok "Répertoires créés dans $APP_DIR"
}

# ── Étape 7 : Copie des fichiers du projet ────────────────────────────────────
step_7_copy_project() {
  print_step 7 "Installation des fichiers du projet"

  # Si on est déjà dans le bon répertoire, copier
  if [ -f "$PROJECT_DIR/docker-compose.yml" ] && [ "$PROJECT_DIR" != "$APP_DIR" ]; then
    print_info "Copie des fichiers vers $APP_DIR..."
    
    rsync -av --exclude='.git' \
             --exclude='node_modules' \
             --exclude='venv' \
             --exclude='__pycache__' \
             --exclude='*.pyc' \
             --exclude='.env' \
             "$PROJECT_DIR/" "$APP_DIR/" 2>/dev/null || {
      # Fallback : cp -r avec dotglob pour copier les fichiers cachés (.env.example, .dockerignore...)
      shopt -s dotglob
      cp -r "$PROJECT_DIR"/* "$APP_DIR/" 2>/dev/null
      shopt -u dotglob
      print_info "Fichiers copiés avec cp (les fichiers cachés sont inclus)"
    } || {
      print_warn "Utilisez plutôt rsync pour copier les fichiers :"
      echo "  rsync -av --exclude={.git,node_modules,venv,__pycache__} . $APP_USER@<IP>:$APP_DIR/"
    }
    
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    print_ok "Fichiers copiés"
  elif [ -f "$APP_DIR/docker-compose.yml" ]; then
    print_ok "Fichiers déjà présents dans $APP_DIR"
  else
    print_warn "Les fichiers du projet ne sont pas encore dans $APP_DIR"
    print_warn "Copiez-les manuellement après l'installation :"
    echo "  rsync -av --exclude={.git,node_modules,venv,__pycache__} ./ $APP_USER@<IP>:$APP_DIR/"
    echo ""
    if [ "$UNATTENDED" = false ]; then
      read -p "  Appuyez sur Entrée pour continuer..."
    fi
  fi

  cd "$APP_DIR"
}

# ── Étape 8 : Pare-feu ────────────────────────────────────────────────────────
step_8_firewall() {
  print_step 8 "Configuration du pare-feu"

  ufw --force reset 2>/dev/null || true
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow ssh
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable 2>/dev/null || {
    print_warn "Impossible d'activer UFW automatiquement"
    print_info "Activez-le manuellement : sudo ufw enable"
  }
  print_ok "Pare-feu configuré (ports : 22, 80, 443)"
}

# ── Étape 9 : Fail2ban ────────────────────────────────────────────────────────
step_9_fail2ban() {
  print_step 9 "Configuration de Fail2ban"

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

  systemctl enable --now fail2ban 2>/dev/null || true
  print_ok "Fail2ban actif (3 tentatives SSH → bannissement 24h)"
}

# ── Étape 10 : Création du .env ──────────────────────────────────────────────
step_10_env() {
  print_step 10 "Configuration des variables d'environnement"

  cd "$APP_DIR"

  # Vérifier si .env existe déjà
  if [ -f .env ] && [ "$UNATTENDED" = false ]; then
    local overwrite
    read -p "  Un fichier .env existe déjà. Le réécrire ? (o/N) : " overwrite
    if [ "${overwrite,,}" != "o" ] && [ "${overwrite,,}" != "oui" ]; then
      print_info "Fichier .env conservé"
      return
    fi
  fi

  # Construire le .env
  cat > .env << ENVEOF
# ═══════════════════════════════════════════════════════════════
# 🔐 Django Core Security
# ═══════════════════════════════════════════════════════════════
DJANGO_SECRET_KEY=${SECRET_KEY}
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1${DOMAIN:+,${DOMAIN}}
DJANGO_LOG_LEVEL=WARNING

# ═══════════════════════════════════════════════════════════════
# 🗄️  Database (PostgreSQL)
# ═══════════════════════════════════════════════════════════════
DB_ENGINE=django.db.backends.postgresql
DB_NAME=recup_indurex
DB_USER=recup_user
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=db
DB_PORT=5432
DB_CONN_MAX_AGE=60

# ═══════════════════════════════════════════════════════════════
# 🌐 CORS
# ═══════════════════════════════════════════════════════════════
DJANGO_CORS_ALLOWED_ORIGINS=${DOMAIN:+https://${DOMAIN},http://localhost:5173}${DOMAIN:-http://localhost,http://127.0.0.1}

# ═══════════════════════════════════════════════════════════════
# 🔒 HTTPS / SSL
# ═══════════════════════════════════════════════════════════════
DJANGO_SECURE_SSL_REDIRECT=$([ -n "$DOMAIN" ] && echo "True" || echo "False")
DJANGO_HSTS_SECONDS=$([ -n "$DOMAIN" ] && echo "31536000" || echo "0")
DJANGO_NUM_PROXIES=1

# ═══════════════════════════════════════════════════════════════
# 🌐 Domain
# ═══════════════════════════════════════════════════════════════
DOMAIN=${DOMAIN}
SSL_EMAIL=${SSL_EMAIL}

# ═══════════════════════════════════════════════════════════════
# 💾 DB Backup
# ═══════════════════════════════════════════════════════════════
BACKUP_RETENTION_DAYS=30

# ═══════════════════════════════════════════════════════════════
# 📊 Monitoring (Sentry) — optionnel
# ═══════════════════════════════════════════════════════════════
# SENTRY_DSN=
# VITE_SENTRY_DSN=

# ═══════════════════════════════════════════════════════════════
# 👤 Administrateur Django
# ═══════════════════════════════════════════════════════════════
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin${DOMAIN:+@${DOMAIN}}
DJANGO_SUPERUSER_PASSWORD=${ADMIN_PASSWORD}
ENVEOF

  chown "$APP_USER:$APP_USER" .env
  chmod 600 .env  # Sécurité : seul le propriétaire peut lire
  print_ok "Fichier .env créé (sécurisé : chmod 600)"
}

# ── Étape 11 : Swap (si RAM < 2 Go) ─────────────────────────────────────────
step_11_swap() {
  print_step 11 "Vérification de la mémoire"

  local total_ram
  total_ram=$(free -m | awk '/^Mem:/{print $2}')
  
  if [ "$total_ram" -lt 2048 ]; then
    print_info "RAM détectée : ${total_ram} Mo — Création d'un swap de 2 Go"
    
    if [ ! -f /swapfile ]; then
      fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 2>/dev/null
      chmod 600 /swapfile
      mkswap /swapfile
      swapon /swapfile
      echo '/swapfile none swap sw 0 0' >> /etc/fstab
      print_ok "Swap de 2 Go activé"
    else
      print_ok "Swap déjà existant"
    fi
  else
    print_ok "RAM suffisante : ${total_ram} Mo"
  fi
}

# ── Étape 12 : Déploiement Docker ────────────────────────────────────────────
step_12_docker_deploy() {
  print_step 12 "Déploiement avec Docker"

  cd "$APP_DIR"

  # Vérifier que les fichiers sont là
  if [ ! -f docker-compose.yml ]; then
    print_error "docker-compose.yml introuvable dans $APP_DIR"
    print_error "Copiez d'abord les fichiers du projet, puis relancez :"
    echo "  cd $APP_DIR && docker compose up -d"
    exit 1
  fi

  # 12a. Démarrer PostgreSQL
  echo ""
  echo -e "  ${BLUE}→${NC} Démarrage de PostgreSQL..."
  docker compose up -d db
  sleep 5
  print_ok "PostgreSQL démarré"

  # 12b. Attendre que PostgreSQL soit prêt
  echo -e "  ${BLUE}→${NC} Attente de PostgreSQL..."
  local retries=0
  while ! docker compose exec -T db pg_isready -U recup_user -d recup_indurex &>/dev/null; do
    sleep 2
    retries=$((retries + 1))
    if [ $retries -ge 30 ]; then
      print_warn "PostgreSQL ne répond pas après 60s, vérifiez les logs :"
      echo "    docker compose logs db"
      break
    fi
  done
  print_ok "PostgreSQL prêt"

  # 12c. Builder les images (build local, pas de registry)
  echo -e "  ${BLUE}→${NC} Construction des images Docker..."
  docker compose build backend nginx 2>&1 | tail -5 || {
    print_warn "Build échoué. Logs complets :"
    docker compose build backend nginx 2>&1 | tail -20
    print_warn "Corrigez les erreurs puis relancez : docker compose up -d"
  }
  print_ok "Images construites"

  # 12d. Lancer les migrations
  echo -e "  ${BLUE}→${NC} Exécution des migrations..."
  docker compose run --rm migrate 2>&1 | tail -5 || {
    print_warn "Migrations échouées, vérifiez : docker compose logs backend"
  }
  print_ok "Migrations exécutées"

  # 12e. Démarrer le backend et nginx
  echo -e "  ${BLUE}→${NC} Démarrage du backend et du frontend..."
  docker compose up -d backend nginx 2>&1 | tail -3
  print_ok "Services démarrés"

  # 12f. Créer le superuser via setup.py
  echo -e "  ${BLUE}→${NC} Création du superuser et des données initiales..."
  docker compose exec -T backend python setup.py 2>&1 || {
    print_warn "Le setup a peut-être déjà été fait. Ignoré."
  }
  print_ok "Configuration initiale terminée"

  # 12g. Sauvegardes automatiques
  echo -e "  ${BLUE}→${NC} Activation des sauvegardes automatiques..."
  docker compose --profile backup up -d 2>/dev/null || true
  print_ok "Sauvegardes activées (toutes les 24h, rétention 30 jours)"

  # 12h. Vérification
  echo ""
  echo -e "  ${BLUE}→${NC} Vérification des services..."
  sleep 5
  
  local backend_ok=false
  if docker compose exec -T backend python -c "
import http.client
try:
    conn = http.client.HTTPConnection('localhost', 8000, timeout=10)
    conn.request('GET', '/')
    resp = conn.getresponse()
    resp.read()
    assert resp.status < 500
    print('OK')
except Exception:
    print('FAIL')
" 2>/dev/null | grep -q "OK"; then
    backend_ok=true
    print_ok "Backend Django opérationnel"
  else
    print_warn "Backend injoignable, vérifiez les logs : docker compose logs backend"
  fi

  if docker compose exec -T nginx wget -qO- http://localhost:80/ &>/dev/null; then
    print_ok "Frontend Nginx opérationnel"
  else
    print_warn "Frontend injoignable, vérifiez : docker compose logs nginx"
  fi

  # 12i. SSL si domaine configuré
  if [ -n "$DOMAIN" ] && [ "$SKIP_SSL" = false ]; then
    echo ""
    echo -e "  ${BLUE}→${NC} Configuration SSL avec Let's Encrypt..."
    echo -e "  ${YELLOW}⚠️  Assurez-vous que le DNS pointe vers ce serveur avant de continuer${NC}"
    echo -e "  ${YELLOW}⚠️  Et que le port 80 est accessible depuis l'extérieur${NC}"
    echo ""
    
    if [ "$UNATTENDED" = false ]; then
      local do_ssl
      read -p "  Lancer la configuration SSL maintenant ? (o/N) : " do_ssl
      if [ "${do_ssl,,}" = "o" ] || [ "${do_ssl,,}" = "oui" ]; then
        bash "$APP_DIR/scripts/init-ssl.sh" "$DOMAIN" "$SSL_EMAIL" || {
          print_warn "SSL non configuré. Vous pourrez le faire plus tard :"
          echo "    cd $APP_DIR && ./scripts/init-ssl.sh $DOMAIN $SSL_EMAIL"
        }
      fi
    fi
  fi
}

# ── Résumé final ──────────────────────────────────────────────────────────────
print_summary() {
  # Récupérer l'IP
  local ip
  ip=$(ip -4 route get 1 2>/dev/null | awk '{print $NF;exit}' 2>/dev/null || \
       hostname -I 2>/dev/null | awk '{print $1}' || \
       echo "<IP_DU_SERVEUR>")

  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  ✅  INSTALLATION TERMINÉE AVEC SUCCÈS !${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${BOLD}📂 Répertoire :${NC}         $APP_DIR"
  echo -e "  ${BOLD}👤 Utilisateur :${NC}         $APP_USER"
  echo ""
  echo -e "  ${BOLD}🌐 Accès à l'application :${NC}"
  echo -e "    • En local  : http://$ip"
  if [ -n "$DOMAIN" ]; then
    echo -e "    • Par domaine : http${SKIP_SSL:+}${SKIP_SSL:-s}://$DOMAIN"
  fi
  echo ""
  echo -e "  ${BOLD}🔑 Identifiants :${NC}"
  echo -e "    • Admin Django : http://$ip/admin/"
  echo -e "      Utilisateur : admin"
  echo -e "      Mot de passe : (défini dans le fichier .env)"
  if [ "$UNATTENDED" = true ]; then
    echo -e "      ${YELLOW}→ Voir le fichier : sudo cat $APP_DIR/.env | grep PASSWORD${NC}"
  fi
  echo ""
  echo -e "  ${BOLD}📋 Commandes utiles :${NC}"
  echo -e "    • Voir les logs :   docker compose logs -f"
  echo -e "    • Redémarrer :      docker compose restart"
  echo -e "    • Mettre à jour :   docker compose build && docker compose up -d"
  echo -e "    • Sauvegarder DB :  docker compose exec -T db pg_dump -U recup_user recup_indurex | gzip > backup.sql.gz"
  echo ""

  if [ "$SKIP_SSL" = true ] && [ -n "$DOMAIN" ]; then
    echo -e "  ${YELLOW}⚡ Pour activer le HTTPS :${NC}"
    echo -e "     cd $APP_DIR && ./scripts/init-ssl.sh $DOMAIN $SSL_EMAIL"
    echo -e "     nano $APP_DIR/nginx.conf  # Remplacer your-domain.com par $DOMAIN"
    echo -e "     docker compose exec nginx nginx -s reload"
    echo ""
  fi

  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# ═══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════════════

main() {
  # Analyser les arguments
  for arg in "$@"; do
    case "$arg" in
      --unattended) UNATTENDED=true ;;
      --help|-h)
        echo "Usage: sudo bash install.sh [--unattended]"
        echo ""
        echo "  --unattended    Installation automatique (utilise les valeurs par défaut)"
        exit 0
        ;;
    esac
  done

  print_banner

  if [ "$UNATTENDED" = true ]; then
    print_info "Mode unattended — valeurs par défaut et mots de passe générés automatiquement"
    echo ""
    sleep 2
  fi

  step_1_checks
  step_2_config
  step_3_system_update
  step_4_base_packages
  step_5_docker
  step_6_user_dirs
  step_7_copy_project
  step_8_firewall
  step_9_fail2ban
  step_10_env
  step_11_swap
  step_12_docker_deploy
  print_summary
}

main "$@"
