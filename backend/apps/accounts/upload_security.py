"""File upload security utilities.

Usage in your serializers or views:

    from apps.accounts.upload_security import validate_uploaded_file

    def perform_create(self, serializer):
        fichier = self.request.FILES.get('fichier')
        fichier = validate_uploaded_file(fichier)  # raises ValidationError if invalid
        ...
"""

import os
import re
from rest_framework.exceptions import ValidationError

# ── Allowed MIME types per category ──────────────────────────
ALLOWED_IMAGE_MIMES = {
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
}

ALLOWED_DOCUMENT_MIMES = {
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
}

ALLOWED_ALL_MIMES = ALLOWED_IMAGE_MIMES | ALLOWED_DOCUMENT_MIMES

# ── Size limits ─────────────────────────────────────────────
MAX_IMAGE_SIZE = 5 * 1024 * 1024       # 5 MB
MAX_DOCUMENT_SIZE = 20 * 1024 * 1024   # 20 MB
MAX_UPLOAD_SIZE = 20 * 1024 * 1024     # 20 MB global


def sanitize_filename(filename):
    """Remove path traversal sequences and dangerous characters.

    - Strips any leading directory separators or '../' sequences
    - Replaces non-alphanumeric characters (except . - _) with underscores
    - Limits filename length to 200 chars
    """
    # Remove path traversal
    filename = os.path.basename(filename)
    # Remove null bytes
    filename = filename.replace('\x00', '')
    # Replace dangerous characters
    filename = re.sub(r'[^\w\.\-]', '_', filename)
    # Collapse multiple underscores/dots/hyphens
    filename = re.sub(r'[_\-.]+', '_', filename)
    # Limit length
    if len(filename) > 200:
        name, ext = os.path.splitext(filename)
        filename = name[:195] + ext[:5]
    return filename


def validate_uploaded_file(fichier, allowed_mimes=None, max_size=None):
    """Validate an uploaded file object.

    Returns the validated file (with sanitized name) or raises ValidationError.

    Args:
        fichier: UploadedFile object from request.FILES
        allowed_mimes: Set of allowed MIME types (defaults to ALLOWED_ALL_MIMES)
        max_size: Maximum file size in bytes (defaults to MAX_UPLOAD_SIZE)
    """
    if fichier is None:
        return None

    allowed = allowed_mimes or ALLOWED_ALL_MIMES
    max_sz = max_size or MAX_UPLOAD_SIZE

    # 1. Check size
    if fichier.size > max_sz:
        max_mb = max_sz / (1024 * 1024)
        raise ValidationError(
            f"Le fichier dépasse la taille maximale de {max_mb:.0f} Mo."
        )

    # 2. Check MIME type from content-type header (preliminary)
    content_type = getattr(fichier, 'content_type', '') or ''
    if content_type and content_type not in allowed:
        raise ValidationError(
            f"Type de fichier non autorisé : {content_type}."
        )

    # 3. Sanitize filename
    fichier.name = sanitize_filename(fichier.name)

    return fichier
