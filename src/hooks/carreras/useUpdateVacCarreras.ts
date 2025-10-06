import { useState } from "react";
import { AppError } from "../../models/errors";
import { VacanteCarrera } from "../../models/type/VacanteCarrera";
import { BaseResponse } from "../../models/response/BaseResponse";
import { apiClientWithToken } from "../../utils";

export const useUpdateVacCarreras = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const update = async (idVacante: number, careers: VacanteCarrera[]) => {
    setIsUpdating(true);
    try {
      const response = await apiClientWithToken.post<BaseResponse>(
        `fmi/requirement/vacantes/careers/update?idVacante=${idVacante}`,
        careers
      );
      const data = response.data;

      if (data.idTipoMensaje !== 2) throw new AppError(data.mensaje, "UNKNOWN");
      else return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      else
        throw new AppError(
          "Error al actuliazar las carrraas para las vacantes",
          "UNKNOWN"
        );
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, update };
};
