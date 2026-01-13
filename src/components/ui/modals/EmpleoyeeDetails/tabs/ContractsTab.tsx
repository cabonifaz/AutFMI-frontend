import { useNavigate } from "react-router-dom";
import {
  Contract,
  EmployeeResponseDetail,
} from "../../../../../models/response/EmployeeDetailResponse";
import { Utils } from "../../../../../utils/formatters";
import ButtonIcon from "../../../ButtonIcon";
import { SectionCard, Table, Th, Td } from "../../../TableComponents";

interface MDProps {
  details?: EmployeeResponseDetail;
  talentId?: number;

}

export const ContractsTabs = ({ details }: MDProps) => {
  const navigate = useNavigate();

  const handleTerminate = (contract: Contract) => {
    navigate("/formCese", {
      state: {
        employeeDetails: details,
        contract: contract,
      },
    });
    details;
  };

  const handleMovement = (contract: Contract) => {
  navigate("/formMovimiento", {
    state: {
      employeeDetails: details, 
      contract: contract,       
    },
  });
    details;
  };

  return (
    <SectionCard>
      <div className="max-h-[380px] overflow-x-auto overflow-y-auto border rounded-md w-full">
        <div className="min-w-[1200px]">
          <Table>
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <Th>ID</Th>
                <Th>Modalidad</Th>
                <Th>Objeto</Th>
                <Th>Área</Th>
                <Th>Cliente</Th>
                <Th>RQ</Th>
                <Th>Título RQ</Th>
                <Th center>Inicio</Th>
                <Th center>Fin</Th>
                <Th center>Monto</Th>
                <Th>Estado</Th>
                <Th center>Accion</Th>
              </tr>
            </thead>
            <tbody>
              {details?.contracts?.map((c) => (
                <tr
                  key={c.contractId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <Td>{c.contractId}</Td>
                  <Td>{c.contractType}</Td>
                  <Td>{c.contractObject}</Td>
                  <Td>{c.area}</Td>
                  <Td>{c.client || "-"}</Td>
                  <Td>{c.rqCode || "-"}</Td>
                  <Td title={c.rqTitle}>
                    {Utils.truncateText(c.rqTitle || "-", 15)}
                  </Td>
                  <Td center>{c.startDate}</Td>
                  <Td center>{c.endDate}</Td>
                  <Td center>{c.baseAmount}</Td>
                  <Td>
                    <span
                      className={
                        c.status === "ACTIVO"
                          ? "text-green-600 font-semibold"
                          : "text-gray-500"
                      }
                    >
                      {c.status}
                    </span>
                  </Td>
                  <Td center>
                    {c.status === "ACTIVO" && (
                      <div>
                        <ButtonIcon
                          onClick={() => handleTerminate(c)}
                          iconSrc="/assets/ic_end_contract.png"
                          alt="Finalizar Contrato"
                          title="Finalizar Contrato"
                        />
                        <ButtonIcon
                          onClick={() => handleMovement(c)}
                          iconSrc="/assets/ic_movement.png"
                          alt="Crear Movimiento"
                          title="Crear Movimiento"
                        />
                        <ButtonIcon
                          onClick={() => {}}
                          iconSrc="/assets/ic_computer.png"
                          alt="PDF"
                          title="Solicitar Equipo"
                        />
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </SectionCard>
  );
};
