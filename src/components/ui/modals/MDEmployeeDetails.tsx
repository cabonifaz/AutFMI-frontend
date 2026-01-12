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
import ButtonIcon from "../ButtonIcon";

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

  const handleOpenPDF = (type: string, id?: number | string) => {
    console.log(`Abriendo PDF de ${type} con ID: ${id}`);
  };

  // Función para ver detalles de equipo
  const handleViewEquipmentDetails = (id: number | string) => {
    console.log(`Viendo detalles del equipo ID: ${id}`);
    // abrir otro modal o navegar
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
                              <tr key={c.contractId} className="hover:bg-gray-50 transition-colors">
                                <Td>{c.contractId}</Td>
                                <Td>{c.contractType}</Td>
                                <Td>{c.contractObject}</Td>
                                <Td>{c.area}</Td>
                                <Td>{c.client || "-"}</Td>
                                <Td>{c.rqCode || "-"}</Td>
                                <Td title={c.rqTitle}>{Utils.truncateText(c.rqTitle || "-", 15)}</Td>
                                <Td center>{c.startDate}</Td>
                                <Td center>{c.endDate}</Td>
                                <Td center>{c.baseAmount}</Td>
                                <Td>
                                  <span className={c.status === "ACTIVO" ? "text-green-600 font-semibold" : "text-gray-500"}>
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
                                      onClick={() => handleTerminate(c)}
                                      iconSrc="/assets/ic_movement.png"
                                      alt="Crear Movimiento"
                                      title="Crear Movimiento" />   
                                   <ButtonIcon
                                    onClick={ () => {}}
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
                ),
              },
            {
              label: "Movimientos",
              children: (
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
                                onClick={() => handleOpenPDF("movimiento", i)}
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
              ),
            },
            {
              label: "Solicitudes de Equipo",
              children: (
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
                                  onClick={() => handleViewEquipmentDetails(e.requestId)}
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
              ),
            },
            {
              label: "Ceses",
              children: (
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
                            <Td title={t.requirementTitle}>{Utils.truncateText(t.requirementTitle || "-", 15)}</Td>
                            <Td>{t.requirementCode || "-"}</Td>
                            <Td center>
                              <ButtonIcon 
                                onClick={() => handleOpenPDF("cese", i)}
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
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}