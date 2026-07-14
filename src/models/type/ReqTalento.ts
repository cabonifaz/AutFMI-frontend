export type ReqTalento = {
  idRequerimientoTalento: number;
  idTalento: number;
  nombresTalento: string;
  apellidosTalento: string;
  dni: string;
  celular: string;
  email: string;
  idSituacion: number;
  situacion: string;
  idEstado: number;
  estado: string;
  idPerfil: number;
  perfil: string;
  idCvFile: number;
  idCVEs?: number;
  idCVEn?: number;
};
