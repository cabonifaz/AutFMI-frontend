import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import ButtonIcon from "../../../ButtonIcon";
import { Loading } from "../../../Loading";
import { SectionCard, Table, Th, Td } from "../../../TableComponents";
import { useEquipmentRequest } from "../../../../../hooks/useEquipmentRequest";

interface MDProps {
  details?: EmployeeResponseDetail;
  idTalent: number;
}

export const EquipmentRequestTab = ({ details, idTalent }: MDProps) => {
  const { isLoading, fetchEquipmentRequestFile } = useEquipmentRequest();

  const handleGetEquipmentRequestFile = (requestId: number) => {
    fetchEquipmentRequestFile(requestId, idTalent);
  };

  return (
    <>
      {isLoading && <Loading overlayMode />}

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
