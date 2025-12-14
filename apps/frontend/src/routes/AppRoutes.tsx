import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@features/home/HomePage';
import { MainLayout } from '@components/layout/MainLayout';
import { NotFoundPage } from '@features/notfound/NotFoundPage';
import { LoginPage } from '@features/login/LoginPage';
import { RegisterPage } from '@features/register/RegisterPage';

export const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);
