import { useLocation, useNavigate } from "react-router-dom";
import { TalentoType } from "../models/type/TalentoType";
import { usePostHook } from "../hooks/usePostHook";
import useFetchEmpleado from "../hooks/useFetchEmpleado";
import { TIPO_MONEDA, UNIDAD } from "../utils/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  MovementFormSchema,
  MovementFormType,
} from "../models/schema/MovementFormSchema";
import { useEffect } from "react";
import {
  DropdownForm,
  InputForm,
  SalaryStructureForm,
} from "../components/forms";
import BackButton from "../components/ui/BackButton";
import { Loading } from "../components/ui/Loading";
import { useFetchClients } from "../hooks/useFetchClients";
import { useParams } from "../context/ParamsContext";
import { format, parse } from "date-fns";
import { EmployeeResponseDetail } from "../models/response/EmployeeDetailResponse";
import { Contract } from "../models/response/EmployeeDetailResponse";

const PantallaMovimiento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeDetails, contract } =
  (location.state as {
    employeeDetails: EmployeeResponseDetail;
    contract: Contract;
  }) || {};

  const { postData, postloading } = usePostHook();
  
  const { clientes, loading: clientsLoading } = useFetchClients();
  // Contract no expone el cliente por id, solo su razon social. El id vive en
  // el empleado, igual que lo resuelve PantallaSolicitarEquipo.
  const { employee } = useFetchEmpleado(employeeDetails?.talentId);
  const { paramsByMaestro, loading: paramLoading } = useParams(
    `${UNIDAD}, ${TIPO_MONEDA}`
  );

  const unitValues = paramsByMaestro[UNIDAD] || [];
  const currencyTypes = paramsByMaestro[TIPO_MONEDA] || [];

  const goBack = () => {
  navigate("/pantalla-lista-talentos", {
    state: {
      reopenEmployeeModal: true,
      talentId: employeeDetails?.talentId,
    },
  });
  };


  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<MovementFormType>({
    resolver: zodResolver(MovementFormSchema),
    mode: "onChange",
    defaultValues: {
      nombres: "",
      idMoneda: 0,
      apellidoPaterno: "",
      apellidoMaterno: "",
      idArea: 0,
      idCliente: 0,
      montoBase: 0,
      montoMovilidad: 0,
      montoTrimestral: 0,
      montoSemestral: 0,
      puesto: "",
      idMovArea: 0,
      horario: "",
      fchMovimiento: format(new Date(), "yyyy-MM-dd"),
    },
  });

  useEffect(() => {
  if (employeeDetails) {
    reset({
      nombres: employeeDetails.names || "",
      apellidoPaterno: employeeDetails.lastname || "",
      apellidoMaterno: employeeDetails.surname || "",
      idArea: Number(contract?.areaId) || 0,
      idCliente: Number(employee?.idCliente) || 0,
      montoBase: Number(contract.baseAmount) || 0,
      puesto: contract.rqTitle || "",
      idMoneda: 0,
      idMovArea: 0,
      horario: "",
    });
  }
  }, [employeeDetails, contract, employee, reset]);

  const onSubmit: SubmitHandler<MovementFormType> = async (data) => {
  const nombreCliente = data?.idCliente 
    ? clientes.find((c) => c.idCliente === data.idCliente)?.razonSocial || "" 
    : "";
  const nombreAreaActual = unitValues?.find((a) => a.num1 === data.idArea)?.string1 || "";
  const nombreNuevaArea = unitValues?.find((a) => a.num1 === data.idMovArea)?.string1 || "";

  const formatToISO = (dateStr: string | null | undefined) => {
      if (!dateStr) return null;
      if (dateStr.includes("-")) return dateStr;
      try {
          const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date());
          return format(parsedDate, "yyyy-MM-dd");
      } catch (e) {
          return null;
      }
  };

  const payload = {
    idTalento: employeeDetails?.talentId, 
    nombres: data.nombres,
    apellidoPaterno: data.apellidoPaterno,
    apellidoMaterno: data.apellidoMaterno,
    puesto: data.puesto,
    horario: data.horario,
    fchMovimiento: data.fchMovimiento,

    idMoneda: Number(data.idMoneda) || 0,
    idArea: Number(data.idArea) || 0,
    idCliente: data.idCliente ? Number(data.idCliente) : 0,
    idMovArea: Number(data.idMovArea) || 0,
    // Contract no tiene idModalidad; el campo real es contractTypeId. Antes
    // esto viajaba siempre en 0.
    idModalidad: Number(contract?.contractTypeId) || 0,

    montoBase: Number(data.montoBase) || 0,
    montoMovilidad: Number(data.montoMovilidad) || 0,
    montoTrimestral: Number(data.montoTrimestral) || 0,
    montoSemestral: Number(data.montoSemestral) || 0,
    
    area: nombreAreaActual,
    // Si no se eligió cliente en el combo, se conserva el que ya tenía el
    // contrato en vez de mandar "": HISTORIAL.CLIENTE es la unica llave con la
    // que SP_FMI_REPORTE_MOVIMIENTO puede ubicar al gestor que firma el PDF.
    cliente: nombreCliente || contract?.client || "",
    movArea: nombreNuevaArea,
    proyectoServicio: (contract as any)?.proyecto || "",
    objetoContrato: (contract as any)?.objeto || "",

    fchInicioContrato: formatToISO(contract?.startDate), 
    fchTerminoContrato: formatToISO(contract?.endDate),
  };

  const response = await postData("/fmi/employee/movement", payload);

  if (response?.idTipoMensaje === 2) {
    goBack();
  }
  };

  return (
    <>
      {(paramLoading ||
        postloading ||
        clientsLoading) && <Loading overlayMode={true} />}
      <div className="w-full lg:w-[65%] m-auto p-4 border-2 rounded-lg my-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-8"
        >
          {/* Talent Data */}
          <h3 className="text-2xl font-semibold flex gap-2">
            <BackButton backClicked={goBack} />
            Datos del talento
          </h3>
          <InputForm
            name="nombres"
            control={control}
            label="Nombres"
            error={errors.nombres}
            required={true}
          />
          <InputForm
            name="apellidoPaterno"
            control={control}
            label="Apellido Paterno"
            error={errors.apellidoPaterno}
            required={true}
          />
          <InputForm
            name="apellidoMaterno"
            control={control}
            label="Apellido Materno"
            error={errors.apellidoMaterno}
            required={false}
          />

          <DropdownForm
            name="idArea"
            control={control}
            label="Área"
            error={errors.idArea}
            required={true}
            options={
              unitValues?.map((unit) => ({
                value: unit.num1,
                label: unit.string1,
              })) || []
            }
          />

          {/* Siempre visible y obligatorio, igual que en PantallaSolicitarEquipo.
              Antes se condicionaba a contractType === "RxH", pero contractType es
              la descripcion de la modalidad ("Locación de servicios", "Planilla -
              Reg. general", ...) y nunca vale "RxH": el combo no se renderizaba
              jamas y el movimiento se guardaba sin cliente, dejando al reporte sin
              gestor que firme. */}
          <DropdownForm
            name="idCliente"
            control={control}
            label="Cliente"
            error={errors.idCliente}
            options={
              clientes?.map((client) => ({
                value: client.idCliente,
                label: client.razonSocial,
              })) || []
            }
            required={true}
          />

          {/* Movement */}
          <DropdownForm
            name="idMoneda"
            control={control}
            label="Tipo de moneda"
            error={errors.idMoneda}
            options={
              currencyTypes.map((currency) => ({
                value: currency.num1,
                label: currency.string1,
              })) || []
            }
            required={true}
          />
          <SalaryStructureForm
            control={control}
            mainLabel="Estructura Salarial"
            setValue={setValue}
            enabledFields={[
              "montoBase",
              "montoMovilidad",
              "montoTrimestral",
              "montoSemestral",
            ]}
            errors={errors}
            inputs={[
              {
                label: "Monto Base",
                name: "montoBase",
                type: "number",
                regex: /^\d*(\.\d{0,2})?$/,
              },
              {
                label: "Monto Movilidad",
                name: "montoMovilidad",
                type: "number",
                regex: /^\d*(\.\d{0,2})?$/,
              },
              {
                label: "Monto Trimestral",
                name: "montoTrimestral",
                type: "number",
                regex: /^\d*(\.\d{0,2})?$/,
              },
              {
                label: "Monto Semestral",
                name: "montoSemestral",
                type: "number",
                regex: /^\d*(\.\d{0,2})?$/,
              },
            ]}
          />

          <InputForm
            name="puesto"
            control={control}
            label="Puesto"
            error={errors.puesto}
            required={true}
          />
          <DropdownForm
            name="idMovArea"
            control={control}
            label="Nueva Área"
            error={errors.idMovArea}
            options={
              unitValues?.map((unit) => ({
                value: unit.num1,
                label: unit.string1,
              })) || []
            }
            required={true}
          />
          <InputForm
            name="horario"
            control={control}
            label="Jornada"
            error={errors.horario}
            required={true}
          />
          <InputForm
            name="fchMovimiento"
            control={control}
            label="Fecha de movimiento"
            type="date"
            error={errors.fchMovimiento}
            word_wrap={true}
            required={true}
          />
          {/* Form options */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="btn btn-outline-gray"
              onClick={goBack}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn ${
                isDirty ? "btn-primary" : "btn-disabled"
              }`}
              disabled={!isDirty}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PantallaMovimiento;
