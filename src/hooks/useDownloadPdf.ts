import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { DownloadPDFResponse } from '../models/response/DownloadPDFResponse';

const useDownloadPdf = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    const decodeBase64ToBlob = (base64: string): Blob => {
        const binaryData = atob(base64);
        const arrayBuffer = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            arrayBuffer[i] = binaryData.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type: 'application/pdf' });
    };

    const openPdfInNewTab = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const fetchAndOpenPdf = async (idTipoHistorial: number, idUsuarioTalento: number) => {
        setLoading(true);
        try {
            const response = await apiClientWithToken.get<DownloadPDFResponse>(
                `/fmi/employee/lastHistory?idTipoHistorial=${idTipoHistorial}&idUsuarioTalento=${idUsuarioTalento}`
            );

            const { result, archivoB64 } = response.data;
            if (result.idTipoMensaje !== 2) {
                enqueueSnackbar(result.mensaje, { variant: 'error' });
                return;
            }

            if (!archivoB64) {
                enqueueSnackbar('Archivo PDF no encontrado.', { variant: 'warning' });
                return;
            }

            const pdfBlob = decodeBase64ToBlob(archivoB64);
            openPdfInNewTab(pdfBlob);
        } catch (error) {
            enqueueSnackbar('Error al consultar archivo PDF.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return { fetchAndOpenPdf, loading };
};

export default useDownloadPdf;
