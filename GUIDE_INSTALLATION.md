# 📘 Guide d'installation — RECUP-DZ (Indurex)

> **Système de Gestion des Récupérateurs de Déchets — Algérie**
> Conforme à : Loi n°01-19 | Décret exécutif n°06-104

---

## 📦 Prérequis matériels

| Composant | Minimum | Recommandé |
|-----------|---------|------------|
| **CPU** | 2 cœurs | 4 cœurs |
| **RAM** | 2 Go | 4 Go |
| **Stockage** | 20 Go | 50 Go (SSD) |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| **Réseau** | IP fixe locale | IP fixe + nom de domaine |

---

# Phase 1 : Installation d'Ubuntu Server

## 1.1 Téléchargement et clé USB

```bash
# 1. Télécharger Ubuntu Server 24.04 LTS
# https://ubuntu.com/download/server

# 2. Créer une clé USB bootable
# Sur Windows : utiliser Rufus (https://rufus.ie)
# Sur Mac/Linux :
sudo dd if=ubuntu-24.04-live-server-amd64.iso of=/dev/sdX bs=4M status=progress
```

## 1.2 Installation

1. Insérer la clé USB et démarrer le serveur
2. Booter sur la clé USB (F2/F10/F12 au démarrage selon le constructeur)
3. Suivre l'assistant d'installation :

| Écran | Action |
|-------|--------|
| Langue | **Français** |
| Disposition clavier | **Français** |
| Réseau | Configurer l'IP fixe (voir section 1.3) |
| Disque | **Utiliser tout le disque** (ext4) |
| Nom du serveur | `recup-indurex` |
| Utilisateur | `recup` |
| OpenSSH | **✔️ Cocher** "Install OpenSSH server" |

## 1.3 Configuration IP fixe

Après la première connexion :

```bash
# Lister les interfaces réseau
ip a

# Éditer la configuration réseau
sudo nano /etc/netplan/00-installer-config.yaml
```

Exemple de configuration (remplacer par les valeurs du client) :

```yaml
network:
  ethernets:
    enp0s3:                    # ← Nom de l'interface réseau
      addresses:
        - 192.168.1.100/24     # ← IP fixe du serveur
      routes:
        - to: default
          via: 192.168.1.1      # ← Passerelle (box internet)
      nameservers:
        addresses:
          - 8.8.8.8
          - 1.1.1.1
  version: 2
```

Appliquer :
```bash
sudo netplan apply
```

---

# Phase 2 : Configuration initiale du serveur

## 2.1 Connexion SSH

Depuis votre PC :
```bash
ssh recup@<IP_DU_SERVEUR>
```

## 2.2 Script d'initialisation automatisé

```bash
# Télécharger et exécuter le script de configuration
# Si le serveur a accès à Internet :
sudo apt-get update && sudo apt-get install -y curl
bash <(curl -s https://raw.githubusercontent.com/<VOTRE_REPO>/main/scripts/setup-vps.sh)

# OU depuis une clé USB contenant le projet :
sudo bash /opt/recup-indurex/scripts/setup-vps.sh
```

Ce script effectue automatiquement :

| Action | Détail |
|--------|--------|
| ✅ Mise à jour système | `apt update && apt upgrade` |
| ✅ Paquets de base | curl, git, ufw, htop, fail2ban |
| ✅ Docker | Dernière version stable |
| ✅ Docker Compose | Plugin officiel |
| ✅ Utilisateur `recup` | Créé avec droits Docker |
| ✅ Structure répertoires | `/opt/recup-indurex/` avec sous-dossiers |
| ✅ Pare-feu UFW | Ports 22, 80, 443 uniquement |
| ✅ Fail2ban | Protection anti-brute-force SSH |
| ✅ Swap 2 Go | Si RAM < 2 Go |

## 2.3 Vérification

```bash
# Vérifier Docker
docker --version
docker compose version

# Vérifier le pare-feu
sudo ufw status verbose

# Vérifier l'utilisateur
id recup
groups recup    # Doit afficher "recup docker"
```

---

# Phase 3 : Installation du projet

## 3.1 Copie des fichiers

