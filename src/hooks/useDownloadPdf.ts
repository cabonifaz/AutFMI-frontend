import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { DownloadPDFResponse } from '../models/response/DownloadPDFResponse';
import { PDFDataType } from '../models/type/PDFDataType';

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

    const openPdfFilesInNewTab = (files: PDFDataType[]) => {
        files.forEach((file, index) => {
            setTimeout(() => {
                const pdfBlob = decodeBase64ToBlob(file.archivoB64);
                const url = URL.createObjectURL(pdfBlob);

                const newTab = window.open('', `_blank_${index}`);
                if (newTab) {
                    newTab.document.title = file.nombreArchivo;

                    const objectTag = newTab.document.createElement('object');
                    objectTag.type = 'application/pdf';
                    objectTag.data = url;
                    objectTag.style.width = '100%';
                    objectTag.style.height = '100vh';

                    newTab.document.body.appendChild(objectTag);

                    newTab.onbeforeunload = () => {
                        URL.revokeObjectURL(url);
                    };
                } else {
                    enqueueSnackbar(`Error al abrir PDF: ${file.nombreArchivo}.`, { variant: 'error' });
                }
            }, index * 500);
        });
    };


    const fetchAndOpenPdf = async (idTipoHistorial: number, idUsuarioTalento: number) => {
        setLoading(true);
        try {
            const response = await apiClientWithToken.get<DownloadPDFResponse>(
                `/fmi/employee/lastHistory?idTipoHistorial=${idTipoHistorial}&idUsuarioTalento=${idUsuarioTalento}`
            );

            const { result, lstArchivos } = response.data;
            if (result.idTipoMensaje !== 2) {
                enqueueSnackbar(result.mensaje, { variant: 'error' });
                return;
            }

            if (!lstArchivos || lstArchivos.length === 0) {
                enqueueSnackbar('Archivos PDF no encontrados.', { variant: 'warning' });
                return;
            }

            openPdfFilesInNewTab(lstArchivos);
        } catch (error) {
            enqueueSnackbar('Error al consultar archivo PDF.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return { fetchAndOpenPdf, loading };
};

export default useDownloadPdf;
