import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { MainLayout } from '@components/layout/MainLayout';

export const App = () => {
    return (
        <BrowserRouter>
            <MainLayout />
            <AppRoutes />
        </BrowserRouter>
    );
};

export default App;
