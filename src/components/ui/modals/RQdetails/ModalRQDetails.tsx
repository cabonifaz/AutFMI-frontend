import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { CloseModalButton } from "../../CloseModalButton";
import { Tabs } from "../../Tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ParamType } from "../../../../models/type/ParamType";
import { TabRQData } from "./tabs/TabRQData";
import { useFetchRequirement } from "../../../../hooks/useFetchRequirement";
import { formatISODate } from "../../../../utils/date.utils";
import { ClientType } from "../../../../models/type/ClientType";
import { TabClient } from "./tabs/TabClient";
import { useFetchTarifario } from "../../../../hooks/useFetchTarifario";
import { TabVacancies } from "./tabs/TabVacancies";
import { Utils } from "../../../../utils/utils";
import { useParams } from "../../../../context/ParamsContext";
import { TabFiles } from "./tabs/TabFiles";
import { TabPostulant } from "./tabs/TabPostulant";
import { TabManagment } from "./tabs/TabManagement";
import { Loading } from "../../Loading";
import { usePostHook } from "../../../../hooks/usePostHook";
import { enqueueSnackbar } from "notistack";
import {
  UpdateBaseRQSchemaType,
  UpdateBaseRQSchema,
} from "../../../../models/schema/UpdateBaseRQSchema";
import {
  DURACION_RQ,
  MODALIDAD_RQ,
  TIPO_MODALIDAD,
  HABILIDADES_TECNICAS,
  GRADO_ESTUDIO,
  TIPO_ARCHIVOS_RQ,
  TIPO_ARCHIVO,
  TIPO_MONEDA,
} from "../../../../utils";

interface ModalProps {
  rqId: number;
  rqStates: ParamType[];
  clients: ClientType[];
  onClose: () => void;
  handleAssingPost: (rqId: number) => void;
  updateRQData: () => void;
}

