# ── Build stage ──────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies for Pillow, reportlab, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ── Runtime stage ────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Runtime deps only (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo \
    zlib1g \
    libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r django && useradd -r -g django -d /app -s /bin/false django

# Copy installed packages from builder
COPY --from=builder /root/.local /home/django/.local
ENV PATH=/home/django/.local/bin:$PATH
ENV PYTHONPATH=/home/django/.local/lib/python3.11/site-packages

# Copy application code
COPY . .

# Create required directories with correct permissions
RUN mkdir -p /app/logs /app/media /app/staticfiles && \
    touch /app/logs/django.log && \
    chmod -R 777 /app/logs && \
    chown -R django:django /app

# Collect static files
RUN python manage.py collectstatic --noinput --clear

# Switch to non-root user
USER django

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import http.client; conn=http.client.HTTPConnection('localhost',8000); conn.request('GET','/'); resp=conn.getresponse(); resp.read(); assert resp.status < 500" || exit 1

# Run with Gunicorn
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]
