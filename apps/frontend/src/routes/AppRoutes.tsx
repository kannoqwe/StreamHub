import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@features/home/HomePage';
import { MainLayout } from '@components/layout/MainLayout';
import { NotFoundPage } from '@features/notfound/NotFoundPage';
import { LoginPage } from '@features/auth/LoginPage';
import { RegisterPage } from '@features/auth/RegisterPage';
import { StreamPage } from '@features/stream/StreamPage';
import { useAuthStore } from '../stores/useAuthStore';

export const AppRoutes = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />

                <Route
                    path="/login"
                    element={
                        !user ? <LoginPage /> : <Navigate to="/" replace />
                    }
                />
                <Route
                    path="/signup"
                    element={
                        !user ? <RegisterPage /> : <Navigate to="/" replace />
                    }
                />

                <Route path="/:username" element={<StreamPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};
