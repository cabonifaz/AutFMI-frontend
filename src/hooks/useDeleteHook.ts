import { useState } from 'react';
import { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { BaseResponse } from '../models/response/BaseResponse';

interface UseDeleteHookReturn {
    deleteData: (url: string) => Promise<BaseResponse>;
    deleteLoading: boolean;
}

export const useDeleteHook = (): UseDeleteHookReturn => {
    const { enqueueSnackbar } = useSnackbar();
    const [deleteLoading, setDeleteLoading] = useState(false);

    const deleteData = async (url: string): Promise<BaseResponse> => {
        setDeleteLoading(true);
        try {
            const res: AxiosResponse<BaseResponse> = await apiClientWithToken.delete(url);
            if (res.data.idTipoMensaje === 2) {
                enqueueSnackbar(res.data.mensaje, { variant: 'success' });
                return res.data;
            }
            enqueueSnackbar(res.data.mensaje, { variant: 'error' });
            return res.data;
        } catch (error) {
            return { idTipoMensaje: 3, mensaje: 'Ocurrió un error en la solicitud.' };
        }
        finally {
            setDeleteLoading(false);
        }
    };

    return { deleteData, deleteLoading };
};