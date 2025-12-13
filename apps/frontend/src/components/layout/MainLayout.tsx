import { Outlet } from 'react-router-dom';
import { Navbar } from '@components/layout/Navbar';
import { useState } from 'react';

export const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="dark min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar
                toggleSidebar={() => {
                    setSidebarOpen(!sidebarOpen);
                }}
            />

            <main className="pt-14 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};
