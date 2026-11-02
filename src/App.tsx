import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { AppRoutes } from '@/routes/AppRoutes';

function CanonicalTag() {
  const location = useLocation();

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    const cleanUrl = `${window.location.origin}${location.pathname === '/' ? '/' : location.pathname}`;
    link.href = cleanUrl;
  }, [location.pathname]);

  return null;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <OfflineBanner />
        <BrowserRouter>
          <CanonicalTag />
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
