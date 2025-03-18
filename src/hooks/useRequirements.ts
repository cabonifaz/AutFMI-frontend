import { useCallback, useEffect, useState } from "react";
import { apiClientWithToken } from "../utils/apiClient";
import { RequerimientosResponse } from "../models/response/RequirementListResponse";
import { RequirementItem } from "../models/type/RequirementItemType";

type FetchRequerimientosParams = {
    nPag: number;
    cPag?: string | null;
    idCliente?: number | null;
    codigoRQ?: string | null;
    fechaSolicitud?: string | null;
    estado?: number | null;
};

export const useRequerimientos = () => {
    const [requerimientos, setRequerimientos] = useState<RequirementItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [emptyList, setEmptyList] = useState<boolean>(false);

    const fetchRequerimientos = useCallback(async (params: FetchRequerimientosParams) => {
        setLoading(true);
        try {
            const queryParams: Record<string, string> = {};
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    queryParams[key] = value.toString();
                }
            });

            const response = await apiClientWithToken.get<RequerimientosResponse>('/fmi/requirement/list', {
                params: queryParams,
            });

            if (response.status === 200 && response.data.idTipoMensaje === 2) {
                setRequerimientos(response.data.requerimientos || []);
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
            cPag: null,
            idCliente: null,
            codigoRQ: null,
            fechaSolicitud: null,
            estado: null,
        };
        fetchRequerimientos(params);
    }, [currentPage, fetchRequerimientos]);

    return { requerimientos, loading, fetchRequerimientos, setCurrentPage, currentPage, emptyList };
};