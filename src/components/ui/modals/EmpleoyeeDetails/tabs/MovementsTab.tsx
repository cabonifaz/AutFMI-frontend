import { useState } from "react";
import { Undo2 } from "lucide-react";
import { useHistory } from "../../../../../hooks/useHistory";
import { useUndoMovement } from "../../../../../hooks/useUndoMovement";
import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import ButtonIcon from "../../../ButtonIcon";
import { Loading } from "../../../Loading";
import { SectionCard, Table, Th, Td } from "../../../TableComponents";

interface MDProps {
  details?: EmployeeResponseDetail;
  talentId: number;
  onChanged?: () => void;
}

// ID_TIPO_HISTORIAL: 1 = ingreso, 2 = movimiento.
const TIPO_INGRESO = 1;

export const MovemetsTab = ({ details, talentId, onChanged }: MDProps) => {
  const { isLoading, fetchHistoryFile } = useHistory();
  const { isLoading: undoing, undoMovimiento, undoIngreso } = useUndoMovement();
  const [pending, setPending] = useState<{ id: number; tipo: number } | null>(
    null
  );

  const handleGetMovementFile = (
    movementTypeId: number,
    movementId: number
  ) => {
    fetchHistoryFile(movementTypeId, movementId, talentId);
  };

  // Solo el ÚLTIMO registro (mayor id) puede deshacerse.
  const lastMovementId = (details?.movements ?? []).reduce(
    (max, m) => Math.max(max, m.movementId ?? 0),
    0
  );

  const isIngreso = pending?.tipo === TIPO_INGRESO;

  const confirmUndo = async () => {
    if (!pending) return;
    const ok = isIngreso
      ? await undoIngreso(pending.id, talentId)
      : await undoMovimiento(pending.id, talentId);
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
                <Th>Fecha</Th>
                <Th>Tipo</Th>
                <Th>Motivo</Th>
                <Th>Área anterior</Th>
                <Th>Cargo</Th>
                <Th center>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {details?.movements?.map((m, i) => (
                <tr key={i}>
                  <Td>{m.movementDate}</Td>
                  <Td>{m.movementType}</Td>
                  <Td>{m.reason}</Td>
                  <Td>{m.previousArea}</Td>
                  <Td>{m.position}</Td>
                  <Td center>
                    <div className="flex items-center justify-center gap-2">
                      <ButtonIcon
                        onClick={() =>
                          handleGetMovementFile(
                            m.movementTypeId,
                            m.movementId
                          )
                        }
                        iconSrc="/assets/ic_pdf.svg"
                        alt="PDF"
                        title="Ver PDF"
                      />
                      {(m.movementId ?? 0) === lastMovementId &&
                        lastMovementId > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPending({
                                id: m.movementId,
                                tipo: m.movementTypeId,
                              })
                            }
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

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-2 text-lg font-semibold">
              {isIngreso ? "Deshacer ingreso" : "Deshacer movimiento"}
            </h3>
            <p className="mb-6 text-sm text-gray-700">
              {isIngreso ? (
                <>
                  ¿Deshacer el último ingreso? Se dará de <b>baja el contrato</b>{" "}
                  y el talento volverá a <b>"confirmado sin ingresar"</b> (se
                  reabre su cupo en el requerimiento).
                </>
              ) : (
                <>¿Deshacer el último movimiento? Se quitará del historial.</>
              )}
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
