import { useState, useEffect } from 'react';
import { TalentoType } from '../models/type/TalentoType';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { TalentosResponse } from '../models/response/TalentosResponse';

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
