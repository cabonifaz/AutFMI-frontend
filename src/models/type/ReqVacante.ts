export interface ReqVacante {
  idRequerimientoVacante: number;
  idPerfil: number;
  perfilProfesional: string;
  cantidad: number;
  tarifa: string;
  totalCarreras: number;
  totalHabilidades: number;
  /**
   * Importes de la vacante. Llegan en `null` cuando el usuario no puede verlos
   * (rol RECLUTADOR): el backend los vacía en el detalle del RQ.
   */
  tarifaFinal?: number | null;
  tarifaInicial?: number | null;
}
