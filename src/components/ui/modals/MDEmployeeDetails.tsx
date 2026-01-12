import { useEffect, useState } from "react";
import { useFetchEmployeeDetails } from "../../../hooks/useFetchFullHistory";
import { CloseModalButton } from "../CloseModalButton";
import { Tabs } from "../Tabs";
import { useNavigate } from "react-router-dom";
import { TalentoType } from "../../../models/type/TalentoType";
import { Contract } from "../../../models/response/EmployeeDetailResponse";
import { Utils } from "../../../utils/formatters";

import { InfoCard } from "../../ui/InfoCard";
import { Table, Th, Td, SectionCard } from "../../ui/TableComponents";

interface MDProps {
  onClose: () => void;
  talento: TalentoType;
}

export const MDEmployeeDetails = ({ onClose, talento }: MDProps) => {
  const navigate = useNavigate();
  const { details, loading, fetchTalent } = useFetchEmployeeDetails();

  useEffect(() => {
    fetchTalent(talento.idTalento);
  }, [talento.idTalento]);

  const handleTerminate = (contract: Contract) => {
    navigate("/formCese", {
      state: {
        employeeDetails: details,
        contract: contract,
      },
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[95%] lg:w-[1300px] min-h-[570px] max-h-[570px] overflow-hidden relative">
        <header className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Detalles Empleado</h2>
          <CloseModalButton onClick={onClose} />
        </header>

        <Tabs
          isDataLoading={loading}
          tabs={[
            {
              label: "Datos personales",
              children: (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <InfoCard
                    label="Nombre completo"
                    value={[
                      details?.names,
                      details?.lastname,
                      details?.surname,
                    ].join(" ")}
                  />
                  <InfoCard label="Correo" value={details?.email} />
                  <InfoCard
                    label="Documento"
                    value={details?.documentNumber}
                  />
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <InfoCard
                      label="Descripción"
                      value={details?.description}
                    />
                  </div>
                </div>
              ),
      },

            {
              label: "Contratos",
              children: (
                <SectionCard>
                  <Table>
                    <thead>
                      <tr>
                        <Th>ID</Th>
                        <Th>Modalidad</Th>
                        <Th>Objeto</Th>
                        <Th>Área</Th>
                        <Th>Cliente</Th>
                        <Th>RQ</Th>
                        <Th>Título RQ</Th>
                        <Th>Inicio</Th>
                        <Th>Fin</Th>
                        <Th>Monto</Th>
                        <Th>Estado</Th>
                        <Th center>Acción</Th>
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
                          <Td>{c.client}</Td>
                          <Td>{c.rqCode}</Td>
                          <Td title={c.rqTitle}>{Utils.truncateText(c.rqTitle, 15)}</Td>
                          <Td center>{c.startDate}</Td>
                          <Td center>{c.endDate}</Td>
                          <Td right>{c.baseAmount}</Td>

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
                              <button
                                onClick={() => handleTerminate(c)}
                                className="bg-red-500 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md transition-colors duration-200 cursor-pointer shadow-sm font-medium"
                              >
                                Finalizar
                              </button>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </SectionCard>
              ),
            },

            {
              label: "Movimientos",
              children: (
                <SectionCard>
                  <Table>
                    <thead>
                      <tr>
                        <>
                          <Th>Fecha</Th>
                          <Th>Tipo</Th>
                          <Th>Motivo</Th>
                          <Th>Área anterior</Th>
                          <Th>Cargo</Th>
                        </>
                      </tr>
                    </thead>
                    <tbody>
                      {details?.movements?.map((m, i) => (
                        <tr key={i}>
                          <>
                            <Td>{m.movementDate}</Td>
                            <Td>{m.movementType}</Td>
                            <Td>{m.reason}</Td>
                            <Td>{m.previousArea}</Td>
                            <Td>{m.position}</Td>
                          </>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </SectionCard>
              ),
            },

            {
              label: "Solicitudes de Equipo",
              children: (
                <SectionCard>
                  <Table>
                    <thead>
                      <tr>
                        <>
                          <Th>Equipo</Th>
                          <Th>Marca</Th>
                          <Th>Solicitud</Th>
                          <Th>Entrega</Th>
                          <Th>Celular</Th>
                        </>
                      </tr>
                    </thead>
                    <tbody>
                      {details?.equipmentRequests?.map((e, i) => (
                        <tr key={i}>
                          <>
                            <Td>{e.equipmentType}</Td>
                            <Td>{e.brand}</Td>
                            <Td center>{e.requestDate}</Td>
                            <Td center>{e.deliveryDate}</Td>
                            <Td center>{e.mobileAssigned}</Td>
                          </>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </SectionCard>
              ),
            },

            {
              label: "Ceses",
              children: (
                <SectionCard>
                  <Table>
                    <thead>
                      <tr>
                        <>
                          <Th center>Fecha</Th>
                          <Th>Motivo</Th>
                          <Th>Cliente</Th>
                          <Th>Título RQ</Th>
                          <Th>Código RQ</Th>
                        </>
                      </tr>
                    </thead>
                    <tbody>
                      {details?.terminations?.map((t, i) => (
                        <tr key={i}>
                          <>
                            <Td center>{t.terminationDate}</Td>
                            <Td>{t.terminationReason}</Td>
                            <Td>{t.client || "-"}</Td>
                            <Td title={t.requirementTitle}>{Utils.truncateText(t.requirementTitle, 15)}</Td>
                            <Td>{t.requirementCode || "-"}</Td>
                          </>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </SectionCard>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