**Option A — Via Git (recommandé si accès Internet)** :
```bash
cd /opt/recup-indurex
git clone https://github.com/<VOTRE_ORGANISATION>/recup-indurex.git .
```

**Option B — Via clé USB (serveur sans Internet)** :

Sur votre PC :
```bash
cd /Users/imanebenmoussa/Documents/golden/recup_indurex
tar czf recup-indurex.tar.gz \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='venv' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  .
```

Copier la clé USB sur le serveur :
```bash
sudo mount /dev/sdb1 /mnt
sudo cp /mnt/recup-indurex.tar.gz /opt/recup-indurex/
cd /opt/recup-indurex
sudo tar xzf recup-indurex.tar.gz
sudo chown -R recup:recup /opt/recup-indurex
```

## 3.2 Configuration de l'environnement

```bash
cd /opt/recup-indurex

# Créer le fichier de configuration
cp .env.example .env
nano .env
```

### Variables à configurer obligatoirement :

```ini
# ══════════════════════════════════════════
# 🔐 Clé secrète Django
# ══════════════════════════════════════════
# GÉNÉRER avec : python3 -c "import secrets; print(secrets.token_urlsafe(50))"
DJANGO_SECRET_KEY=<VOTRE_CLE_SECRETE>

# ══════════════════════════════════════════
# 🌐 Domaine (si vous en avez un)
# ══════════════════════════════════════════
DOMAIN=recup-dz.entreprise.dz
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,recup-dz.entreprise.dz
DJANGO_CORS_ALLOWED_ORIGINS=https://recup-dz.entreprise.dz

# ══════════════════════════════════════════
# 🗄️ Base de données PostgreSQL
# ══════════════════════════════════════════
DB_ENGINE=django.db.backends.postgresql
DB_NAME=recup_indurex
DB_USER=recup_user
DB_PASSWORD=<MOT_DE_PASSE_DB_FORT>            # ← À CHANGER ABSOLUMENT

# ══════════════════════════════════════════
# 🔒 Compte administrateur
# ══════════════════════════════════════════
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@entreprise.dz
DJANGO_SUPERUSER_PASSWORD=<MOT_DE_PASSE_ADMIN>  # ← À CHANGER ABSOLUMENT

# ══════════════════════════════════════════
# 💾 Sauvegardes
# ══════════════════════════════════════════
BACKUP_RETENTION_DAYS=30

# ══════════════════════════════════════════
# 📊 Monitoring (optionnel)
# ══════════════════════════════════════════
# SENTRY_DSN=https://key@sentry.io/project
# VITE_SENTRY_DSN=https://key@sentry.io/project
```

> 🔑 **Générer une clé Django** :
> ```bash
> python3 -c "import secrets; print(secrets.token_urlsafe(50))"
> ```

---

# Phase 4 : Lancement de l'application

## 4.1 Démarrage des services

```bash
cd /opt/recup-indurex

# 1. Lancer PostgreSQL
docker compose up -d db

# 2. Attendre que PostgreSQL soit prêt
sleep 10
docker compose logs db --tail=5

# 3. Exécuter les migrations
docker compose run --rm migrate

# 4. Lancer le backend et le frontend
docker compose up -d backend nginx

# 5. Vérifier le statut de tous les conteneurs
docker compose ps
```

Tous les conteneurs doivent afficher **"Up"** dans la colonne `STATUS`.

## 4.2 Création du compte administrateur et des données initiales

```bash
# Exécuter le script de configuration initiale
docker compose exec backend python setup.py
```

Ce script crée automatiquement :
- **Superuser** : `admin` / mot de passe défini dans `.env`
- **Inspecteur de test** : `inspecteur1` / `Inspect2024!`
- **Nomenclature** des déchets (conforme au Décret 06-104)
- **Récupérateur** exemple : SARL EcoRecup Alger

## 4.3 Vérification du déploiement

```bash
# Tester l'accès au frontend
curl -s http://localhost | head -5

# Tester l'API
curl -s http://localhost/api/ | head -5

# Voir les logs
docker compose logs backend --tail=20
docker compose logs nginx --tail=20
```

---

# Phase 5 : Accès réseau

## 5.1 Configuration du routeur (box internet)

Si le serveur doit être accessible depuis l'extérieur (hors réseau local) :

