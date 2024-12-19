import { useState } from 'react';
import { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { BaseResponse } from '../models/response/BaseResponse';

interface UsePostHookReturn {
    postData: (url: string, data: Record<string, unknown>) => Promise<BaseResponse>;
    postloading: boolean;
}

export const usePostHook = (): UsePostHookReturn => {
    const { enqueueSnackbar } = useSnackbar();
    const [postloading, setPostLoading] = useState(false);

    const postData = async (url: string, data: Record<string, unknown>): Promise<BaseResponse> => {
        setPostLoading(true);
        try {
            const res: AxiosResponse<BaseResponse> = await apiClientWithToken.post(url, data);
            if (res.data.idTipoMensaje === 2) {
                enqueueSnackbar(res.data.mensaje, { variant: 'success' });
                return res.data;
            }
            enqueueSnackbar(res.data.mensaje, { variant: 'error' });
            return res.data;
        } finally {
            setPostLoading(false);
        }
    };

    return { postData, postloading };
};
