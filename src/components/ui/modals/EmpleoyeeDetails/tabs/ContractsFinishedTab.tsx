import { useHistory } from "../../../../../hooks/useHistory";
import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import { Utils } from "../../../../../utils/formatters";
import ButtonIcon from "../../../ButtonIcon";
import { Loading } from "../../../Loading";
import { SectionCard, Table, Th, Td } from "../../../TableComponents";

interface MDProps {
  details?: EmployeeResponseDetail;
  talentId: number;
}

export const ContractsFinishedTab = ({ details, talentId }: MDProps) => {
  const { isLoading, fetchHistoryFile } = useHistory();

  const handleGetMovementFile = (
    movementTypeId: number,
    movementId: number
  ) => {
    fetchHistoryFile(movementTypeId, movementId, talentId);
  };

  return (
    <>
      {isLoading && <Loading overlayMode />}

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
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </SectionCard>
    </>
  );
};
