import { createContext, useState, useContext, useEffect, ReactNode, FC } from 'react';
import Cookies from 'js-cookie';
import { TOKEN } from '../utils/config';
import { decodeJwt } from '../utils/jwt';

interface AuthContextType {
    isAuthenticated: boolean;
    logoutIntentional: boolean;
    loading: boolean;
    setLogoutIntentional: (value: boolean) => void,
    login: (token: string) => void;
    logout: () => void,
    getToken: () => string | undefined,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [logoutIntentional, setLogoutIntentional] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = Cookies.get(TOKEN);
        if (token) {
            const decodedToken = decodeJwt(token);
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken.exp && decodedToken.exp > currentTime) {
                setIsAuthenticated(true);
            } else {
                Cookies.remove(TOKEN);
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        Cookies.set(TOKEN, token, {
            expires: 8 / 24,
            secure: true,
            sameSite: 'Strict'
        });
        setIsAuthenticated(true);
    };

    const logout = () => {
        Cookies.remove(TOKEN);
        setIsAuthenticated(false);
        setLogoutIntentional(true);
    };

    const getToken = (): string | undefined => {
        return Cookies.get(TOKEN);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
                getToken,
                logoutIntentional,
                setLogoutIntentional,
                loading
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
