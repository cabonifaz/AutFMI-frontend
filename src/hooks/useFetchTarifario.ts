import { useCallback, useEffect, useState } from "react";
import { Tarifa } from "../models/type/Tarifa";
import { apiClientWithToken } from "../utils/apiClient";
import { TarifarioResponse } from "../models/response/TarifarioResponse";
import { enqueueSnackbar } from "notistack";

export const useFetchTarifario = () => {
  const [tarifario, setTarifario] = useState<Tarifa[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTarifario = useCallback(async (idCliente: number) => {
    setLoading(true);

    try {
      const response = await apiClientWithToken.get<TarifarioResponse>(
        `/fmi/tarifario/list?idCliente=${idCliente}`,
      );

      if (response.data.idTipoMensaje === 2) {
        setTarifario(response.data.lstTarifario);
        return;
      }

      enqueueSnackbar(response.data.mensaje, { variant: "warning" });
    } catch (e) {
      console.error("Failed to fetch tarifario");
      setTarifario([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tarifario, fetchTarifario, loading };
};
