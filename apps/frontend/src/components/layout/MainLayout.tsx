import { Outlet } from 'react-router-dom';
import { Navbar } from '@components/layout/Navbar';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const MainLayout = () => {
    const { isDark } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div
            className={`min-h-screen transition-colors duration-200 ${isDark ? 'dark bg-zinc-950' : 'bg-zinc-50'}`}
        >
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
