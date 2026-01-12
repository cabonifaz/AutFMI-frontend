import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import { Utils } from "../../../../../utils/formatters";
import ButtonIcon from "../../../ButtonIcon";
import { SectionCard, Table, Th, Td } from "../../../TableComponents";

interface MDProps {
  details?: EmployeeResponseDetail;
}

export const ContractsFinishedTab = ({ details }: MDProps) => {
  return (
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
                  {Utils.truncateText(t.requirementTitle || "-", 15)}
                </Td>
                <Td>{t.requirementCode || "-"}</Td>
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
