import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { lazy, Suspense, useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { FullPageLoader } from '@components/ui/PageLoader';

const AppRoutes = lazy(() =>
    import('./routes/AppRoutes').then((module) => ({
        default: module.AppRoutes,
    })),
);

export const App = () => {
    const { checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        void checkAuth();
    }, [checkAuth]);

    if (isLoading) return <FullPageLoader />;

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Suspense fallback={<FullPageLoader />}>
                    <AppRoutes />
                </Suspense>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
