#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# backup-db.sh — Sauvegarde PostgreSQL avec compression et rotation
#
# Utilisation :
#   ./scripts/backup-db.sh                        # sauvegarde manuelle via Docker
#   ./scripts/backup-db.sh /custom/path/backups   # dossier personnalisé
#
# Prérequis : Docker Compose doit être en cours d'exécution.
#
# Variables d'environnement (ou .env) :
#   BACKUP_DIR          — dossier de sauvegarde (défaut: ./backups/db)
#   BACKUP_RETENTION_DAYS — rétention en jours (défaut: 30)
#   DB_NAME             — nom de la base (défaut: recup_indurex)
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ── Se positionner à la racine du projet ─────────────────────
cd "$(dirname "$0")/.."

# ── Charger .env si présent ─────────────────────────────────
if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
fi

# ── Vérifier les prérequis ──────────────────────────────────
if ! docker compose version &>/dev/null; then
  echo "❌ Docker Compose est requis. Installez-le ou vérifiez votre installation."
  exit 1
fi

# Vérifier que le service db tourne
if ! docker compose exec -T db pg_isready -U "${DB_USER:-recup_user}" &>/dev/null; then
  echo "❌ Le service PostgreSQL (db) n'est pas accessible."
  echo "   Assurez-vous que 'docker compose up -d' est lancé."
  exit 1
fi

# ── Configuration ───────────────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-./backups/db}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DB_NAME="${DB_NAME:-recup_indurex}"
DB_USER="${DB_USER:-recup_user}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="recup_indurex_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  💾 Sauvegarde PostgreSQL"
echo "  🔗 Docker Compose exec → db"
echo "  📦 Base    : $DB_NAME"
echo "  📁 Dossier : $BACKUP_DIR"
echo "  📄 Fichier : $FILENAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Dump PostgreSQL → gzip (via docker compose exec) ────────
docker compose exec -T db pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --verbose \
  2>"${BACKUP_DIR}/${FILENAME}.log" \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

BACKUP_EXIT=$?

# ── Vérification de l'intégrité ─────────────────────────────
if [ $BACKUP_EXIT -eq 0 ] && gunzip -t "${BACKUP_DIR}/${FILENAME}" 2>/dev/null; then
  SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
  echo "  ✅ Sauvegarde réussie : ${FILENAME} (${SIZE})"

  # Nettoyer le fichier log en cas de succès
  rm -f "${BACKUP_DIR}/${FILENAME}.log"
else
  echo "  ❌ ÉCHEC de la sauvegarde"
  echo "  Voir les détails : ${BACKUP_DIR}/${FILENAME}.log"
  exit 1
fi

# ── Rotation : supprimer les backups plus vieux que N jours ─
OLD_COUNT=$(find "$BACKUP_DIR" -maxdepth 1 -name "recup_indurex_*.sql.gz" -mtime +$RETENTION_DAYS 2>/dev/null | wc -l | tr -d ' ')
if [ "$OLD_COUNT" -gt 0 ]; then
  find "$BACKUP_DIR" -maxdepth 1 -name "recup_indurex_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null
  echo "  🗑️  Rotation : $OLD_COUNT sauvegarde(s) supprimée(s) (+${RETENTION_DAYS} jours)"
fi

# ── Résumé ──────────────────────────────────────────────────
TOTAL=$(find "$BACKUP_DIR" -maxdepth 1 -name "recup_indurex_*.sql.gz" | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
echo "  📊 $TOTAL sauvegarde(s) — espace total : ${TOTAL_SIZE:-0}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
