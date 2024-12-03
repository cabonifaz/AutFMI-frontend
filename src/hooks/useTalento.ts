import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { TalentoResponse } from '../types/TalentoResponse';
import { TalentoDetailType } from '../types/TalentoDetailType';

const useTalento = (talentoId: number) => {
    const [talentoDetails, setTalentoDetails] = useState<TalentoDetailType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchTalentos = async () => {
            setLoading(true);
            try {
                const response = await apiClientWithToken.get<TalentoResponse>(`/fmi/talent/data?idTalento=${talentoId}`);
                console.log(response);


                if (response.status === 200 && response.data.idTipoMensaje === 2) {
                    setTalentoDetails(response.data.talento);
                    return;
                }
                enqueueSnackbar(response.data.mensaje, { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchTalentos();
    }, [enqueueSnackbar, talentoId]);

    return { talentoDetails, loading };
};

export default useTalento;
