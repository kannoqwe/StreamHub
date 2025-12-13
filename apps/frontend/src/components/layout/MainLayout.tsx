import { Outlet } from 'react-router-dom';
import { Navbar } from '@components/layout/Navbar';

export const MainLayout = () => {
    return (
        <div className="dark min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar toggleSidebar={() => {}} />

            <main className="pt-14 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};
