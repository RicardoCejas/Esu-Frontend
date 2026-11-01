import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <OfflineBanner />
        <BrowserRouter>
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
