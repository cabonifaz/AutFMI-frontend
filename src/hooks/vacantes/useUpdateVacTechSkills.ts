import { useState } from "react";
import { VacanteSkill } from "../../models/type/VacanteSkill";
import { apiClientWithToken } from "../../utils";
import { AppError } from "../../models/errors";
import { BaseResponse } from "../../models/response/BaseResponse";

export const useUpdateVacTechSkills = () => {
  const [isLoading, setIsLoading] = useState(false);

  const update = async (idVac: number, skills: VacanteSkill[]) => {
    try {
      setIsLoading(true);
      const { data } = await apiClientWithToken.post<BaseResponse>(
        `fmi/requirement/vacantes/skills/update?idVacante=${idVac}`,
        skills
      );
      if (data.idTipoMensaje !== 2) throw new AppError(data.mensaje, "UNKNOWN");
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Error al actualizar las habilidades técnicas",
        "UNKNOWN"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return [isLoading, update] as const;
};
