import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { ParamType } from '../models/type/ParamType';
import { ParamResponse } from '../models/response/ParamResponse';

const useFetchParams = (paramsId: string) => {
    const [params, setParams] = useState<ParamType[] | null>(null);
    const [paramLoading, setParamLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchTalentos = async () => {
            setParamLoading(true);
            try {
                const response = await apiClientWithToken.get<ParamResponse>(`/fmi/params/list?groupIdMaestros=${paramsId}`);

                if (response.data.result.idTipoMensaje === 2) {
                    setParams(response.data.listParametros);
                    return;
                }
                enqueueSnackbar(response.data.result.mensaje, { variant: 'error' });
            } catch (error) { }
            finally {
                setParamLoading(false);
            }
        };

        fetchTalentos();
    }, [enqueueSnackbar, paramsId]);

    return { params, paramLoading };
};

export default useFetchParams;
