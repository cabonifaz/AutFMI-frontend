import { enqueueSnackbar } from "notistack";
import { RqFileResponse } from "../models/response/RqFileResponse";
import { apiClientWithToken } from "../utils/apiClient";
import { useState } from "react";
import { downloadAnyFile } from "../utils/util";

export const useDownloadRqFile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const downloadFile = async (rqFile: number) => {
    try {
      setIsLoading(true);

      const response = await apiClientWithToken.get<RqFileResponse>(
        `fmi/requirement/file?idArchivo=${rqFile}`
      );

      if (!response || !response.data) {
        enqueueSnackbar({ message: "Respuesta inválida", variant: "error" });
        return;
      }

      const { file, result, ext } = response.data;
      if (
        result?.idTipoMensaje === 2 &&
        typeof file === "string" &&
        file.trim() !== ""
      ) {
        try {
          downloadAnyFile(file, ext);
        } catch (innerErr) {
          console.error("Error in downloadAnyFile:", innerErr);
          enqueueSnackbar({
            message: "No se pudo descargar el archivo",
            variant: "error",
          });
        }
      } else {
        enqueueSnackbar({
          message: "Archivo no encontrado o inválido",
          variant: "warning",
        });
      }
    } catch (error) {
      enqueueSnackbar({ message: "Ha ocurrido un error", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };
  return [isLoading, downloadFile] as const;
};
