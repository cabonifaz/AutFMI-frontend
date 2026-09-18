import { useState } from "react";
import { useSnackbar } from "notistack";
import {
  apiClientWithToken,
  axiosInstanceBDT,
} from "../utils/apiClient";
import { DownloadPDFResponse } from "../models/response/DownloadPDFResponse";
import { openPdfFilesInNewTab } from "../utils/file.utils";

const useDownloadPdf = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  /**
   * @param nombreArchivo nombre con el que se guardará el PDF cuando la
   *   respuesta no lo traiga (el CV de BDT llega suelto, sin nombre).
   */
  const fetchAndOpenPdf = async (url: string, nombreArchivo?: string) => {
    setLoading(true);
    try {
      const response =
        await axiosInstanceBDT.get<DownloadPDFResponse>(url);

      const { result, lstArchivos } = response.data;

      /** Si de la API de BDT es idMensaje */
      if ((result as any)?.idMensaje === 2) {
        const { archivo } = (response as any)?.data;
        openPdfFilesInNewTab([
          { nombreArchivo: nombreArchivo || "CV", archivoB64: archivo },
        ]);
        return;
      }

      if ((result as any)?.idMensaje !== 2) {
        enqueueSnackbar(result.mensaje, { variant: "warning" });
        return;
      }

      if (result.idTipoMensaje !== 2) {
        enqueueSnackbar(result.mensaje, { variant: "warning" });
        return;
      }

      if (lstArchivos.length === 0) {
        enqueueSnackbar(result.mensaje, { variant: "warning" });
        return;
      }

      openPdfFilesInNewTab(lstArchivos);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchAndOpenPdfFMI = async (url: string) => {
    setLoading(true);
    try {
      const response =
        await apiClientWithToken.get<DownloadPDFResponse>(url);

      const { result, lstArchivos } = response.data;

      if (result.idTipoMensaje !== 2) {
        enqueueSnackbar(result.mensaje, { variant: "warning" });
        return;
      }

      if (lstArchivos.length === 0) {
        enqueueSnackbar(result.mensaje, { variant: "warning" });
        return;
      }

      openPdfFilesInNewTab(lstArchivos);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return { fetchAndOpenPdf, loading, fetchAndOpenPdfFMI };
};

export default useDownloadPdf;
