import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

/** Initialise Sentry (côté frontend). Appelé une fois au démarrage. */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('⚠️  VITE_SENTRY_DSN non défini — Sentry désactivé');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.PROD ? 'production' : 'development',
    enabled: !!SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Capture 100% des transactions en dev, 20% en prod
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    // Replay : 100% en dev, 10% en prod
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
  });
}

/** Met à jour le contexte utilisateur dans Sentry après connexion. */
export function setSentryUser(user: { id?: string | number; email?: string; username?: string } | null) {
  if (!SENTRY_DSN) return;
  if (user) {
    Sentry.setUser({
      id: String(user.id),
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

export { Sentry };
