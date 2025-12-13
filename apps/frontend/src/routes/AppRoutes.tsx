import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@features/home/HomePage';
import { MainLayout } from '@components/layout/MainLayout';
import { NotFoundPage } from '@features/notfound/NotFoundPage';

export const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);
