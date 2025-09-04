import { useState, useCallback } from "react";
import axios from "axios";
import { apiClientWithToken } from "../utils/apiClient";
import { ParamType } from "../models/type/ParamType";
import { ParamResponse } from "../models/response/ParamResponse";

export const useFetchParams = () => {
  const [paramsByMaestro, setParamsByMaestro] = useState<
    Record<number, ParamType[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParams = useCallback(async (idMaestros: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClientWithToken.get<ParamResponse>(
        `/fmi/params/list?groupIdMaestros=${idMaestros}`,
      );

      const parametros = response.data.listParametros || [];

      if (response.data.result.idTipoMensaje === 2 && parametros.length > 0) {
        const groupedData = parametros.reduce(
          (acc, param) => {
            acc[param.idMaestro] = acc[param.idMaestro] || [];
            acc[param.idMaestro].push(param);
            return acc;
          },
          {} as Record<number, ParamType[]>,
        );

        setParamsByMaestro(groupedData);
      } else {
        setError(response.data.result.mensaje);
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.result?.mensaje || err.message
        : "Error desconocido";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    paramsByMaestro,
    loading,
    error,
    fetchParams,
  };
};
