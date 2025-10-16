export interface ReqVacante {
  idRequerimientoVacante: number;
  idPerfil: number;
  perfilProfesional: string;
  cantidad: number;
  tarifa: string;
  totalCarreras: number;
  totalHabilidades: number;
  tarifaFinal?: number;
}
