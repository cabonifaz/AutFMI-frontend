import { useCallback, useEffect, useState } from "react";
import { apiClientWithToken } from "../utils/apiClient";
import { ClientListResponse } from "../models/response/ClientListResponse";
import { ClientType } from "../models/type/ClientType";
import { enqueueSnackbar } from "notistack";

export const useFetchClients = () => {
    const [clientes, setClientes] = useState<ClientType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClientWithToken.get<ClientListResponse>('/fmi/client/list');

            if (response.data.idTipoMensaje === 2) {
                setClientes(response.data.clientes || []);
                return;
            }
            enqueueSnackbar(response.data.mensaje, { variant: 'warning' });
        } catch (error) {
            console.error("Failed to fetch clients:", error);
            setClientes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    return { clientes, loading, fetchClients };
};