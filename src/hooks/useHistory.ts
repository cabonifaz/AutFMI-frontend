import { useState } from "react";
import { apiClientWithToken } from "../utils";
import { DownloadPDFResponse } from "../models/response/DownloadPDFResponse";
import { enqueueSnackbar } from "notistack";
import { openPdfFilesInNewTab } from "../utils/file.utils";

export const useHistory = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistoryFile = async (
    historyType: number,
    historyId: number,
    talentId: number
  ) => {
    setIsLoading(true);

    try {
      const response =
        await apiClientWithToken.get<DownloadPDFResponse>(
          `/fmi/employee/getHistory?historyType=${historyType}&movementId=${historyId}&talentId=${talentId}`
        );

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
      setIsLoading(false);
    }
  };

  return { isLoading, fetchHistoryFile };
};
