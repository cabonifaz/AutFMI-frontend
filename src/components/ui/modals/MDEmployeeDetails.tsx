import { useEffect } from "react";
import { useFetchEmployeeDetails } from "../../../hooks/useFetchFullHistory";
import { CloseModalButton } from "../CloseModalButton";
import { Tabs } from "../Tabs";

interface MDProps {
  onClose: () => void;
  talentId: number;
}

export const MDEmployeeDetails = ({ onClose, talentId }: MDProps) => {
  const { details, loading, fetchClients } = useFetchEmployeeDetails();

  useEffect(() => {
    fetchClients(talentId);
  }, [talentId]);

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
                  <InfoCard label="Nombre completo" value={details?.fullName} />
                  <InfoCard label="Correo" value={details?.email} />
                  <InfoCard label="Documento" value={details?.documentNumber} />
                  <InfoCard label="Descripción" value={details?.description} />
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
                        <>
                          <Th>Objeto</Th>
                          <Th>Inicio</Th>
                          <Th>Fin</Th>
                          <Th>Moneda</Th>
                          <Th>Monto</Th>
                          <Th>Estado</Th>
                        </>
                      </tr>
                    </thead>
                    <tbody>
                      {details?.contracts?.map((c, i) => (
                        <tr key={i}>
                        <Td>{c.contractObject}</Td>
                        <Td>{c.startDate}</Td>
                        <Td>{c.endDate}</Td>
                        <Td>{c.currency}</Td>
                        <Td>{c.baseAmount}</Td>
                        <Td>{c.status}</Td>
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
                          <Th>Fecha</Th>
                          <Th>Motivo</Th>
                          <Th>Cliente</Th>
                        </>
                      </tr>
                    </thead>
                    <tbody>
                      {details?.terminations?.map((t, i) => (
                        <tr key={i}>
                          <>
                            <Td center>{t.terminationDate}</Td>
                            <Td>{t.terminationReason}</Td>
                            <Td>{t.client}</Td>
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

// COMPONENTES REUTILIZABLES

const InfoCard = ({ label, value }: { label: string; value?: string }) => (
  <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
    <span className="text-xs text-sky-700 font-semibold">{label}</span>
    <p className="text-sm mt-1">{value || "-"}</p>
  </div>
);

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 border border-sky-200 rounded-lg p-4 bg-white">
    {children}
  </div>
);

const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full text-sm border border-gray-200 border-collapse">
    {children}
  </table>
);

const Th = ({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) => (
  <th
    className={`p-2 bg-sky-50 text-sky-700 font-semibold border border-gray-200 ${
      center ? "text-center" : "text-left"
    }`}
  >
    {children}
  </th>
);

const Td = ({
  children,
  center,
  right,
}: {
  children: React.ReactNode;
  center?: boolean;
  right?: boolean;
}) => (
  <td
    className={`p-2 border border-gray-200 ${
      center ? "text-center" : right ? "text-right" : "text-left"
    }`}
  >
    {children}
  </td>
);
