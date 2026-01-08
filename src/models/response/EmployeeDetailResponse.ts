export interface EmployeeResponseDetail {
  idTipoMensaje: number;
  mensaje: string;
  detalleMensaje: string | null;
  talentId: number | null;
  names: string;
  fullName: string;
  email: string;
  documentNumber: string;
  description: string;
  contracts: Contract[];
  movements: Movement[];
  equipmentRequests: EquipmentRequest[];
  terminations: Termination[];
}
export interface Contract {
  contractId: number;
  contractObject: string;
  startDate: string; // dd/MM/yyyy
  endDate: string; // dd/MM/yyyy
  currency: string;
  baseAmount: number;
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