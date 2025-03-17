import { createContext, useContext, useState, ReactNode } from 'react';

interface MenuContextType {
    isMenuOpen: boolean;
    toggleMenu: () => void;
};

const MenuContext = createContext<MenuContextType>({
    isMenuOpen: false,
    toggleMenu: () => { },
});

export const useMenu = () => useContext(MenuContext);

interface MenuProviderProps {
    children: ReactNode;
};

export const MenuProvider = ({ children }: MenuProviderProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    return (
        <MenuContext.Provider value={{ isMenuOpen, toggleMenu }}>
            {children}
        </MenuContext.Provider>
    );
};