import { useEffect } from "react";
import { useFetchEmployeeDetails } from "../../../../hooks/useFetchFullHistory";
import { CloseModalButton } from "../../CloseModalButton";
import { Tabs } from "../../Tabs";
import { TalentoType } from "../../../../models/type/TalentoType";
import { PersonalDetailsTab } from "./tabs/PersonalDetails";
import { ContractsTabs } from "./tabs/ContractsTab";
import { MovemetsTab } from "./tabs/MovementsTab";
import { EquipmentRequestTab } from "./tabs/EquipmentsRequestTab";
import { ContractsFinishedTab } from "./tabs/ContractsFinishedTab";

interface MDProps {
  onClose: () => void;
  talento: TalentoType;
}

export const MDEmployeeDetails = ({ onClose, talento }: MDProps) => {
  const { details, loading, fetchTalent } = useFetchEmployeeDetails();

  useEffect(() => {
    fetchTalent(talento.idTalento);
  }, [talento.idTalento]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[95%] lg:w-[1300px] min-h-[570px] max-h-[570px] overflow-hidden relative">
        <header className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">
            Detalles Talento - {details?.names || "-"}
          </h2>
          <CloseModalButton onClick={onClose} />
        </header>
        <Tabs
          isDataLoading={loading}
          tabs={[
            {
              label: "Datos personales",
              children: <PersonalDetailsTab details={details} />,
            },
            {
              label: "Contratos",
              children: <ContractsTabs details={details} />,
            },
            {
              label: "Movimientos",
              children: (
                <MovemetsTab
                  details={details}
                  talentId={details?.talentId || 0}
                />
              ),
            },
            {
              label: "Solicitudes de Equipo",
              children: <EquipmentRequestTab details={details} idTalent={details?.talentId || 0} />,
            },
            {
              label: "Ceses",
              children: (
                <ContractsFinishedTab
                  details={details}
                  talentId={details?.talentId || 0}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
