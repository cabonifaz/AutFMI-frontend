import { useState } from "react";
import { AppError } from "../../models/errors";
import { apiClientWithToken } from "../../utils";
import { VacanteCareersResponse } from "../../models/response/VacanteCareerReponse";

export const useFetchVacCarreras = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchCarreras = async (idVacante: number) => {
    setIsLoading(true);
    try {
      const response = await apiClientWithToken.get<VacanteCareersResponse>(
        `fmi/requirement/vacantes/careers?idVacante=${idVacante}`
      );
      const data = response.data;

      if (data.idTipoMensaje !== 2) throw new AppError(data.mensaje, "UNKNOWN");
      else return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      else
        throw new AppError(
          "Error al obtener la lista de carreras para la vacante",
          "UNKNOWN"
        );
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, fetchCarreras };
};
