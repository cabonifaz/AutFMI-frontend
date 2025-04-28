import { useCallback, useState } from "react";
import { apiClientWithToken } from "../utils/apiClient";
import { enqueueSnackbar } from "notistack";
import { ReqContacto } from "../models/type/ReqContacto";
import { ClientContactResponse } from "../models/response/ClientContactsResponse";

export const useFetchClientContacts = () => {
    const [contactos, setContactos] = useState<ReqContacto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchContacts = useCallback(async (idCliente: number) => {
        setLoading(true);
        try {
            const response = await apiClientWithToken.get<ClientContactResponse>(`/fmi/client/listContacts?idCliente=${idCliente}`);

            if (response.data.idTipoMensaje === 2) {
                setContactos(response.data.lstClientContacts || []);
                return;
            }
            enqueueSnackbar(response.data.mensaje, { variant: 'warning' });
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
            setContactos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { contactos, loading, fetchContacts };
};