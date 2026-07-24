import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initSentry, Sentry } from './sentry';
import './index.css';

// Initialiser Sentry au plus tôt
initSentry();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <BrowserRouter>
        <Sentry.ErrorBoundary
          fallback={({ error, resetError }) => (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
              <div className="max-w-md text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h1 className="text-xl font-bold text-red-800">
                  Une erreur inattendue est survenue
                </h1>
                <p className="text-red-600 text-sm">
                  L'équipe technique a été notifiée. Veuillez réessayer.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Recharger la page
                </button>
                {import.meta.env.DEV && (
                  <pre className="mt-4 p-4 bg-red-100 rounded text-left text-xs overflow-auto max-h-40">
                    {(error as Error)?.message}
                  </pre>
                )}
              </div>
            </div>
          )}
        >
          <App />
        </Sentry.ErrorBoundary>
      </BrowserRouter>
    </StrictMode>
  );
}
