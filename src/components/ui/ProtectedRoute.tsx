import { ReactNode, useEffect, useRef, FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';

type ProtectedRouteProps = {
    children: ReactNode;
};

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, logoutIntentional, setLogoutIntentional, loading } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const snackbarShownRef = useRef({
        sessionClosed: false,
        loginRequired: false,
    });

    useEffect(() => {
        if (!loading) {
            if (logoutIntentional && !snackbarShownRef.current.sessionClosed) {
                enqueueSnackbar("Sesión cerrada", { variant: 'success' });
                snackbarShownRef.current.sessionClosed = true;
                setLogoutIntentional(false);
            } else if (!isAuthenticated && !logoutIntentional && !snackbarShownRef.current.loginRequired && !snackbarShownRef.current.sessionClosed) {
                enqueueSnackbar("Debe iniciar sesión", { variant: 'warning' });
                snackbarShownRef.current.loginRequired = true;
            }
        }
    }, [isAuthenticated, logoutIntentional, loading, enqueueSnackbar, setLogoutIntentional]);


    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