export const ModalRQDetails = ({
  rqId,
  rqStates,
  clients,
  onClose,
  handleAssingPost,
  updateRQData,
}: ModalProps) => {
  // @marker params
  const { paramsByMaestro, refetchParams } = useParams(
    `${DURACION_RQ}, ${MODALIDAD_RQ}, ${TIPO_MODALIDAD}, ${HABILIDADES_TECNICAS},${GRADO_ESTUDIO}, 
      ${TIPO_ARCHIVOS_RQ}, ${TIPO_ARCHIVO}, ${TIPO_MONEDA}`,
  );

  // @marker base state
  const [initialFiles, setInitialFiles] = useState<any[]>([]);
  const { postData, postloading } = usePostHook();
  const [isEditing, setIsEditing] = useState(false);

  // @marker params
  const fileTypes = paramsByMaestro[TIPO_ARCHIVOS_RQ] || [];
  const rqDurationOptions = paramsByMaestro[DURACION_RQ] || [];
  const paymentModes = paramsByMaestro[TIPO_MODALIDAD] || [];
  const rqMode = paramsByMaestro[MODALIDAD_RQ] || [];
  const extensionTypes = paramsByMaestro[TIPO_ARCHIVO] || [];
  const currencyOptions = paramsByMaestro[TIPO_MONEDA] || [];

  const techSkillsParams =
    paramsByMaestro[HABILIDADES_TECNICAS] || [];
  const paramsDegrees = paramsByMaestro[GRADO_ESTUDIO] || [];

  const availableTechSkills = techSkillsParams.map((skill) => ({
    id: skill.num1,
    label: skill.string1,
  }));
  const availableDegrees = paramsDegrees.map((param) => ({
    id: param.num1,
    label: param.string1,
  }));

  // @marker form hadlers
  const methods = useForm<UpdateBaseRQSchemaType>({
    resolver: zodResolver(UpdateBaseRQSchema),
    defaultValues: {
      codigoRQ: "",
      titulo: "",
      descripcion: "",
      fechaSolicitud: "",
      fechaVencimiento: "",
      idEstadoRQ: 0,
      idCliente: 0,
      duracion: 1,
      idModalidadFact: [],
      lstVacantes: [],
      lstArchivos: [],
      contrato: undefined,
    },
  });

  const { reset, formState } = methods;

  // @marker requirement
  const {
    requirement: res,
    loading: reqLoading,
    fetchRequirement,
  } = useFetchRequirement(rqId);

  // @marker tarifario
  const {
    tarifario,
    fetchTarifario,
    loading: loadingTarifario,
  } = useFetchTarifario();

  // Sync RQ form
  useEffect(() => {
    if (res?.requerimiento) {
      const req = res.requerimiento;

      // Get Tarifario

      const clientId = req?.idCliente;
      if (clientId && clientId > 0) {
        fetchTarifario(clientId);
      }

      // map vacancies
      const mappedVacancies = req.lstRqVacantes.map((v) => {
        const tariffFound = tarifario.find(
          (item) => item.idPerfil === v.idPerfil,
        );

        const tarifa = tariffFound
          ? tariffFound.tarifa.toFixed(2)
          : "-";

        const moneda = tariffFound?.moneda || "S/.";

        return {
          idRequerimientoVacante: v.idRequerimientoVacante,
          idPerfil: v.idPerfil,
          cantidad: v.cantidad,
          idEstado: 0,
          tarifaInicial: `${Utils.formatCoin(v.tarifaInicial || 0)}`,
          tarifaFinal: v.tarifaFinal || 0,
          tarifa:
            tarifa === "-"
              ? "S/. -"
              : `${moneda} ${Utils.formatCoin(Number(tarifa))}`,
        };
      });

      const mappedFiles = req.lstRqArchivo.map((file) => ({
        idRequerimientoArchivo: file.idRequerimientoArchivo,
        name: file.nombreArchivo,
        size: 0,
        file: new File([], file.nombreArchivo),
        idTipoArchivoRq: file.idTipoArchivoRq,
      }));

      setInitialFiles(mappedFiles);

      // Decode Fact modes
      const factModes = (req?.modalidadFact ?? "")
        .split(",")
        .map((m: string) => Number(m.trim()))
        .filter((m: any) => !isNaN(m));

      const { idDuracionContrato, duracionContrato } = req;

      // Determinar si tiene duración basado en los valores de duracion e idDuracion
      const hasDuration = !!(
        req.duracion &&
        req.duracion > 0 &&
        req.idDuracion &&
        req.idDuracion > 0
      );

      // Mapear facturación
      const mappedFacturacion =
        req.lstRqFacturacion?.map((f) => ({
          idModalidad: f.idModalidad ?? 0,
          idGrupoModalidad: f.idGrupoModalidad ?? 0,

          currencyType: f.currencyType,

          minBaseAmount: f.minBaseAmount,
          maxBaseAmount: f.maxBaseAmount,

          minTravelAllowance: f.minTravelAllowance,
          maxTravelAllowance: f.maxTravelAllowance,

          minMonthlyAmount: f.minMonthlyAmount,
          maxMonthlyAmount: f.minMonthlyAmount,

          minQuarterlyAmount: f.minQuarterlyAmount,
          maxQuarterlyAmount: f.maxQuarterlyAmount,

          minSemiAnnualAmount: f.minSemiAnnualAmount,
          maxSemiAnnualAmount: f.maxSemiAnnualAmount,

          idEstadoRegistro: Number(f.idEstadoRegistro ?? 1),
        })) ?? [];

      reset({
        codigoRQ: req.codigoRQ ?? "",
        titulo: req.titulo ?? "",
        descripcion: req.descripcion ?? "",
        tieneDuracion: hasDuration,

        fechaSolicitud: req.fechaSolicitud
          ? formatISODate(req.fechaSolicitud)
          : "",
        fechaVencimiento: req.fechaVencimiento
          ? formatISODate(req.fechaVencimiento)
          : "",
        idEstadoRQ: req.idEstado ?? 0,
        idCliente: req.idCliente ?? 0,
        // Duración condicional
        idDuracion: hasDuration ? req.idDuracion : 1,
        duracion: hasDuration ? req.duracion : 1,
        lstVacantes: mappedVacancies,
        lstArchivos: mappedFiles,
        idModalidad: req.idModalidad,
        idModalidadFact: factModes,
        contrato: {
          idDuration: idDuracionContrato || undefined,
          duration: duracionContrato || undefined,
        },
        lstFacturacion: mappedFacturacion,
      });
    }
  }, [res, reset]);

  useEffect(() => {
    const req = res?.requerimiento;
    const clientId = req?.idCliente;
    if (clientId && clientId > 0) {
      fetchTarifario(clientId);
    }
  }, [res]);

  // @remove
  useEffect(() => {
    console.log("Error: ", formState.errors);
  }, [formState.errors]);

  const handleToggleEdit = () => {
    const req = res?.requerimiento;
    if (isEditing && req) {
      const clientId = req?.idCliente;
      if (clientId && clientId > 0) {
        fetchTarifario(clientId);
      }

      // map vacancies
      const mappedVacancies = req.lstRqVacantes.map((v) => {
        const tariffFound = tarifario.find(
          (item) => item.idPerfil === v.idPerfil,
        );

        const tarifa = tariffFound
          ? tariffFound.tarifa.toFixed(2)
          : "-";

        const moneda = tariffFound?.moneda || "S/.";

        return {
          idRequerimientoVacante: v.idRequerimientoVacante,
          idPerfil: v.idPerfil,
          cantidad: v.cantidad,
          idEstado: 0,
          tarifaInicial: `${Utils.formatCoin(v.tarifaInicial || 0)}`,
          tarifaFinal: v.tarifaFinal || 0,
          tarifa:
            tarifa === "-"
              ? "S/. -"
              : `${moneda} ${Utils.formatCoin(Number(tarifa))}`,
        };
      });

      const mappedFiles = req.lstRqArchivo.map((file) => ({
        idRequerimientoArchivo: file.idRequerimientoArchivo,
        name: file.nombreArchivo,
        size: 0,
        file: new File([], file.nombreArchivo),
        idTipoArchivoRq: file.idTipoArchivoRq,
      }));

      setInitialFiles(mappedFiles);

      // Decode Fact modes
      const factModes = (req?.modalidadFact ?? "")
        .split(",")
        .map((m: string) => Number(m.trim()))
        .filter((m: any) => !isNaN(m));

      // Duración de contrato
      const { idDuracionContrato, duracionContrato } = req;

      // Determinar si tiene duración basado en los valores de duracion e idDuracion
      const hasDuration = !!(
        req.duracion &&
        req.duracion > 0 &&
        req.idDuracion &&
        req.idDuracion > 0
      );

      // Mapear facturación
      const mappedFacturacion =
        req.lstRqFacturacion?.map((f) => ({
          idModalidad: f.idModalidad ?? 0,
          idGrupoModalidad: f.idGrupoModalidad ?? 0,

          currencyType: f.currencyType,

          minBaseAmount: f.minBaseAmount,
          maxBaseAmount: f.maxBaseAmount,

          minTravelAllowance: f.minTravelAllowance,
          maxTravelAllowance: f.maxTravelAllowance,

          minMonthlyAmount: f.minMonthlyAmount,
          maxMonthlyAmount: f.minMonthlyAmount,

          minQuarterlyAmount: f.minQuarterlyAmount,
          maxQuarterlyAmount: f.maxQuarterlyAmount,

          minSemiAnnualAmount: f.minSemiAnnualAmount,
          maxSemiAnnualAmount: f.maxSemiAnnualAmount,

          idEstadoRegistro: Number(f.idEstadoRegistro ?? 1),
        })) ?? [];

      reset({
        codigoRQ: req.codigoRQ ?? "",
        titulo: req.titulo ?? "",
        descripcion: req.descripcion ?? "",
        tieneDuracion: hasDuration,

        fechaSolicitud: req.fechaSolicitud
          ? formatISODate(req.fechaSolicitud)
          : "",
        fechaVencimiento: req.fechaVencimiento
          ? formatISODate(req.fechaVencimiento)
          : "",
        idEstadoRQ: req.idEstado ?? 0,
        idCliente: req.idCliente ?? 0,
        // Duración condicional
        idDuracion: hasDuration ? req.idDuracion : 1,
        duracion: hasDuration ? req.duracion : 1,
        lstVacantes: mappedVacancies,
        lstArchivos: mappedFiles,
        idModalidad: req.idModalidad,
        idModalidadFact: factModes,
        contrato: {
          idDuration: idDuracionContrato,
          duration: duracionContrato,
        },
        lstFacturacion: mappedFacturacion,
      });
    }

    setIsEditing(!isEditing);
  };

  const totalVacs =
    res?.requerimiento.lstRqVacantes.reduce(
      (sum, vacante) => sum + Number(vacante.cantidad || 0),
      0,
    ) ?? 0;

  const onSubmit = async (data: UpdateBaseRQSchemaType) => {
    try {
      const idCliente = Number(data.idCliente);
      const { lstArchivos, lstVacantes, autogenRQ, ...cleanData } =
        data;

      const vacanciesToSent = data.lstVacantes
        .filter((v) => v.idEstado !== 0)
        .map((vacante) => ({
          idRequerimientoVacante: vacante.idRequerimientoVacante,
          idPerfil: vacante.idPerfil,
          cantidad: vacante.cantidad,
          idEstado: vacante.idEstado,
          tarifaFinal: vacante.tarifaFinal,
        }));

      // Flat duración de contrato
      const { contrato } = data;
      const idDuracionContrato = contrato?.idDuration;
      const duracionContrato = contrato?.duration;

      // Map duration
      const { tieneDuracion } = data;

      const payload = {
        ...cleanData,
        idRequerimiento: rqId,
        idCliente: idCliente,
        cliente: res?.requerimiento.cliente,
        estado: data.idEstadoRQ,
        idDuracion: tieneDuracion
          ? Number(data.idDuracion)
          : undefined,
        duracion: tieneDuracion ? Number(data.duracion) : undefined,
        lstVacantes: vacanciesToSent,
        idModalidadFact: data.idModalidadFact?.join(","),
        idDuracionContrato: idDuracionContrato,
        duracionContrato: duracionContrato,
      };

      const response = await postData(
        "/fmi/requirement/update",
        payload,
      );

      if (response.idTipoMensaje === 2) {
        fetchRequirement();
        updateRQData();
        setIsEditing(false);
      }
    } catch (error) {
      enqueueSnackbar({
        message: "Ocurrió un error al guardar los nuevos datos",
        variant: "error",
      });
    }
  };

  return (
    <>
      {(reqLoading || postloading) && <Loading overlayMode />}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
        <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[95%] lg:w-[1300px] min-h-[570px] relative max-h-[570px] overflow-y-hidden">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-bold mb-2">Detalles RQ</h2>
            <CloseModalButton onClick={onClose} />
          </header>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Tabs
                isDataLoading={reqLoading}
                tabs={[
                  {
                    label: "Cliente",
                    children: (
                      <TabClient
                        rqId={rqId}
                        clients={clients}
                        contacts={
                          res?.requerimiento.lstRqContactos || []
                        }
                        fetchRequirement={fetchRequirement}
                      />
                    ),
                  },
                  {
                    label: "Datos RQ",
                    children: (
                      <TabRQData
                        rqStates={rqStates}
                        isEditing={isEditing}
                        handleToggleEdit={handleToggleEdit}
                      />
                    ),
                  },
                  {
                    label: (
                      <p className="flex gap-2">
                        Vacantes
                        <span
                          className={`flex items-center justify-center rounded-full bg-[var(--color-blue)] text-white w-8 h-8 text-xs`}
                        >
                          {totalVacs}
                        </span>
                      </p>
                    ),
                    children: (
                      <TabVacancies
                        tariff={tarifario}
                        isEditing={isEditing}
                        handleToggleEdit={handleToggleEdit}
                        availableDegrees={availableDegrees}
                        availableTechSkills={availableTechSkills}
                        refetchParams={refetchParams}
                        vacancies={
                          res?.requerimiento.lstRqVacantes || []
                        }
                        fetchRequirement={fetchRequirement}
                      />
                    ),
                  },
                  {
                    label: "Archivos",
                    children: (
                      <TabFiles
                        rqId={rqId}
                        fileOptions={fileTypes}
                        initialFiles={initialFiles}
                        fetchRequirement={fetchRequirement}
                        extensionTypes={extensionTypes}
                      />
                    ),
                  },
                  {
                    label: "Postulantes",
                    children: (
                      <TabPostulant
                        rqId={rqId}
                        rqState={res?.requerimiento.idEstado || 0}
                        handleAssign={handleAssingPost}
                        talents={
                          res?.requerimiento.lstRqTalento || []
                        }
                      />
                    ),
                  },
                  {
                    label: "Gestión",
                    children: (
                      <TabManagment
                        isEditing={isEditing}
                        handleToggleEdit={handleToggleEdit}
                        rqDurationOptions={rqDurationOptions}
                        paymentModes={paymentModes}
                        rqMode={rqMode}
                        currencyOptions={currencyOptions}
                      />
                    ),
                  },
                ]}
              />
            </form>
          </FormProvider>
        </div>
      </div>
    </>
  );
};
