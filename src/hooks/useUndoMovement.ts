import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { apiClientWithToken } from "../utils/apiClient";

interface BaseMsg {
  idTipoMensaje: number;
  mensaje: string;
}

/**
 * Deshacer el último movimiento de una acción (Fase 1: Cese y Solicitud de equipo).
 * Cada función devuelve `true` si el backend respondió éxito (idTipoMensaje === 2),
 * para que la pantalla decida si refresca los datos.
 */
export const useUndoMovement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const undoCese = async (
    idHistorial: number,
    idTalento: number
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await apiClientWithToken.put<BaseMsg>(
        `/fmi/employee/cese/undo?idHistorial=${idHistorial}&idTalento=${idTalento}`
      );
      const ok = data.idTipoMensaje === 2;
      enqueueSnackbar(data.mensaje, { variant: ok ? "success" : "error" });
      return ok;
    } catch (error) {
      console.error("Error al deshacer el cese:", error);
      enqueueSnackbar("Error al deshacer el cese", { variant: "error" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEquipmentRequest = async (
    idSolicitud: number,
    idTalento: number
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await apiClientWithToken.delete<BaseMsg>(
        `/fmi/employee/solicitud/equipo?idSolicitud=${idSolicitud}&idTalento=${idTalento}`
      );
      const ok = data.idTipoMensaje === 2;
      enqueueSnackbar(data.mensaje, { variant: ok ? "success" : "error" });
      return ok;
    } catch (error) {
      console.error("Error al deshacer la solicitud de equipo:", error);
      enqueueSnackbar("Error al deshacer la solicitud de equipo", {
        variant: "error",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, undoCese, deleteEquipmentRequest };
};