1. Accéder à l'interface de la box internet (généralement http://192.168.1.1)
2. Configurer la **redirection de ports** (Port Forwarding) :

| Port externe | Port interne | IP destination |
|:---:|:---:|:---:|
| 80 | 80 | 192.168.1.100 |
| 443 | 443 | 192.168.1.100 |

3. **Optionnel** : Configurer une **réservation DHCP** pour l'IP du serveur

## 5.2 Nom de domaine et HTTPS (recommandé)

Si le client a un nom de domaine :

### Étape 1 : Configurer le DNS

Chez le registrar (place du marché Algérie, Godaddy, OVH, etc.) :

```
Type : A
Nom  : @
Valeur : <IP_PUBLIQUE_DU_CLIENT>
TTL  : 3600 (ou 1 heure)
```

### Étape 2 : Vérifier que les services tournent

Avant de lancer Certbot, assurez-vous que Nginx est accessible depuis l'extérieur :

```bash
# Sur votre PC, tester depuis l'extérieur
curl -s http://recup-dz.entreprise.dz
```

Si vous voyez une réponse (même une erreur Nginx), c'est que le port 80 est bien ouvert.

### Étape 3 : Obtenir le certificat SSL

```bash
cd /opt/recup-indurex

# Exécuter le script Let's Encrypt
./scripts/init-ssl.sh recup-dz.entreprise.dz admin@entreprise.dz
```

### Étape 4 : Mettre à jour la configuration Nginx

```bash
nano nginx.conf
```

Dans le bloc HTTPS, remplacer `your-domain.com` par votre domaine :

```nginx
ssl_certificate     /etc/letsencrypt/live/recup-dz.entreprise.dz/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/recup-dz.entreprise.dz/privkey.pem;
ssl_trusted_certificate /etc/letsencrypt/live/recup-dz.entreprise.dz/chain.pem;
```

### Étape 5 : Recharger Nginx

```bash
docker compose exec nginx nginx -s reload
```

> 🔄 **Le renouvellement est automatique** : le service `certbot` dans Docker s'occupe de renouveler le certificat toutes les 12h.

## 5.3 Accès sans domaine

Si le client n'a pas de nom de domaine, l'application sera accessible uniquement en HTTP via l'IP locale ou publique :

```
http://192.168.1.100/
```

Pour sécuriser l'accès, activez au minimum le pare-feu pour limiter les IP autorisées :

```bash
# Autoriser uniquement certaines IP à accéder au serveur
sudo ufw allow from 192.168.1.0/24 to any port 80
sudo ufw deny 80  # Bloquer les autres
```

---

# Phase 6 : Sauvegardes

## 6.1 Sauvegarde automatique (toutes les 24h)

```bash
# Activer le service de backup
docker compose --profile backup up -d
```

Les sauvegardes sont conservées 30 jours dans un volume Docker.

**Vérifier les sauvegardes :**
```bash
# Lister les sauvegardes
docker run --rm -v recup-indurex_db_backups:/backups alpine ls -lh /backups

# Pour voir la taille et la date
docker run --rm -v recup-indurex_db_backups:/backups alpine sh -c "du -sh /backups/*"
```

## 6.2 Sauvegarde manuelle

```bash
# Créer une sauvegarde
docker compose exec -T db \
  pg_dump -U recup_user recup_indurex | gzip > /opt/recup-indurex/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restaurer une sauvegarde
gunzip -c /opt/recup-indurex/backup_20241201.sql.gz | \
  docker compose exec -T db psql -U recup_user recup_indurex
```

## 6.3 Sauvegarde des fichiers média

```bash
# Les fichiers uploadés sont dans un volume Docker
docker run --rm -v recup-indurex_backend_media:/media alpine tar czf /tmp/media_backup.tar.gz /media
docker cp $(docker create alpine):/tmp/media_backup.tar.gz ./media_backup.tar.gz
```

---

# Phase 7 : Maintenance

## 7.1 Commandes essentielles

