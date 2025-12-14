import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ThemeProvider } from './contexts/ThemeContext';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { FullPageLoader } from '@components/ui/PageLoader';

export const App = () => {
    const { checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        void checkAuth();
    }, [checkAuth]);

    if (isLoading) return <FullPageLoader />;

    return (
        <ThemeProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
