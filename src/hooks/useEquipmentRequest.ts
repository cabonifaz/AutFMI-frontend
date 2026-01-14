import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { apiClientWithToken } from "../utils";
import { DownloadPDFResponse } from "../models/response/DownloadPDFResponse";
import { openPdfFilesInNewTab } from "../utils/file.utils";

export const useEquipmentRequest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchEquipmentRequestFile = async (
    idSolicitud: number,
    talentId: number
  ) => {
    setIsLoading(true);

    try {
      const response =
        await apiClientWithToken.get<DownloadPDFResponse>(
          `/fmi/employee/getRequestedEquipment?idSolicitud=${idSolicitud}&idTalento=${talentId}`
        );

      const { result, lstArchivos } = response.data;

      if (result.idTipoMensaje !== 2) {
        enqueueSnackbar(result.mensaje, { variant: "warning" });
        return;
      }

      if (!lstArchivos || lstArchivos.length === 0) {
        enqueueSnackbar(result.mensaje, { variant: "warning" });
        return;
      }

      openPdfFilesInNewTab(lstArchivos);
    } catch (error) {
      enqueueSnackbar(
        "Error al obtener el PDF de la solicitud de equipo",
        { variant: "error" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchEquipmentRequestFile,
  };
};
