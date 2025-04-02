import { useLocation, useNavigate } from 'react-router-dom';
import useFetchParams from '../hooks/useFetchParams';
import { usePostHook } from '../hooks/usePostHook';
import { MOTIVO_INGRESO, TIPO_MODALIDAD, UNIDAD } from '../utils/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EntryFormType, EntryFormSchema } from '../models/schema/EntryFormSchema';
import { useEffect } from 'react';
import { DropdownForm, InputForm, SalaryStructureForm } from '../components/forms';
import { sedeSunatList } from '../models/type/SedeSunatType';
import BackButton from '../components/ui/BackButton';
import useFetchTalento from '../hooks/useFetchTalento';
import { Loading } from '../components/ui/Loading';
import { useFetchClients } from '../hooks/useFetchClients';

const PantallaIngreso = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { talento, data } = location.state || {};

  const { postData, postloading } = usePostHook();
  const { talentoDetails, loading: TalentoLoading } = useFetchTalento(talento.idTalento);
  const { clientes, loading: clientsLoading } = useFetchClients();
  const { params, paramLoading } = useFetchParams(`${TIPO_MODALIDAD}, ${UNIDAD}, ${MOTIVO_INGRESO}`);

  const modalityValues = params?.filter((param) => param.num2 === Number(data.idModalidad));
  const unitValues = params?.filter((param) => param.idMaestro === Number(UNIDAD));
  const reasonValues = params?.filter((param) => param.idMaestro === Number(MOTIVO_INGRESO));

  const goBack = () => navigate(-1);

  const { control, handleSubmit, formState: { errors, isDirty, isSubmitSuccessful }, reset, setValue } = useForm<EntryFormType>({
    resolver: zodResolver(EntryFormSchema),
    mode: "onTouched",
    defaultValues: {
      idModalidad: 0,
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      idArea: 0,
      idCliente: 0,
      idMotivo: 0,
      cargo: "",
      montoBase: 0,
      montoMovilidad: 0,
      montoTrimestral: 0,
      montoSemestral: 0,
      fchInicioContrato: "",
      fchTerminoContrato: "",
      proyectoServicio: "",
      objetoContrato: "",
      declararSunat: 0,
      idSedeDeclarar: 0
    }
  });

  useEffect(() => {
    if (talentoDetails) {
      reset({
        nombres: talentoDetails?.nombres || "",
        apellidoPaterno: talentoDetails?.apellidoPaterno || "",
        apellidoMaterno: talentoDetails?.apellidoMaterno || "",
        cargo: talentoDetails?.cargo || "",
        montoBase: talentoDetails?.remuneracion || 0,
        idModalidad: talentoDetails?.idModalidad || 0,
      });
    }
  }, [reset, talentoDetails]);

  const onSubmit: SubmitHandler<EntryFormType> = async (data) => {
    const { idSedeDeclarar, declararSunat, ...filteredData } = data;

    const response = await postData("/fmi/employee/entry", {
      idTalento: talento.idTalento,
      idUsuarioTalento: talento.idUsuarioTalento,
      idMoneda: null,
      fchHistorial: new Date().toJSON().slice(0, 10).replace(/-/g, '-'),
      declararSunat: data.declararSunat === 1 ? 1 : 0,
      sedeDeclarar: sedeSunatList.find((sede) => sede.idSede === idSedeDeclarar)?.nombre,
      ...filteredData,
    });

    if (response.idTipoMensaje === 2) {
      goBack();
    }
  };

  return (
    <>
      {(paramLoading || postloading || TalentoLoading || clientsLoading) && <Loading overlayMode={true} />}
      <div className="w-full lg:w-[65%] m-auto p-4 border-2 rounded-lg my-8">
        {/* Modality */}
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-2 md:gap-4">
            <BackButton backClicked={goBack} />
            <h3 className="text-xl md:text-2xl font-semibold whitespace-nowrap">Modalidad</h3>
          </div>

          <div className="w-[180px] md:w-[200px]"> {/* Ancho fijo responsivo */}
            <DropdownForm
              name="idModalidad"
              control={control}
              error={errors.idModalidad}
              options={modalityValues?.map((modality) => ({
                value: modality.num1,
                label: modality.string1
              })) || []}
              required={true}
              flex={true}  // Asegura que el dropdown ocupe todo el ancho disponible
            />
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {/* Talent Data */}
          <h3 className="text-2xl font-semibold mt-2">Datos del talento</h3>
          <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} required={true} />
          <InputForm name="apellidoPaterno" control={control} label="Apellido Paterno" error={errors.apellidoPaterno} required={true} />
          <InputForm name="apellidoMaterno" control={control} label="Apellido Materno" error={errors.apellidoMaterno} required={true} />

          <DropdownForm name="idArea" control={control} label="Área" error={errors.idArea}
            options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
            required={true}
          />

          {Number(data.idModalidad) === 2 && (
            <DropdownForm name="idCliente" control={control} label="Cliente" error={errors.idCliente}
              options={clientes?.map((client) => ({ value: client.idCliente, label: client.razonSocial })) || []}
              required={true}
            />
          )}

          {/* Entry */}
          <h3 className="text-2xl font-semibold">Ingreso</h3>

          <DropdownForm name="idMotivo" control={control} label="Motivo de ingreso" error={errors.idMotivo}
            options={reasonValues?.map((reason) => ({ value: reason.num1, label: reason.string1 })) || []}
            required={true}
          />

          <InputForm name="cargo" control={control} label="Cargo" error={errors.cargo} required={true} />
          <InputForm name="horarioTrabajo" control={control} label="Horario de trabajo" error={errors.horarioTrabajo} required={true} />
          {/* Salary */}
          <SalaryStructureForm control={control} mainLabel="Estructura Salarial" setValue={setValue} errors={errors}
            inputs={[
              { label: "Monto Base", name: "montoBase", type: "number" },
              { label: "Monto Movilidad", name: "montoMovilidad", type: "number" },
              { label: "Monto Trimestral", name: "montoTrimestral", type: "number" },
              { label: "Monto Semestral", name: "montoSemestral", type: "number" }
            ]}
          />
          {/* Dates and aditional info */}
          <InputForm name="fchInicioContrato" control={control} label="F. Inicio contrato" type="date" error={errors.fchInicioContrato} required={true} />
          <InputForm name="fchTerminoContrato" control={control} label="F. Termino contrato" type="date" error={errors.fchTerminoContrato} required={true} />
          <InputForm name="proyectoServicio" control={control} label="Proyecto / Servicio" error={errors.proyectoServicio} required={true} />
          <InputForm name="objetoContrato" control={control} label="Objeto del contrato" error={errors.objetoContrato} required={true} />
          {/* SUNAT */}
          <h3 className="text-2xl font-semibold">Declaración en SUNAT (*)</h3>
          <DropdownForm name="declararSunat" control={control} label="¿Declarado en SUNAT?" error={errors.declararSunat}
            options={[{ value: 1, label: "Sí" }, { value: 2, label: "No" }]}
            word_wrap={true}
            required={true}
          />
          <DropdownForm name="idSedeDeclarar" control={control} label="Sede a declarar" error={errors.idSedeDeclarar}
            options={sedeSunatList.map((sede) => ({ value: sede.idSede, label: sede.nombre }))}
            required={true}
          />
          {/* Form options */}
          <div className="flex justify-center gap-4">
            <button type="button" className="btn btn-outline-gray" onClick={goBack}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn ${isDirty && !isSubmitSuccessful ? "btn-primary" : "btn-disabled"}`}
              disabled={!isDirty || isSubmitSuccessful}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PantallaIngreso;
