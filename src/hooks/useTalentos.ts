import { useState, useEffect, useCallback } from 'react';
import { TalentoType } from '../models/type/TalentoType';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { TalentosResponse } from '../models/response/TalentosResponse';

const useTalentos = () => {
    const [talentos, setTalentos] = useState<TalentoType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [emptyList, setEmptyList] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchTalentos = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const response = await apiClientWithToken.get<TalentosResponse>(`/fmi/talent/list?nPag=${page}`);

            if (response.status === 200 && response.data.idTipoMensaje === 2) {
                setTalentos(response.data.talentos);
                setEmptyList(response.data.talentos.length === 0);
                return;
            }
            enqueueSnackbar(response.data.mensaje, { variant: 'error' });
        } catch (error) {
            setTalentos([]);
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        fetchTalentos(currentPage);
    }, [currentPage, enqueueSnackbar, fetchTalentos]);

    return { talentos, loading, currentPage, setCurrentPage, emptyList };
};

export default useTalentos;
