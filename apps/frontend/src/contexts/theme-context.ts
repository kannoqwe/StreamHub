import { createContext, useContext } from 'react';

export interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    isDark: true,
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
