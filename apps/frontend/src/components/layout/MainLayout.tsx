import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@components/layout/Navbar';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sidebar } from '@components/layout/Sidebar';

export const MainLayout = () => {
    const { isDark } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    return (
        <div
            className={`min-h-screen transition-colors duration-200 ${isDark ? 'dark bg-zinc-950' : 'bg-zinc-50'}`}
        >
            <div className="relative z-10 font-sans text-zinc-900 dark:text-zinc-100 min-h-screen flex flex-col">
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex pt-14 h-screen overflow-hidden">
                    {!isAuthPage && <Sidebar isOpen={sidebarOpen} />}
                    <main
                        className={`flex-1 transition-all duration-300 ${
                            sidebarOpen && !isAuthPage ? 'lg:ml-60' : 'ml-0'
                        } overflow-y-auto`}
                    >
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};
