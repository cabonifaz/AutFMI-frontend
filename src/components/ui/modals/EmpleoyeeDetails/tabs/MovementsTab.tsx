import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import ButtonIcon from "../../../ButtonIcon";
import { SectionCard, Table, Th, Td } from "../../../TableComponents";

interface MDProps {
  details?: EmployeeResponseDetail;
}

export const MovemetsTab = ({ details }: MDProps) => {
  return (
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
                    onClick={() => {}}
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
  );
};
