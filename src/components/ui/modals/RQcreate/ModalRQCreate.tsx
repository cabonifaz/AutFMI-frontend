import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { CloseModalButton } from "../../CloseModalButton";
import { Tabs } from "../../Tabs";
import {
  newRQSchema,
  newRQSchemaType,
} from "../../../../models/schema/NewRQSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TabData } from "./tabs/TabData";
import { TabClients } from "./tabs/TabClients";
import { ClientType } from "../../../../models/type/ClientType";
import { ParamType } from "../../../../models/type/ParamType";
import { format } from "date-fns";
import { TabVacancies } from "./tabs/TabVacancies";
import { Loading } from "../../Loading";
import { useFetchTarifario } from "../../../../hooks/useFetchTarifario";
import {
  DURACION_RQ,
  GRADO_ESTUDIO,
  HABILIDADES_TECNICAS,
  MODALIDAD_RQ,
  TIPO_ARCHIVO,
  TIPO_ARCHIVOS_RQ,
  TIPO_MODALIDAD,
  TIPO_MONEDA,
} from "../../../../utils/config";
import { useParams } from "../../../../context/ParamsContext";
import { TabFiles } from "./tabs/TabFiles";
import { TabManagement } from "./tabs/TabManagment";
import { Utils } from "../../../../utils/utils";
import { usePostHook } from "../../../../hooks/usePostHook";
import { enqueueSnackbar } from "notistack";
import { useEffect } from "react";

interface TabLabelProps {
  label: string;
  hasError?: boolean;
}

const TabLabel = ({ label, hasError }: TabLabelProps) => (
  <div className="flex items-center gap-2">
    <span>{label}</span>
    {hasError && (
      <span
        className="inline-block w-2 h-2 bg-red-500 rounded-full"
        title="Hay errores en esta sección"
      />
    )}
  </div>
);

interface ModalProps {
  rqStates: ParamType[];
  clients: ClientType[];
  onClose: () => void;
  updateRQData: () => void;
}

