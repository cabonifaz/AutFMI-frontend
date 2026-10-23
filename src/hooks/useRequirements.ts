import { useCallback, useEffect, useState } from "react";
import { apiClientWithToken } from "../utils/apiClient";
import { RequerimientosResponse } from "../models/response/RequirementListResponse";
import { RequirementItem } from "../models/type/RequirementItemType";

type FetchRequerimientosParams = {
    nPag: number;
    cPag?: string | null;
    idCliente?: number | null;
    buscar?: string | null;
    fechaSolicitud?: string | null;
    estado?: number | null;
    idContactos?: number[];
    idPerfiles?: number[];
    idTalentos?: number[];
};

export const useRequerimientos = () => {
    const [requerimientos, setRequerimientos] = useState<RequirementItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalElementos, setTotalElementos] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [emptyList, setEmptyList] = useState<boolean>(false);
    const [filters, setFilters] = useState<Omit<FetchRequerimientosParams, 'nPag'>>({
        cPag: null,
        idCliente: null,
        buscar: null,
        fechaSolicitud: null,
        estado: null,
        idContactos: [],
        idPerfiles: [],
        idTalentos: [],
    });

    const fetchRequerimientos = useCallback(async (params: FetchRequerimientosParams) => {
        setLoading(true);
        const { nPag, ...newFilters } = params;
        setFilters(newFilters);
        try {
            const queryParams: Record<string, string> = {};
            Object.entries(params).forEach(([key, value]) => {
                // Las listas viajan como "1,2"; una lista vacía no se envía.
                if (value !== null && value !== undefined && value.toString() !== '') {
                    queryParams[key] = value.toString();
                }
            });

            const response = await apiClientWithToken.get<RequerimientosResponse>('/fmi/requirement/list', {
                params: queryParams,
            });

            if (response.status === 200 && response.data.idTipoMensaje === 2) {
                setRequerimientos(response.data.requerimientos || []);
                setTotalElementos(response.data.totalElementos || 0);
                setTotalPaginas(response.data.totalPaginas || 0);
                setEmptyList(response.data.requerimientos.length === 0);
                return;
            }
        } catch (error) {
            setRequerimientos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const params: FetchRequerimientosParams = {
            nPag: currentPage,
            ...filters,
        };
        fetchRequerimientos(params);
    }, [currentPage]);

    return { requerimientos, loading, fetchRequerimientos, setCurrentPage, currentPage, emptyList, totalElementos, totalPaginas };
};