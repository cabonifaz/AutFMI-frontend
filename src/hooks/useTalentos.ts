import { useState, useEffect, useCallback } from 'react';
import { TalentoType } from '../models/type/TalentoType';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { TalentosResponse } from '../models/response/TalentosResponse';

const useTalentos = () => {
    const [talentos, setTalentos] = useState<TalentoType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [emptyList, setEmptyList] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchTalentos = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const endpoint = search
                ? `/fmi/talent/list?busqueda=${encodeURIComponent(search)}`
                : `/fmi/talent/list?nPag=${page}`;

            const response = await apiClientWithToken.get<TalentosResponse>(endpoint);

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
        fetchTalentos(currentPage, searchTerm);
    }, [currentPage, enqueueSnackbar, fetchTalentos, searchTerm]);

    return { talentos, loading, currentPage, setCurrentPage, emptyList, setSearchTerm };
};

export default useTalentos;
