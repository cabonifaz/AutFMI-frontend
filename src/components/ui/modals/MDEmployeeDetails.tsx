import { CloseModalButton } from "../CloseModalButton";
import { Tabs } from "../Tabs";

interface MDProps {
  onClose: () => void;
}

export const MDEmployeeDetails = ({ onClose }: MDProps) => {
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
        <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[95%] lg:w-[1300px] min-h-[570px] relative max-h-[570px] overflow-y-hidden">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-bold mb-2">
              Detalles Empleado
            </h2>
            <CloseModalButton onClick={onClose} />
          </header>

          <Tabs
            isDataLoading={false}
            tabs={[
              {
                label: "Datos personales",
                children: <></>,
              },
              {
                label: "Contratos",
                children: <></>,
              },
              {
                label: "Movimientos",
                children: <></>,
              },
              {
                label: "Solicitudes de Equipo",
                children: <></>,
              },

              {
                label: "Ceses",
                children: <></>,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};
