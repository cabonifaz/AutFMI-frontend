import { useHistory } from "../../../../../hooks/useHistory";
import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import ButtonIcon from "../../../ButtonIcon";
import { Loading } from "../../../Loading";
import { SectionCard, Table, Th, Td } from "../../../TableComponents";

interface MDProps {
  details?: EmployeeResponseDetail;
  talentId: number;
}

export const MovemetsTab = ({ details, talentId }: MDProps) => {
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
