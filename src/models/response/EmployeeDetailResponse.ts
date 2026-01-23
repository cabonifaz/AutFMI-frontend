export interface EmployeeResponseDetail {
  idTipoMensaje: number;
  mensaje: string;
  detalleMensaje: string | null;
  talentId: number;
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
  photoUrl?: string; 
  photoB64:string;
  cvNormal?: string;  
  cvEs?: string;      
  cvEn?: string;   
}
export interface Contract {
  contractId: number; // ID_CONTRATO
  talentName: string; // NOMBRES_TALENTO
  contractObject: string; // OBJETO_CONTRATO
  areaId: number; // ID_AREA
  contractTypeId: number;
  contractType: string;
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
  movementId: number;
  movementDate: string; // dd/MM/yyyy
  reason: string;
  previousArea: string;
  position: string;
  movementType: string;
  movementTypeId: number;
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
  requirementTitle?: string;
  requirementCode?: string;
}
