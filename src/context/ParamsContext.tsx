import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { apiClientWithToken } from "../utils/apiClient";
import { ParamType } from "../models/type/ParamType";
import { ParamResponse } from "../models/response/ParamResponse";

interface ParamContextType {
  paramsByMaestro: Record<number, ParamType[]>;
  loading: boolean;
  error: string | null;
  fetchAndCacheParams: (idMaestros: string) => Promise<void>;
  refetchAndCacheParams: (idMaestros: string) => Promise<void>;
}

const ParamContext = createContext<ParamContextType | undefined>(undefined);

export const ParamsProvider = ({ children }: { children: ReactNode }) => {
  const [paramsByMaestro, setParamsByMaestro] = useState<
    Record<number, ParamType[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedIds, setFetchedIds] = useState<Set<string>>(new Set());

  const fetchParamsFromAPI = useCallback(
    async (idMaestros: string, force: boolean = false) => {
      if (!force && fetchedIds.has(idMaestros)) return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiClientWithToken.get<ParamResponse>(
          `/fmi/params/list?groupIdMaestros=${idMaestros}`
        );

        const parametros = response.data.listParametros || [];

        if (response.data.result.idTipoMensaje === 2 && parametros.length > 0) {
          const groupedData = parametros.reduce((acc, param) => {
            acc[param.idMaestro] = acc[param.idMaestro] || [];
            acc[param.idMaestro].push(param);
            return acc;
          }, {} as Record<number, ParamType[]>);

          setParamsByMaestro((prev) => ({ ...prev, ...groupedData }));
          setFetchedIds((prev) => new Set(prev).add(idMaestros));
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
    },
    [fetchedIds]
  );
  const fetchAndCacheParams = useCallback(
    async (idMaestros: string) => {
      if (fetchedIds.has(idMaestros)) return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiClientWithToken.get<ParamResponse>(
          `/fmi/params/list?groupIdMaestros=${idMaestros}`
        );

        const parametros = response.data.listParametros || [];

        if (response.data.result.idTipoMensaje === 2 && parametros.length > 0) {
          const groupedData = parametros.reduce((acc, param) => {
            acc[param.idMaestro] = acc[param.idMaestro] || [];
            acc[param.idMaestro].push(param);
            return acc;
          }, {} as Record<number, ParamType[]>);

          setParamsByMaestro((prev) => ({ ...prev, ...groupedData }));
          setFetchedIds((prev) => new Set(prev).add(idMaestros));
        } else {
          setError(response.data.result.mensaje);
          setLoading(false);
        }
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.result?.mensaje || err.message
          : "Error desconocido";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchedIds]
  );
  const refetchAndCacheParams = useCallback(
    (idMaestros: string) => fetchParamsFromAPI(idMaestros, true),
    [fetchParamsFromAPI]
  );

  return (
    <ParamContext.Provider
      value={{
        paramsByMaestro,
        loading,
        error,
        fetchAndCacheParams,
        refetchAndCacheParams,
      }}
    >
      {children}
    </ParamContext.Provider>
  );
};

export const useParams = (idMaestros?: string) => {
  const context = useContext(ParamContext);

  if (!context) {
    throw new Error("useParams debe usarse dentro de un ParamsProvider");
  }

  const {
    paramsByMaestro,
    loading,
    error,
    fetchAndCacheParams,
    refetchAndCacheParams,
  } = context;

  useEffect(() => {
    if (idMaestros) {
      fetchAndCacheParams(idMaestros);
    }
  }, [idMaestros, fetchAndCacheParams]);

  return {
    paramsByMaestro,
    loading,
    error,
    fetchParams: fetchAndCacheParams,
    refetchParams: refetchAndCacheParams,
  };
};