export const ModalRQCreate = ({
  rqStates,
  clients,
  onClose,
  updateRQData,
}: ModalProps) => {
  // @marker params
  const {
    paramsByMaestro,
    refetchParams,
    loading: loadingParams,
  } = useParams(
    `${DURACION_RQ}, ${MODALIDAD_RQ}, ${TIPO_MODALIDAD}, ${HABILIDADES_TECNICAS}, ${GRADO_ESTUDIO},
      ${TIPO_ARCHIVOS_RQ}, ${TIPO_ARCHIVO}, ${TIPO_MONEDA}`,
  );

  const skillsByParams = paramsByMaestro[HABILIDADES_TECNICAS] || [];
  const paramsDegrees = paramsByMaestro[GRADO_ESTUDIO] || [];
  const fileTypes = paramsByMaestro[TIPO_ARCHIVOS_RQ] || [];
  const rqDuration = paramsByMaestro[DURACION_RQ] || [];
  const rqModes = paramsByMaestro[MODALIDAD_RQ] || [];
  const factModes = paramsByMaestro[TIPO_MODALIDAD] || [];
  const tipoArchivoParams = paramsByMaestro[TIPO_ARCHIVO] || [];
  const currencyOptions = paramsByMaestro[TIPO_MONEDA] || [];

  // @marker base states
  const techSkills = skillsByParams.map((s) => ({
    id: s.num1,
    label: s.string1,
  }));
  const availableDegrees = paramsDegrees.map((param) => ({
    id: param.num1,
    label: param.string1,
  }));
  const fileOptions = fileTypes.map((type) => ({
    id: type.num1,
    label: type.string1,
  }));

  const {
    tarifario,
    fetchTarifario,
    loading: loadingTariff,
  } = useFetchTarifario();

  const { postData, postloading } = usePostHook();

  const methods = useForm<newRQSchemaType>({
    resolver: zodResolver(newRQSchema),
    defaultValues: {
      idCliente: 0,
      fechaSolicitud: format(new Date(), "yyyy-MM-dd"),
      descripcion: "",
      idEstado: 0,
      lstVacantes: [],
      lstArchivos: [],
      duracion: 1,
      idDuracion: 0,
      idModalidad: 0,
      idModalidadFact: [],
      tieneDuracion: true,
      contrato: {
        duracionContrato: 1,
        idDuracionContrato: 0,
      },
      lstFacturacion: [],
    },
  });

  const onSubmit: SubmitHandler<newRQSchemaType> = async (data) => {
    try {
      // 1. Transformar el estado a número
      const idCliente = Number(data.idCliente);

      // 2. Transformar los archivos
      const lstArchivos = await Promise.all(
        data.lstArchivos?.map(async (f) => {
          const base64 = await Utils.fileToBase64(f.file);
          const { nombreArchivo, extensionArchivo } =
            Utils.getFileNameAndExtension(f.name);
          const idTipoArchivo = Utils.getTipoArchivoId(
            extensionArchivo,
            tipoArchivoParams,
          );
          return {
            string64: base64,
            nombreArchivo,
            extensionArchivo,
            idTipoArchivo,
            idTipoArchivoRQ: f.idTipoArchivoRQ,
          };
        }) || [],
      );

      /** Modalidad fact */
      const modalidadFact = data.idModalidadFact?.join(",");

      // Mapea vacantes a formato esperado
      const lstVacantes = data.lstVacantes.map((vacante) => ({
        tempVacancyId: vacante.tempVacancyId,
        idPerfil: Number(vacante.idPerfil),
        cantidad: Number(vacante.cantidad),
        tarifaFinal: vacante.tarifaFinal,
      }));

      const lstVacanteSkills = data.lstVacanteSkills || [];
      const lstCareers = data.lstCarreras || [];

      const client = clients.find((c) => c.idCliente === idCliente);
      const contacts = data.lstContactos?.join(",") || "";

      // Flat de duración de contrato
      const { idDuracionContrato, duracionContrato } = data.contrato;

      // 3. Crear el objeto final para enviar
      const payload = {
        ...data,
        idCliente: idCliente,
        codigoRQ: data.codigoRQ,
        cliente: client?.razonSocial,
        estado: data.idEstado,
        duracion: Number(data.duracion),
        lstVacantes: lstVacantes,
        lstContactos: contacts,
        lstArchivos,
        idModalidadFact: modalidadFact === "" ? undefined : modalidadFact,
        lstVacanteSkills,
        lstCarreras: lstCareers,
        idDuracionContrato: idDuracionContrato,
        duracionContrato: duracionContrato,
      };

      // 4. Enviar los datos al servidor
      const response = await postData("/fmi/requirement/save", payload);

      if (response.idTipoMensaje === 2) {
        onClose();
        updateRQData();
      }
    } catch (error) {
      enqueueSnackbar({
        message: "No se puedo enviar los datos al servidor",
        variant: "error",
      });
    }
  };

  const managementHasErrors = () => {
    const { errors } = methods.formState;

    // Validamos errores en campos directos y objetos anidados (contrato)
    const hasBaseErrors =
      !!errors.idDuracion ||
      !!errors.tieneDuracion ||
      !!errors.duracion ||
      !!errors.idModalidad ||
      !!errors.idModalidadFact ||
      !!errors.contrato?.duracionContrato ||
      !!errors.contrato?.idDuracionContrato;

    // Validamos errores en el arreglo lstFacturacion
    const hasFacturacionErrors = !!errors.lstFacturacion;

    return hasBaseErrors || hasFacturacionErrors;
  };

  const vacantesHasErrors = () => {
    const errors = methods.formState.errors;

    return (
      (!!methods.getValues("idCliente") &&
        methods.getValues("lstVacantes").length === 0) ||
      !!errors.lstCarreras ||
      !!errors.lstVacanteSkills ||
      !!errors.lstVacantes
    );
  };

  const rqHasErrors = () => {
    const { errors } = methods.formState;

    return !!(
      errors.codigoRQ ||
      errors.descripcion ||
      errors.idEstado ||
      errors.titulo ||
      errors.fechaSolicitud ||
      errors.fechaVencimiento
    );
  };

  const filesHasErrors = () => {
    const { errors } = methods.formState;
    return !!errors.lstArchivos;
  };

  const clientHasErrors = () => {
    const { errors } = methods.formState;
    return !!(errors.idCliente || errors.lstContactos);
  };

  return (
    <>
      {(loadingTariff || loadingParams || postloading) && (
        <Loading overlayMode />
      )}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
        <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[1200px] min-h-[570px] overflow-y-auto relative">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-bold mb-2">Agregar Nuevo RQ</h2>
            <CloseModalButton onClick={onClose} />
          </header>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Tabs
                isDataLoading={false}
                tabs={[
                  {
                    label: (
                      <TabLabel label="Cliente" hasError={clientHasErrors()} />
                    ),
                    children: (
                      <TabClients
                        clients={clients}
                        fetchTarifario={fetchTarifario}
                      />
                    ),
                  },
                  {
                    label: (
                      <TabLabel label="Datos RQ" hasError={rqHasErrors()} />
                    ),
                    children: <TabData rqStates={rqStates} />,
                  },

                  {
                    label: (
                      <TabLabel
                        label="Vacantes"
                        hasError={vacantesHasErrors()}
                      />
                    ),
                    children: (
                      <TabVacancies
                        tarifario={tarifario}
                        techSkills={techSkills}
                        availableDegrees={availableDegrees}
                        refetchParams={refetchParams}
                      />
                    ),
                  },
                  {
                    label: (
                      <TabLabel label="Archivos" hasError={filesHasErrors()} />
                    ),
                    children: (
                      <TabFiles
                        fileOptions={fileOptions}
                        fileTypes={tipoArchivoParams}
                      />
                    ),
                  },
                  {
                    label: (
                      <TabLabel
                        label="Gestión"
                        hasError={managementHasErrors()}
                      />
                    ),
                    children: (
                      <TabManagement
                        rqDuration={rqDuration}
                        rqModes={rqModes}
                        factModes={factModes}
                        currencyOptions={currencyOptions}
                      />
                    ),
                  },
                ]}
              />
              {/* Botones de acción */}
              <div className="flex justify-end space-x-4 mt-6 me-1">
                <button type="submit" className="btn btn-primary">
                  Agregar RQ
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </>
  );
};
