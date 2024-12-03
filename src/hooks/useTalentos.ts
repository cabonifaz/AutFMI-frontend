import { useState, useEffect } from 'react';
import { TalentoType } from '../types/TalentoType';
import { TalentosResponse } from '../types/TalentosResponse';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';

const useTalentos = () => {
    const [talentos, setTalentos] = useState<TalentoType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchTalentos = async () => {
            setLoading(true);
            try {
                const response = await apiClientWithToken.get<TalentosResponse>('/fmi/talent/list');

                if (response.status === 200 && response.data.idTipoMensaje === 2) {
                    setTalentos(response.data.talentos);
                    return;
                }
                enqueueSnackbar(response.data.mensaje, { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchTalentos();
    }, [enqueueSnackbar]);

    return { talentos, loading };
};

export default useTalentos;
