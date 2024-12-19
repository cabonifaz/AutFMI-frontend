import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { apiClientWithoutToken } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { LoginResponse } from '../models/response/LoginResponse';

const useLogin = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (username: string, password: string) => {
        try {
            setLoading(true);

            const response = await apiClientWithoutToken.post<LoginResponse>('/fmi/auth/login', {
                username,
                password,
            });

            if (response.data.idTipoMensaje === 2) {
                login(response.data.token);
                navigate('/listaTalentos');
                enqueueSnackbar("Bienvenido", { variant: 'info' });
                return;
            }
            enqueueSnackbar(response.data.mensaje, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, loading };
};

export default useLogin;
