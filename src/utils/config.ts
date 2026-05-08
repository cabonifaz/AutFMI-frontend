//export const API_BASE_URL ="https://autfmibackendstaging-gnfub6d8cdg5aqbd.canadacentral-01.azurewebsites.net";
export const API_BASE_URL = "http://localhost:8081";

//export const BASE_URL_BDT ="https://bancotalentobackendstaging-gee7h5b8exe6gkhb.canadacentral-01.azurewebsites.net";
export const BASE_URL_BDT = "http://localhost:8080";

export const TOKEN = "jwt_token";

// PARAMS
export const TIPO_TIEMPO = "5";
export const TIPO_MONEDA = "2";
export const TIPO_MODALIDAD = "3";
export const TIPO_MODAL_MODALIDAD = "6";
export const UNIDAD = "7";
export const MOTIVO_INGRESO = "8";
export const MOTIVO_CESE = "10";
export const TIPO_EQUIPO = "2";
export const MARCA_EQUIPO = "5";
export const TIPO_HARDWARE = "21";
export const ANEXO_HARDWARE = "22";
export const TIPO_SOFTWARE = "23";
export const ESTADO_RQ = "24";
export const PERFIL = "14";
export const DURACION_RQ = "28";
export const LIMITE_ALERTA_RQ = "30";
export const MODALIDAD_RQ = "31";
export const HORARIO_TRABAJO = "34";
export const PROYECTO_SERVICIO = "36";
export const OBJETO_CONTRATO = "37";
export const URLS_BASE = "39";
export const HABILIDADES_TECNICAS = "19";
export const GRADO_ESTUDIO = "38";
export const TIPO_ARCHIVOS_RQ = "41";
export const TIPO_ARCHIVO = "17";

// RQ TALENT STATE
export const ESTADO_OBSERVADO = 1;
export const ESTADO_DATOS_COMPLETOS = 2;
export const ESTADO_EN_ENTREVISTA = 3;
export const ESTADO_CONFIRMADO = 4;

// RQ STATE
export const ESTADO_ASIGNADO = 2;
export const ESTADO_ATENDIDO = 3;

// MODALIDADES
export const MODALIDAD_PLANILLA = "Planilla";
export const MODALIDAD_LOC_SERVICIOS = "RxH";

// GRUPOS DE MODALIDADES (NUM2 EN PARAMETROS)
export const GROUP_MODALIDAD_LOC_SERVICIOS = 2;
export const GROUP_MODALIDAD_PLANILLA = 1;

// MODAL CONSTANTS
export const MODAL_ADD_TECH_SKILL = "add_skill";
export const MODAL_DETAILS_VAC_SKILLS = "modalDetailsVacSkills";
export const MODAL_ADD_CAREER = "modalAddCareer";
export const MODAL_UPDATE_CAREER = "modalUpdateCareer";
export const MD_EMPLOYEE_DETALS = "MD_EMPLOYEE_DETAILS";

// Currency IDs from PARAMETROS table
export enum CurrencyType {
  PEN = 1,
  USD = 2,
  UNDEFINED = 3,
}
