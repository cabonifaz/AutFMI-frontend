export interface EmployeeResponseDetail {
  idTipoMensaje: number;
  mensaje: string;
  detalleMensaje: string | null;
  talentId: number | null;
  names: string;
  lastname: string;
  surname: string;
  email: string;
  documentNumber: string;
  description: string;
  contracts: Contract[];
  movements: Movement[];
  equipmentRequests: EquipmentRequest[];
  terminations: Termination[];
}
export interface Contract {
  contractId: number; // ID_CONTRATO
  talentName: string; // NOMBRES_TALENTO
  contractObject: string; // OBJETO_CONTRATO
  areaId: number; // ID_AREA
  area: string; // AREA
  client: string; // CLIENTE
  rqCode: string; // CODIGO_RQ
  rqTitle: string; // TITULO_RQ
  startDate: string; // dd/MM/yyyy
  endDate: string; // dd/MM/yyyy
  baseAmount: string;
  status: "ACTIVO" | "FINALIZADO";
}

export interface Movement {
  movementDate: string; // dd/MM/yyyy
  reason: string;
  previousArea: string;
  position: string;
  movementType: string;
}
export interface EquipmentRequest {
  requestId: number;
  equipmentType: string;
  brand: string;
  requestDate: string; // dd/MM/yyyy
  deliveryDate: string; // dd/MM/yyyy
  mobileAssigned: "SI" | "NO";
}
export interface Termination {
  terminationId?: number;
  terminationDate?: string; // dd/MM/yyyy
  terminationReason?: string;
  client?: string;
}
