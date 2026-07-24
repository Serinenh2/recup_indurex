"""Sentry configuration pour le backend Django.

Usage dans settings.py :
    from apps.accounts.sentry import init_sentry
    init_sentry()
"""

import os
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration


def _before_send(event, hint):
    """Nettoie les données sensibles avant envoi à Sentry.

    - Masque les tokens JWT dans les headers Authorization
    - Masque les cookies
    """
    if 'request' in event and 'headers' in event['request']:
        headers = event['request']['headers']
        if 'Authorization' in headers:
            headers['Authorization'] = '[REDACTED]'
        if 'Cookie' in headers:
            headers['Cookie'] = '[REDACTED]'
    return event


def init_sentry():
    """Initialise le SDK Sentry pour Django.

    À appeler dans settings.py. Ne fait rien si SENTRY_DSN n'est pas défini.
    """
    dsn = os.getenv('SENTRY_DSN', '')
    if not dsn:
        return

    is_debug = os.getenv('DJANGO_DEBUG', '').lower() in ('true', '1', 'yes')
    environment = 'production' if not is_debug else 'development'

    sentry_sdk.init(
        dsn=dsn,
        environment=environment,
        integrations=[DjangoIntegration()],

        # Performance & profiling
        traces_sample_rate=0.2,
        profiles_sample_rate=0.2,

        # Ignorer les erreurs "normales" (404, 403, throttle, etc.)
        ignore_errors=[
            'django.http.Http404',
            'django.core.exceptions.PermissionDenied',
            'rest_framework.exceptions.PermissionDenied',
            'rest_framework.exceptions.AuthenticationFailed',
            'rest_framework.exceptions.NotAuthenticated',
            'rest_framework.exceptions.Throttled',
        ],

        # Ne pas envoyer les PII (emails, IPs) sauf si explicite
        send_default_pii=False,

        # Version de l'application
        release=os.getenv('SENTRY_RELEASE', ''),

        # Filtre before_send pour masquer les secrets
        before_send=_before_send,
    )
