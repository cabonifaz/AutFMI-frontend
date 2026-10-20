import { ReactNode, useEffect, useRef, FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { getLandingPath, isRouteAllowed } from '../../utils/navigation';
import { Utils } from '../../utils/utils';

type ProtectedRouteProps = {
    children: ReactNode;
};

/**
 * Valida la sesión y, además, que la ruta actual esté entre las rutas permitidas
 * del token (vienen de la base de datos; las hijas se resuelven por prefijo). Si
 * no lo está, redirige al primer módulo accesible del usuario o a "/no-autorizado".
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, logoutIntentional, setLogoutIntentional, loading, getToken } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const location = useLocation();
    const token = getToken();
    const permitted = isRouteAllowed(location.pathname, Utils.getUserRoutes(token));
    const snackbarShownRef = useRef({
        sessionClosed: false,
        loginRequired: false,
        notAuthorized: false,
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

    useEffect(() => {
        if (loading || !isAuthenticated) return;
        if (permitted) {
            snackbarShownRef.current.notAuthorized = false;
            return;
        }
        if (!snackbarShownRef.current.notAuthorized) {
            enqueueSnackbar("No autorizado", { variant: 'error' });
            snackbarShownRef.current.notAuthorized = true;
        }
    }, [permitted, isAuthenticated, loading, location.pathname, enqueueSnackbar]);


    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    if (!permitted) {
        return <Navigate to={getLandingPath(token)} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
