import { useState } from "react";
import { Undo2 } from "lucide-react";
import { useHistory } from "../../../../../hooks/useHistory";
import { useUndoMovement } from "../../../../../hooks/useUndoMovement";
import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import { Utils } from "../../../../../utils/formatters";
import ButtonIcon from "../../../ButtonIcon";
import { Loading } from "../../../Loading";
import { SectionCard, Table, Th, Td } from "../../../TableComponents";

interface MDProps {
  details?: EmployeeResponseDetail;
  talentId: number;
  onChanged?: () => void;
}

export const ContractsFinishedTab = ({
  details,
  talentId,
  onChanged,
}: MDProps) => {
  const { isLoading, fetchHistoryFile } = useHistory();
  const { isLoading: undoing, undoCese } = useUndoMovement();
  const [pending, setPending] = useState<number | null>(null);

  const handleGetMovementFile = (
    movementTypeId: number,
    movementId: number
  ) => {
    fetchHistoryFile(movementTypeId, movementId, talentId);
  };

  // Solo el ÚLTIMO cese (mayor id) puede deshacerse.
  const lastTerminationId = (details?.terminations ?? []).reduce(
    (max, t) => Math.max(max, t.terminationId ?? 0),
    0
  );

  const confirmUndo = async () => {
    if (pending == null) return;
    const ok = await undoCese(pending, talentId);
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
                <Th center>Fecha</Th>
                <Th>Motivo</Th>
                <Th>Cliente</Th>
                <Th>Título RQ</Th>
                <Th>Código RQ</Th>
                <Th center>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {details?.terminations?.map((t, i) => (
                <tr key={i}>
                  <Td center>{t.terminationDate}</Td>
                  <Td>{t.terminationReason}</Td>
                  <Td>{t.client || "-"}</Td>
                  <Td title={t.requirementTitle}>
                    {Utils.truncateText(
                      t.requirementTitle || "-",
                      15
                    )}
                  </Td>
                  <Td>{t.requirementCode || "-"}</Td>
                  <Td center>
                    <div className="flex items-center justify-center gap-2">
                      <ButtonIcon
                        onClick={() =>
                          handleGetMovementFile(3, t.terminationId || 0)
                        }
                        iconSrc="/assets/ic_pdf.svg"
                        alt="PDF"
                        title="Ver PDF"
                      />
                      {(t.terminationId ?? 0) === lastTerminationId &&
                        lastTerminationId > 0 && (
                          <button
                            type="button"
                            onClick={() => setPending(t.terminationId ?? 0)}
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
            <h3 className="mb-2 text-lg font-semibold">Deshacer cese</h3>
            <p className="mb-6 text-sm text-gray-700">
              ¿Deshacer el último cese? Se <b>reactivará el contrato</b> del
              talento. El correo de cese ya enviado no se revierte.
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
