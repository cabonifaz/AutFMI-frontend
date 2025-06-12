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

                const newTab = window.open(url, `_blank_${index}`);
                if (newTab) {
                    const setTitle = () => {
                        newTab.document.title = file.nombreArchivo;
                    };

                    newTab.onload = setTitle;

                    newTab.onbeforeunload = () => {
                        URL.revokeObjectURL(url);
                    };
                } else {
                    console.error(`Failed to open tab for file: ${file.nombreArchivo}`);
                }
            }, index * 500);
        });
    };

    const fetchAndOpenPdf = async (url: string) => {
        setLoading(true);
        try {
            const response = await apiClientWithToken.get<DownloadPDFResponse>(url);

            const { result, lstArchivos } = response.data;

            if (result.idTipoMensaje !== 2) {
                enqueueSnackbar(result.mensaje, { variant: 'warning' });
                return;
            }

            if (lstArchivos.length === 0) {
                enqueueSnackbar(result.mensaje, { variant: 'warning' });
                return;
            }

            openPdfFilesInNewTab(lstArchivos);
        } catch (error) { }
        finally {
            setLoading(false);
        }
    };

    return { fetchAndOpenPdf, loading };
};

export default useDownloadPdf;
