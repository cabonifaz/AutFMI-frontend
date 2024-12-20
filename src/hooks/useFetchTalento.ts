import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { TalentoDetailType } from '../models/type/TalentoDetailType';
import { TalentoResponse } from '../models/response/TalentoResponse';

const useFetchTalento = (talentoId: number) => {
    const [talentoDetails, setTalentoDetails] = useState<TalentoDetailType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchTalentos = async () => {
            setLoading(true);
            try {
                const response = await apiClientWithToken.get<TalentoResponse>(`/fmi/talent/data?idTalento=${talentoId}`);

                if (response.data.idTipoMensaje === 2) {
                    setTalentoDetails(response.data.talento);
                    return;
                }
                enqueueSnackbar(response.data.mensaje, { variant: 'error' });
            } catch (error) { }
            finally {
                setLoading(false);
            }
        };

        fetchTalentos();
    }, [enqueueSnackbar, talentoId]);

    return { talentoDetails, loading };
};

export default useFetchTalento;
