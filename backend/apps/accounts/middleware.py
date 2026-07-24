import sentry_sdk
from django.utils.deprecation import MiddlewareMixin


class AuditLogMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        request._audit_ip = self._get_client_ip(request)
        return None

    def _get_client_ip(self, request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        if xff:
            return xff.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class SecurityHeadersMiddleware(MiddlewareMixin):
    """Adds security headers not covered by Django's SecurityMiddleware.

    Applied as a safety net — in production, Nginx should also set these.
    """

    def process_response(self, request, response):
        if not response.get('Content-Security-Policy'):
            response['Content-Security-Policy'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: blob:; "
                "connect-src 'self'; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            )

        if not response.get('Permissions-Policy'):
            response['Permissions-Policy'] = (
                'camera=(), microphone=(), geolocation=(), '
                'interest-cohort=(), payment=(), usb=(), '
                'magnetometer=(), gyroscope=(), autoplay=()'
            )

        if not response.get('Cross-Origin-Resource-Policy'):
            response['Cross-Origin-Resource-Policy'] = 'same-origin'

        if not response.get('Cross-Origin-Opener-Policy'):
            response['Cross-Origin-Opener-Policy'] = 'same-origin'

        return response


class SentryUserContextMiddleware(MiddlewareMixin):
    """Attache l'utilisateur Django au contexte Sentry pour chaque requête."""

    def process_view(self, request, view_func, view_args, view_kwargs):
        if request.user.is_authenticated:
            with sentry_sdk.configure_scope() as scope:
                scope.set_user({
                    'id': str(request.user.id),
                    'email': request.user.email or '',
                    'username': request.user.username or '',
                })
        return None
