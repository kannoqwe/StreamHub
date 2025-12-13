import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@features/home/HomePage';

export const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<HomePage />} />
    </Routes>
);
