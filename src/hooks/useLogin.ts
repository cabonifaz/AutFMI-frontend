import { useState, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { apiClientWithoutToken } from '../utils/apiClient';
import { LoginResponse } from '../types/LoginResponse';
import { useAuth } from '../components/AuthContext';

const useLogin = () => {
    const { enqueueSnackbar } = useSnackbar();
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (): Promise<boolean> => {
        setLoading(true);

        const username = usernameRef.current?.value.trim();
        const password = passwordRef.current?.value.trim();

        if (!username || !password) {
            enqueueSnackbar('Por favor, complete todos los campos.', { variant: 'warning' });
            setLoading(false);
            return false;
        }

        try {
            const response = await apiClientWithoutToken.post<LoginResponse>('/fmi/auth/login', {
                username,
                password,
            });

            if (response.status === 200 && response.data.idTipoMensaje === 2) {
                login(response.data.token);
                enqueueSnackbar("Bienvenido", { variant: 'info' });
                return true;
            }
            enqueueSnackbar(response.data.mensaje, { variant: 'error' });
            return false;
        } catch (err: any) {
            enqueueSnackbar(err.message, { variant: 'error' });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const onLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await handleLogin();
        if (success) {
            navigate('/listaUsuarios');
        }
    };
    return {
        usernameRef,
        passwordRef,
        onLoginSubmit,
        loading,
    };
};

export default useLogin;