```bash
# Voir l'état des services
docker compose ps

# Voir les logs en direct
docker compose logs -f -t

# Voir les logs d'un service spécifique
docker compose logs backend --tail=50
docker compose logs nginx --tail=50

# Redémarrer un service
docker compose restart backend

# Mettre à jour (après modification du code)
docker compose build --no-cache
docker compose up -d

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données !)
docker compose down -v
```

## 7.2 Mise à jour du code

```bash
cd /opt/recup-indurex

# Si installé via Git
git pull origin main

# Si installé manuellement
# Copier les nouveaux fichiers depuis une clé USB

# Reconstruire et redémarrer
docker compose build --no-cache
docker compose up -d

# Appliquer les nouvelles migrations
docker compose run --rm migrate
```

## 7.3 Surveillance

```bash
# Utilisation des ressources
docker stats

# Voir l'espace disque
df -h

# Voir les logs applicatifs
docker compose exec backend cat /app/logs/django.log | tail -50
```

---

# Phase 8 : Accès à l'application

## 8.1 URLs

| Interface | URL | Identifiants |
|-----------|-----|-------------|
| **Application** | `http://<IP_DU_SERVEUR>/` ou `https://votre-domaine.dz/` | Utilisateurs créés |
| **Admin Django** | `http://<IP_DU_SERVEUR>/admin/` | `admin` / mot de passe défini |
| **API REST** | `http://<IP_DU_SERVEUR>/api/` | Authentification JWT |
| **Dashboard** | `http://<IP_DU_SERVEUR>/dashboard` | Via connexion |

## 8.2 Identifiants par défaut

| Utilisateur | Mot de passe | Rôle |
|------------|:---:|------|
| `admin` | Défini dans `.env` | SUPERADMIN |
| `inspecteur1` | `Inspect2024!` | INSPECTEUR |

> ⚠️ **Changer les mots de passe par défaut après la première connexion !**

---

# 🩺 Checklist de livraison

Avant de livrer au client, cocher ces points :

- [ ] Le serveur est allumé et accessible sur le réseau
- [ ] Ubuntu Server est installé avec les dernières mises à jour
- [ ] Docker et Docker Compose fonctionnent
- [ ] Le projet est copié dans `/opt/recup-indurex/`
- [ ] Le fichier `.env` est configuré avec les vraies valeurs
- [ ] La base de données PostgreSQL est opérationnelle
- [ ] Les migrations Django ont été exécutées
- [ ] Le superuser admin a été créé
- [ ] L'application répond sur `http://<IP>:80`
- [ ] Le pare-feu limite les ports à 22, 80, 443
- [ ] Les sauvegardes automatiques sont activées
- [ ] Le client a les identifiants de connexion
- [ ] Le guide d'utilisation de base a été expliqué au client

---

# 🆘 Dépannage

## Problèmes courants

| Problème | Causes possibles | Solution |
|----------|-----------------|----------|
| **Impossible d'accéder à l'application** | Ports non ouverts | `sudo ufw status` — vérifier que 80/443 sont autorisés |
| **Page blanche au chargement** | Nginx ne trouve pas le frontend | `docker compose logs nginx` |
| **Erreur 502 Bad Gateway** | Backend inaccessible | `docker compose logs backend` — vérifier que Django tourne |
| **Erreur de connexion à la base** | PostgreSQL pas prêt ou mauvais .env | `docker compose logs db` — vérifier `DB_HOST=db` dans `.env` |
| **HTTPS qui ne fonctionne pas** | Certificat SSL pas généré | Exécuter `./scripts/init-ssl.sh` |
| **Espace disque plein** | Logs ou backups accumulés | `docker system prune -f` — nettoyer les vieux conteneurs/images |

## Logs utiles pour le diagnostic

```bash
# Tous les logs en temps réel
docker compose logs -f

# Logs spécifiques
docker compose logs backend
docker compose logs nginx
docker compose logs db

# Inspection d'un conteneur
docker inspect <NOM_DU_CONTENEUR>

# Shell dans un conteneur
docker compose exec backend sh
docker compose exec db psql -U recup_user recup_indurex
```

---

> **Document généré le :** $(date '+%Y-%m-%d')
>
> **Projet :** RECUP-DZ — Système de Gestion des Récupérateurs de Déchets
>
> **Conformité :** Loi n°01-19 | Décret exécutif n°06-104
