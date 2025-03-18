import axios, { AxiosInstance, isAxiosError } from 'axios';
import { API_BASE_URL, TOKEN } from './config';
import Cookies from 'js-cookie';
import { enqueueSnackbar } from 'notistack';

const setupInterceptors = (apiClient: AxiosInstance) => {
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;

        switch (status) {
          case 400:
            enqueueSnackbar('La solicitud es incorrecta. Verifica los datos e inténtalo nuevamente.', { variant: 'error' });
            break;
          case 401:
            enqueueSnackbar('Acceso denegado.', { variant: 'error' });
            break;
          case 403:
            enqueueSnackbar('No tienes permiso para acceder a este recurso.', { variant: 'error' });
            break;
          case 404:
            enqueueSnackbar('Recurso no encontrado.', { variant: 'error' });
            break;
          case 405:
            enqueueSnackbar('Método no permitido.', { variant: 'error' });
            break;
          case 409:
            enqueueSnackbar('Conflicto con la solicitud. Intenta con otro valor.', { variant: 'error' });
            break;
          case 429:
            enqueueSnackbar('Demasiadas solicitudes. Intenta nuevamente más tarde.', { variant: 'error' });
            break;
          default:
            enqueueSnackbar('Ocurrió un error en la solicitud.', { variant: 'error' });
        }
      }

      return Promise.reject(error);
    }
  );
};

const apiClientWithToken: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClientWithToken.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const apiClientWithoutToken: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClientWithToken);
setupInterceptors(apiClientWithoutToken);

export { apiClientWithToken, apiClientWithoutToken };
