import { VacanteSkill } from "../type/VacanteSkill";
import { BaseResponse } from "./BaseResponse";

export interface VacTechSkillsResponse extends BaseResponse {
  habilidades: VacanteSkill[];
}
