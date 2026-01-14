import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import { InfoCard } from "../../../InfoCard";

interface MDProps {
  details?: EmployeeResponseDetail;
}

export const PersonalDetailsTab = ({ details }: MDProps) => {
  return (
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
      <InfoCard label="Documento" value={details?.documentNumber} />
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <InfoCard label="Descripción" value={details?.description} />
      </div>
    </div>
  );
};
