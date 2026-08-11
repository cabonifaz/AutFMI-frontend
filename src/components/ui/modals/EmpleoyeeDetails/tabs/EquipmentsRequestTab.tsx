import { useState } from "react";
import { Undo2 } from "lucide-react";
import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import ButtonIcon from "../../../ButtonIcon";
import { Loading } from "../../../Loading";
import { SectionCard, Table, Th, Td } from "../../../TableComponents";
import { useEquipmentRequest } from "../../../../../hooks/useEquipmentRequest";
import { useUndoMovement } from "../../../../../hooks/useUndoMovement";

interface MDProps {
  details?: EmployeeResponseDetail;
  idTalent: number;
  onChanged?: () => void;
}

export const EquipmentRequestTab = ({ details, idTalent, onChanged }: MDProps) => {
  const { isLoading, fetchEquipmentRequestFile } = useEquipmentRequest();
  const { isLoading: undoing, deleteEquipmentRequest } = useUndoMovement();
  const [pending, setPending] = useState<number | null>(null);

  const handleGetEquipmentRequestFile = (requestId: number) => {
    fetchEquipmentRequestFile(requestId, idTalent);
  };

  // Solo la ÚLTIMA solicitud (mayor id) puede deshacerse.
  const lastRequestId = (details?.equipmentRequests ?? []).reduce(
    (max, e) => Math.max(max, e.requestId ?? 0),
    0
  );

  const confirmUndo = async () => {
    if (pending == null) return;
    const ok = await deleteEquipmentRequest(pending, idTalent);
    setPending(null);
    if (ok) onChanged?.();
  };

  return (
    <>
      {(isLoading || undoing) && <Loading overlayMode />}

      <SectionCard>
        <div className="max-h-[380px] overflow-auto border rounded-md">
          <Table>
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <Th>Equipo</Th>
                <Th>Marca</Th>
                <Th center>Fecha Solicitud</Th>
                <Th center>Fecha Entrega</Th>
                <Th center>Celular</Th>
                <Th center>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {details?.equipmentRequests?.map((e, i) => (
                <tr key={i}>
                  <Td>{e.equipmentType}</Td>
                  <Td>{e.brand}</Td>
                  <Td center>{e.requestDate}</Td>
                  <Td center>{e.deliveryDate}</Td>
                  <Td center>{e.mobileAssigned}</Td>
                  <Td center>
                    <div className="flex items-center justify-center gap-2">
                      <ButtonIcon
                        onClick={() => handleGetEquipmentRequestFile(e.requestId)}
                        iconSrc="/assets/see_pass.svg"
                        alt="Detalles"
                        title="Ver Detalles"
                      />
                      {(e.requestId ?? 0) === lastRequestId &&
                        lastRequestId > 0 && (
                          <button
                            type="button"
                            onClick={() => setPending(e.requestId ?? 0)}
                            className="text-red-600 hover:text-red-700"
                            title="Deshacer"
                            aria-label="Deshacer"
                          >
                            <Undo2 className="w-5 h-5" />
                          </button>
                        )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </SectionCard>

      {pending != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-2 text-lg font-semibold">
              Deshacer solicitud de equipo
            </h3>
            <p className="mb-6 text-sm text-gray-700">
              ¿Deshacer la última solicitud de equipo? Se eliminará el registro.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="btn btn-outline-gray"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmUndo}
                disabled={undoing}
                className="btn btn-red"
              >
                Deshacer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
