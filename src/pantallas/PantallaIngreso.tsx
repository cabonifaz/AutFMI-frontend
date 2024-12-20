import { useLocation, useNavigate } from 'react-router-dom';
import useFetchParams from '../hooks/useFetchParams';
import { usePostHook } from '../hooks/usePostHook';
import { MOTIVO_INGRESO, TIPO_MODALIDAD, UNIDAD } from '../utils/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EntryFormType, EntryFormSchema } from '../models/schema/EntryFormSchema';
import { useEffect } from 'react';
import Loading from '../components/loading/Loading';
import { DropdownForm, InputForm, SalaryStructureForm } from '../components/forms';
import { sedeSunatList } from '../models/type/SedeSunatType';

const PantallaIngreso = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { talento, data } = location.state || {};

  const { postData, postloading } = usePostHook();
  const { params, paramLoading } = useFetchParams(`${TIPO_MODALIDAD}, ${UNIDAD}, ${MOTIVO_INGRESO}`);

  const modalityValues = params?.filter((param) => param.num2 === Number(data.idModalidad));
  const unitValues = params?.filter((param) => param.idMaestro === Number(UNIDAD));
  const reasonValues = params?.filter((param) => param.idMaestro === Number(MOTIVO_INGRESO));

  const { control, handleSubmit, formState: { errors, isDirty, isSubmitted }, reset } = useForm<EntryFormType>({
    resolver: zodResolver(EntryFormSchema),
    mode: "onTouched",
    defaultValues: {
      idModalidad: 0,
      nombres: talento?.nombres || "",
      apellidos: talento?.apellidos || "",
      idUnidad: 0,
      empresa: "",
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
    if (talento) {
      reset({
        nombres: talento?.nombres || "",
        apellidos: talento?.apellidos || "",
      });
    }
  }, [talento, reset]);

  const onSubmit: SubmitHandler<EntryFormType> = async (data) => {
    const { idSedeDeclarar, declararSunat, ...filteredData } = data;

    await postData("/fmi/employee/entry", {
      idTalento: talento.idTalento,
      idUsuarioTalento: talento.idUsuarioTalento,
      idMoneda: null,
      fchHistorial: new Date().toJSON().slice(0, 10).replace(/-/g, '-'),
      declararSunat: data.declararSunat === 1 ? 1 : 0,
      sedeDeclarar: sedeSunatList.find((sede) => sede.idSede === idSedeDeclarar)?.nombre,
      ...filteredData,
    });
  };

  return (
    <>
      {paramLoading && <Loading />}
      {postloading && <Loading />}
      <div className="w-[65%] h-fit m-auto p-4 border-2 rounded-lg">
        {/* Modality */}
        <div className="flex">
          <h3 className="flex-[0.5]">Modalidad</h3>
          <DropdownForm name="idModalidad" control={control} error={errors.idModalidad}
            options={modalityValues?.map((modality) => ({ value: modality.num1, label: modality.string1 })) || []}
          />
        </div>
        <hr />
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Talent Data */}
          <h3>Datos del talento</h3>
          <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} />
          <InputForm name="apellidos" control={control} label="Apellidos" error={errors.apellidos} />

          <DropdownForm name="idUnidad" control={control} label="Unidad" error={errors.idUnidad}
            options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
          />

          <InputForm name="empresa" control={control} label="Empresa" error={errors.empresa} />

          {/* Entry */}
          <h3>Ingreso</h3>

          <DropdownForm name="idMotivo" control={control} label="Motivo de ingreso" error={errors.idMotivo}
            options={reasonValues?.map((reason) => ({ value: reason.num1, label: reason.string1 })) || []}
          />

          <InputForm name="cargo" control={control} label="Cargo" error={errors.cargo} />
          {/* Salary */}
          <SalaryStructureForm control={control} mainLabel="Estructura Salarial"
            inputs={[
              { label: "Monto Base", name: "montoBase", type: "number", error: errors.montoBase },
              { label: "Monto Movilidad", name: "montoMovilidad", type: "number", error: errors.montoMovilidad },
              { label: "Monto Trimestral", name: "montoTrimestral", type: "number", error: errors.montoTrimestral },
              { label: "Monto Semestral", name: "montoSemestral", type: "number", error: errors.montoSemestral }
            ]}
          />
          {/* Dates and aditional info */}
          <InputForm name="fchInicioContrato" control={control} label="F. Inicio contrato" type="date" error={errors.fchInicioContrato} />
          <InputForm name="fchTerminoContrato" control={control} label="F. Termino contrato" type="date" error={errors.fchTerminoContrato} />
          <InputForm name="proyectoServicio" control={control} label="Proyecto/Servicio" error={errors.proyectoServicio} />
          <InputForm name="objetoContrato" control={control} label="Objeto del contrato" error={errors.objetoContrato} />
          {/* SUNAT */}
          <h3>Declaración en SUNAT (*)</h3>
          <DropdownForm name="declararSunat" control={control} label="¿Declarado en SUNAT?" error={errors.declararSunat}
            options={[{ value: 1, label: "Sí" }, { value: 2, label: "No" }]}
          />
          <DropdownForm name="idSedeDeclarar" control={control} label="Sede a declarar" error={errors.idSedeDeclarar}
            options={sedeSunatList.map((sede) => ({ value: sede.idSede, label: sede.nombre }))}
          />
          {/* Form options */}
          <hr />
          <div className="flex justify-center gap-4">
            <button type="button" className="w-40 bg-slate-600 rounded-lg text-white py-2 hover:bg-slate-500" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`w-40 rounded-lg text-white py-2 ${isDirty ? "bg-green-700 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
              disabled={!isDirty || isSubmitted}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PantallaIngreso;
