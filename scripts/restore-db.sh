#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# restore-db.sh — Restaurer une sauvegarde PostgreSQL
#
# Utilisation :
#   ./scripts/restore-db.sh backups/db/recup_indurex_20250101_120000.sql.gz
#
# ATTENTION : Cela ÉCRASE la base de données existante.
# Prérequis : Docker Compose doit être en cours d'exécution.
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
  echo "❌ Docker Compose est requis."
  exit 1
fi

# ── Arguments ───────────────────────────────────────────────
BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  echo "❌ Usage: $0 <fichier_backup.sql.gz>"
  echo ""
  echo "   Sauvegardes disponibles :"
  ls -1h backups/db/recup_indurex_*.sql.gz 2>/dev/null || echo "   (aucune sauvegarde trouvée dans backups/db/)"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Fichier introuvable : $BACKUP_FILE"
  exit 1
fi

# ── Infos sur le backup ─────────────────────────────────────
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
FILE_DATE=$(date -r "$BACKUP_FILE" "+%d/%m/%Y %H:%M" 2>/dev/null || echo "inconnue")
DB_NAME="${DB_NAME:-recup_indurex}"
DB_USER="${DB_USER:-recup_user}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ⚠️  RESTAURATION POSTGRESQL"
echo "  🔴 Cette action VA EFFACER la base existante !"
echo "  📦 Fichier  : $BACKUP_FILE"
echo "  📏 Taille   : $FILE_SIZE"
echo "  📅 Date     : $FILE_DATE"
echo "  🎯 Base     : $DB_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Vérifier l'intégrité du backup ─────────────────────────
echo "🔍 Vérification de l'intégrité..."
if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
  echo "❌ Le fichier de backup est corrompu."
  exit 1
fi
echo "  ✅ Intégrité OK"
echo ""

# ── Confirmation ───────────────────────────────────────────
read -p "⚠️  Continuer la restauration ? (oui/NON) " CONFIRM
if [ "$CONFIRM" != "oui" ]; then
  echo "  ❌ Annulé."
  exit 1
fi

# ── Restaurer (via docker compose exec) ─────────────────────
echo ""
echo "🔄 Restauration en cours..."
gunzip -c "$BACKUP_FILE" | docker compose exec -T db psql \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --set ON_ERROR_STOP=on \
  2>&1

RESTORE_EXIT=$?

if [ $RESTORE_EXIT -eq 0 ]; then
  echo ""
  echo "  ✅ Restauration terminée avec succès !"
else
  echo ""
  echo "  ❌ Erreur lors de la restauration (code: $RESTORE_EXIT)"
  echo "  Vérifiez que la base '$DB_NAME' existe et est accessible."
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
