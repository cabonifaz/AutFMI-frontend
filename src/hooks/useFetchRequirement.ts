import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { apiClientWithToken } from "../utils/apiClient";
import { RequirementResponse } from "../models/response/RequirementResponse";

export const useFetchRequirement = (idRequerimiento: number | null) => {
    const [requirement, setRequirement] = useState<RequirementResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchRequirement = async () => {
            if (!idRequerimiento) return;

            setLoading(true);
            try {
                const response = await apiClientWithToken.get<RequirementResponse>(
                    `/fmi/requirement/data?idRequerimiento=${idRequerimiento}&showfiles=true`
                );

                if (response.data.idTipoMensaje === 2) {
                    setRequirement(response.data);
                    return;
                }
                enqueueSnackbar(response.data.mensaje, { variant: "error" });
            } catch (error) {
                enqueueSnackbar("Error al cargar los datos del requerimiento", {
                    variant: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRequirement();
    }, [enqueueSnackbar, idRequerimiento]);

    return { requirement, loading };
};